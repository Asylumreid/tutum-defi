// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/TutumLending.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 10000000e18);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

contract TutumLendingTest is Test {
    TutumLending public lending;
    MockUSDT public usdt;
    
    address public admin = address(this);
    address public lender = address(0x1);
    address public borrower = address(0x2);
    address public feeCollector = address(0x3);
    address public unauthorized = address(0x4);
    
    // Events
    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount, uint256 rewards);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanCancelled(uint256 indexed loanId, address indexed borrower);
    event FeesWithdrawn(address indexed collector, uint256 amount);
    
    function setUp() public {
        // Deploy contracts
        usdt = new MockUSDT();
        lending = new TutumLending(address(usdt));
        
        // Set up fee collector role
        lending.grantRole(lending.FEE_COLLECTOR_ROLE(), feeCollector);
        
        // Fund accounts
        usdt.transfer(lender, 100000e18);
        usdt.transfer(borrower, 10000e18);
        
        // Approve spending
        vm.startPrank(lender);
        usdt.approve(address(lending), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(borrower);
        usdt.approve(address(lending), type(uint256).max);
        vm.stopPrank();
    }
    
    // Role Tests
    function testRoleSetup() public view {
        // Verify admin has all roles
        assertTrue(lending.hasRole(lending.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(lending.hasRole(lending.ADMIN_ROLE(), admin));
        assertTrue(lending.hasRole(lending.LOAN_MANAGER_ROLE(), admin));
        assertTrue(lending.hasRole(lending.FEE_COLLECTOR_ROLE(), admin));
        
        // Verify other accounts don't have admin roles
        assertFalse(lending.hasRole(lending.ADMIN_ROLE(), feeCollector));
        assertFalse(lending.hasRole(lending.LOAN_MANAGER_ROLE(), feeCollector));
    }
    
    // Deposit Tests
    function testInitialDeposit() public {
        // Initial deposit test
        uint256 depositAmount = 1000e18;
        
        vm.startPrank(lender);
        
        vm.expectEmit(true, false, false, true);
        emit Deposited(lender, depositAmount);
        
        lending.deposit(depositAmount);
        
        (uint256 amount, uint256 depositTime, uint256 pendingRewards) = lending.getLenderInfo(lender);
        assertEq(amount, depositAmount);
        assertGt(depositTime, 0);
        
        vm.stopPrank();
    }
    
    function testMultipleDeposits() public {
        // Multiple deposits test
        vm.startPrank(lender);
        
        uint256 firstDeposit = 1000e18;
        uint256 secondDeposit = 500e18;
        
        lending.deposit(firstDeposit);
        lending.deposit(secondDeposit);
        
        (uint256 totalAmount,,) = lending.getLenderInfo(lender);
        assertEq(totalAmount, firstDeposit + secondDeposit);
        
        vm.stopPrank();
    }
    
    function testFailZeroDeposit() public {
        vm.prank(lender);
        lending.deposit(0);
    }
    
    // Loan Tests
    function testCreateLoan() public {
        // First deposit funds
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanAmount = 3000e18;
        uint256 duration = 90 days;
        
        vm.expectEmit(true, true, false, true);
        emit LoanCreated(0, borrower, loanAmount, duration);
        
        uint256 loanId = lending.createLoan(borrower, loanAmount, duration);
        
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        assertEq(loan.borrower, borrower);
        assertEq(loan.amount, loanAmount);
        assertTrue(loan.isActive);
        assertFalse(loan.isRepaid);
        assertFalse(loan.isCancelled);
        assertGt(loan.interest, 0);
    }
    
    function testLoanInterestCalculation() public {
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanAmount = 3000e18;
        uint256 duration = 90 days;
        
        uint256 loanId = lending.createLoan(borrower, loanAmount, duration);
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        
        // Calculate expected interest (33% annual rate for 90 days)
        uint256 expectedInterest = (loanAmount * lending.ANNUAL_INTEREST_RATE() * duration) / (365 days * lending.BASIS_POINTS());
        assertEq(loan.interest, expectedInterest);
    }
    
    function testFailInsufficientLiquidity() public {
        // Try to create loan without deposits
        lending.createLoan(borrower, 3000e18, 90 days);
    }
    
    function testFailUnauthorizedLoanCreation() public {
        vm.prank(unauthorized);
        lending.createLoan(borrower, 3000e18, 90 days);
    }
    
    // Repayment Tests
    function testLoanRepayment() public {
        // Setup
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanAmount = 3000e18;
        uint256 loanId = lending.createLoan(borrower, loanAmount, 90 days);
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        
        // Ensure borrower has enough for repayment
        uint256 totalRepayment = loan.amount + loan.interest;
        deal(address(usdt), borrower, totalRepayment);
        
        vm.startPrank(borrower);
        usdt.approve(address(lending), totalRepayment);
        
        vm.expectEmit(true, true, false, true);
        emit LoanRepaid(loanId, borrower, totalRepayment);
        
        lending.repayLoan(loanId);
        vm.stopPrank();
        
        loan = lending.getLoan(loanId);
        assertFalse(loan.isActive);
        assertTrue(loan.isRepaid);
    }
    
    // Lock Period Tests
    function testWithdrawAfterLockPeriod() public {
        uint256 depositAmount = 1000e18;
        
        vm.startPrank(lender);
        lending.deposit(depositAmount);
        
        // Move to end of lock period
        vm.warp(block.timestamp + 90 days);
        
        // Add rewards to contract
        (,, uint256 pendingRewards) = lending.getLenderInfo(lender);
        deal(address(usdt), address(lending), depositAmount + pendingRewards);
        
        lending.withdraw(depositAmount);
        
        (uint256 remainingAmount,,) = lending.getLenderInfo(lender);
        assertEq(remainingAmount, 0);
        
        vm.stopPrank();
    }
    
    function testFailWithdrawDuringLockPeriod() public {
        vm.startPrank(lender);
        lending.deposit(1000e18);
        
        // Try to withdraw at 89 days
        vm.warp(block.timestamp + 89 days);
        lending.withdraw(1000e18);
        
        vm.stopPrank();
    }
    
    // Fee Collection Tests
    function testFeeCollection() public {
        // Setup and create loan
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanId = lending.createLoan(borrower, 3000e18, 90 days);
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        
        // Move to end of loan period
        vm.warp(block.timestamp + 90 days);
        
        // Repay loan
        uint256 totalRepayment = loan.amount + loan.interest;
        deal(address(usdt), borrower, totalRepayment);
        
        vm.startPrank(borrower);
        usdt.approve(address(lending), totalRepayment);
        lending.repayLoan(loanId);
        vm.stopPrank();
        
        // Calculate and verify fee
        uint256 expectedFee = (loan.interest * lending.PLATFORM_FEE()) / lending.BASIS_POINTS();
        assertTrue(expectedFee > 0);
        
        vm.startPrank(feeCollector);
        uint256 balanceBefore = usdt.balanceOf(feeCollector);
        lending.withdrawFees();
        uint256 balanceAfter = usdt.balanceOf(feeCollector);
        vm.stopPrank();
        
        assertEq(balanceAfter - balanceBefore, expectedFee);
    }
    
    function testFailUnauthorizedFeeWithdrawal() public {
        vm.prank(unauthorized);
        lending.withdrawFees();
    }
    
    // Loan Cancellation Tests
    function testLoanCancellation() public {
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanId = lending.createLoan(borrower, 3000e18, 90 days);
        
        vm.expectEmit(true, true, false, true);
        emit LoanCancelled(loanId, borrower);
        
        lending.cancelLoan(loanId);
        
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        assertFalse(loan.isActive);
        assertTrue(loan.isCancelled);
    }
    
    function testFailCancelRepaidLoan() public {
        // Setup and create loan
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanId = lending.createLoan(borrower, 3000e18, 90 days);
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        
        // Repay loan
        deal(address(usdt), borrower, loan.amount + loan.interest);
        vm.startPrank(borrower);
        usdt.approve(address(lending), loan.amount + loan.interest);
        lending.repayLoan(loanId);
        vm.stopPrank();
        
        // Try to cancel repaid loan
        lending.cancelLoan(loanId);
    }
    
    function testFailUnauthorizedLoanCancellation() public {
        vm.prank(lender);
        lending.deposit(10000e18);
        
        uint256 loanId = lending.createLoan(borrower, 3000e18, 90 days);
        
        vm.prank(unauthorized);
        lending.cancelLoan(loanId);
    }

    function testInterestCalculation() public {
        // Setup test values
        uint256 loanAmount = 3000e18;  // 3000 USDT
        uint256 duration = 90 days;
        
        // First make deposit to cover the loan
        vm.prank(lender);
        lending.deposit(10000e18);
        
        // Create loan
        uint256 loanId = lending.createLoan(borrower, loanAmount, duration);
        TutumLending.Loan memory loan = lending.getLoan(loanId);
        
        // Calculate expected interest using the same formula as the contract
        uint256 expectedInterest = (loanAmount * 3300 * duration) / (365 days * 10000);
        
        assertEq(loan.interest, expectedInterest, "Interest calculation mismatch");
        assertTrue(loan.interest > 0, "Interest should be greater than 0");
    }
}