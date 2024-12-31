// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TutumLending is ReentrancyGuard, AccessControl {
    IERC20 public usdt;
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant LOAN_MANAGER_ROLE = keccak256("LOAN_MANAGER_ROLE");
    bytes32 public constant FEE_COLLECTOR_ROLE = keccak256("FEE_COLLECTOR_ROLE");
    
    uint256 public constant PLATFORM_FEE = 500; // 5% = 500 basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant ANNUAL_INTEREST_RATE = 3300; // 33% = 3300 basis points
    uint256 public constant LENDER_APY = 1000; // 10% APY for lenders
    uint256 public constant MIN_LOAN_AMOUNT = 3000e18; // 3,000 USDT
    uint256 public constant MAX_LOAN_AMOUNT = 10000e18; // 10,000 USDT
    uint256 public constant MAX_LOAN_DURATION = 90 days; // 3 months

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interest;
        uint256 startTime;
        uint256 duration;
        bool isActive;
        bool isRepaid;
        bool isCancelled;
    }

    struct LenderInfo {
        uint256 depositAmount;
        uint256 depositTime;
        uint256 lockEndTime;
        uint256 lastRewardCalculationTime;
        uint256 accumulatedRewards;
        bool isLocked;
    }

    // Mappings
    mapping(address => LenderInfo) public lenders;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    
    uint256 public totalDeposits;
    uint256 public totalLoans;
    uint256 public accumulatedFees;
    uint256 public loanIdCounter;

    // Events
    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount, uint256 rewards);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanCancelled(uint256 indexed loanId, address indexed borrower);
    event RewardsClaimed(address indexed lender, uint256 amount);
    event FeesWithdrawn(address indexed collector, uint256 amount);

    constructor(address _usdt) {
        require(_usdt != address(0), "Invalid USDT address");
        usdt = IERC20(_usdt);
        
        // Setup admin roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(LOAN_MANAGER_ROLE, msg.sender);
        _grantRole(FEE_COLLECTOR_ROLE, msg.sender);
    }
    

    // Lender functions
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer USDT from lender
        require(usdt.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update lender info
        LenderInfo storage lender = lenders[msg.sender];
        
        // If this is not their first deposit, calculate and update rewards first
        if (lender.depositAmount > 0) {
            updateRewards(msg.sender);
        }
        
        lender.depositAmount += _amount;
        if (lender.depositTime == 0) {
            lender.depositTime = block.timestamp;
        }
        lender.lastRewardCalculationTime = block.timestamp;
        lender.lockEndTime = block.timestamp + 90 days; // 3 months lock period
        lender.isLocked = true;
        
        totalDeposits += _amount;
        
        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        LenderInfo storage lender = lenders[msg.sender];
        require(_amount <= lender.depositAmount, "Insufficient balance");
        require(block.timestamp >= lender.lockEndTime, "Funds are still locked");
        require(totalDeposits - totalLoans >= _amount, "Insufficient liquidity");
        
        // Calculate and update rewards before withdrawal
        updateRewards(msg.sender);
        
        uint256 rewards = lender.accumulatedRewards;
        uint256 totalWithdraw = _amount + rewards;
        
        // Update lender info
        lender.depositAmount -= _amount;
        lender.accumulatedRewards = 0;
        if (lender.depositAmount == 0) {
            lender.depositTime = 0;
            lender.isLocked = false;
        }
        lender.lastRewardCalculationTime = block.timestamp;
        
        totalDeposits -= _amount;
        
        // Transfer funds
        require(usdt.transfer(msg.sender, totalWithdraw), "Transfer failed");
        
        emit Withdrawn(msg.sender, _amount, rewards);
    }

    // View function to get lock status
    function getLockStatus(address _lender) external view returns (
        bool isLocked,
        uint256 lockEndTime,
        uint256 timeRemaining
    ) {
        LenderInfo memory lender = lenders[_lender];
        return (
            lender.isLocked,
            lender.lockEndTime,
            lender.lockEndTime > block.timestamp ? lender.lockEndTime - block.timestamp : 0
        );
    }

    // Calculate and update rewards for a lender
    function updateRewards(address _lender) public {
        LenderInfo storage lender = lenders[_lender];
        if (lender.depositAmount == 0) return;

        uint256 timeElapsed = block.timestamp - lender.lastRewardCalculationTime;
        uint256 reward = (lender.depositAmount * LENDER_APY * timeElapsed) / (365 days * BASIS_POINTS);
        
        lender.accumulatedRewards += reward;
        lender.lastRewardCalculationTime = block.timestamp;
    }

    // Admin functions for loan management
    function createLoan(
            address _borrower,
            uint256 _amount,
            uint256 _duration
        ) external onlyRole(LOAN_MANAGER_ROLE) nonReentrant returns (uint256) {
            require(_borrower != address(0), "Invalid borrower address");
            require(_amount >= MIN_LOAN_AMOUNT && _amount <= MAX_LOAN_AMOUNT, "Invalid loan amount");
            require(_duration <= MAX_LOAN_DURATION, "Duration exceeds maximum");
            require(totalDeposits - totalLoans >= _amount, "Insufficient liquidity");
            
            // Calculate interest
            // For precision: multiply everything first, then divide
            // (_amount * ANNUAL_INTEREST_RATE * _duration) / (YEAR_IN_SECONDS * BASIS_POINTS)
            uint256 numerator = _amount * ANNUAL_INTEREST_RATE * _duration;
            uint256 denominator = 365 days * BASIS_POINTS;
            uint256 interest = numerator / denominator;
            
            // Verify interest is non-zero
            require(interest > 0, "Interest calculation error");
            
            // Create loan
            uint256 loanId = loanIdCounter++;
            loans[loanId] = Loan({
                borrower: _borrower,
                amount: _amount,
                interest: interest,
                startTime: block.timestamp,
                duration: _duration,
                isActive: true,
                isRepaid: false,
                isCancelled: false
            });
            
            borrowerLoans[_borrower].push(loanId);
            totalLoans += _amount;
            
            // Transfer USDT to borrower
            require(usdt.transfer(_borrower, _amount), "Transfer failed");
            
            emit LoanCreated(loanId, _borrower, _amount, _duration);
            return loanId;
        }

    function cancelLoan(uint256 _loanId) external onlyRole(LOAN_MANAGER_ROLE) nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan is already repaid");
        require(!loan.isCancelled, "Loan is already cancelled");
        
        loan.isActive = false;
        loan.isCancelled = true;
        totalLoans -= loan.amount;
        
        emit LoanCancelled(_loanId, loan.borrower);
    }

    // Borrower functions
    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan is already repaid");
        require(!loan.isCancelled, "Loan is cancelled");
        require(msg.sender == loan.borrower, "Not the borrower");
        
        uint256 totalRepayment = loan.amount + loan.interest;
        uint256 platformFee = (loan.interest * PLATFORM_FEE) / BASIS_POINTS;
        
        // Transfer repayment amount from borrower
        require(usdt.transferFrom(msg.sender, address(this), totalRepayment), "Transfer failed");
        
        loan.isActive = false;
        loan.isRepaid = true;
        totalLoans -= loan.amount;
        accumulatedFees += platformFee;
        
        // The rest of the interest goes to the lending pool for lender rewards
        
        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }

    function withdrawFees() external onlyRole(FEE_COLLECTOR_ROLE) nonReentrant {
        uint256 fees = accumulatedFees;
        require(fees > 0, "No fees to withdraw");
        
        accumulatedFees = 0;
        require(usdt.transfer(msg.sender, fees), "Transfer failed");
        
        emit FeesWithdrawn(msg.sender, fees);
    }

    // Protocol management functions
    function setUSDT(address _newUSDT) external onlyRole(ADMIN_ROLE) {
        require(_newUSDT != address(0), "Invalid USDT address");
        usdt = IERC20(_newUSDT);
    }

    // View functions
    function getLenderInfo(address _lender) external view returns (
        uint256 depositAmount,
        uint256 depositTime,
        uint256 pendingRewards
    ) {
        LenderInfo memory lender = lenders[_lender];
        
        // Calculate pending rewards
        uint256 timeElapsed = block.timestamp - lender.lastRewardCalculationTime;
        uint256 pendingReward = (lender.depositAmount * LENDER_APY * timeElapsed) / (365 days * BASIS_POINTS);
        
        return (
            lender.depositAmount,
            lender.depositTime,
            lender.accumulatedRewards + pendingReward
        );
    }

    function getLoan(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }
}