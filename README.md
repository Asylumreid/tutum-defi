# Tutum Financial Lending Smart Contract

**Introduction**

Tutum Financial is a hybrid lending fintech bridging the gap between Web3 and real-world SME (Small and Medium-sized Enterprise) lending. We address a $60 billion total addressable market by offering a unique investment opportunity with high-margin returns and quick repayment cycles.

**Lending on Tutum Financial**

Start earning today with Tutum Financial's innovative lending platform. We offer a 19% APY for lenders with a 3-month lock period, providing a stable and attractive return on your investment.

**Key Features:**

*   **Traditional Finance Integration:** We bridge the gap between blockchain technology and established SME lending practices.
*   **High Margin Returns:** Earn up to 33% annual returns through pro-rated interest earned on SME loans.
*   **Quick Repayment Cycles:** Loan tenures are capped at 3 months, allowing for faster returns on your investment.

**How It Works:**

1.  **Connect Wallet:** Connect your Web3 wallet (e.g., MetaMask) to begin participating in SME lending.
2.  **Deposit USDT:** Invest between 3,000 and 10,000 USDT in the lending pool.
3.  **90-Day Lock Period:** Your funds are locked for 90 days while being deployed for SME loans.
4.  **Earn 19% APY:** Earn stable returns through tokenized SME loan interest.

**Security Features:**

Your assets are protected by industry-leading security measures:

*   **Regulated Operation:** Tutum Financial is licensed and regulated under MAS (Monetary Authority of Singapore).
*   **Risk Assessment:** We employ a thorough SME loan evaluation and risk management process.
*   **On-Chain Transparency:** All loan tokenization and transactions are visible and verifiable on the blockchain.

**Smart Contract Functionalities:**

This section details the functions within the smart contract that power the lending platform.

*   **Lending:**
    *   `deposit(uint256 _amount)`: Allows users to deposit USDT tokens.
    *   `getLenderInfo(address _lender)`: Retrieves deposit details, deposit time, and pending rewards for a lender.
    *   `updateRewards(address _lender)`: Manually updates lender rewards.
    *   `withdraw(uint256 _amount)`: Allows users to withdraw deposited funds.
*   **Borrowing:**
    *   `createLoan(address _borrower, uint256 _amount, uint256 _duration)`: Creates a new loan with specified parameters.
    *   `getLoan(uint256 _loanId)`: Retrieves details of a specific loan.
    *   `repayLoan(uint256 _loanId)`: Allows borrowers to repay their loans.
    *   `cancelLoan(uint256 _loanId)`: Allows for loan cancellation (implementation details may vary).
*   **Management & Configuration:**
    *   `withdrawFees()`: Manages fee withdrawals (implementation-specific).
    *   `setUSDT(address _newUSDT)`: Sets the address of the USDT token contract.
    *   Various functions related to access control and roles: `grantRole`, `hasRole`, `revokeRole`, `renounceRole`, `getRoleAdmin`, `ADMIN_ROLE`, `LOAN_MANAGER_ROLE`, `FEE_COLLECTOR_ROLE`, `DEFAULT_ADMIN_ROLE`.
    *   Configuration parameters: `ANNUAL_INTEREST_RATE`, `BASIS_POINTS`, `LENDER_APY`, `MAX_LOAN_AMOUNT`, `MAX_LOAN_DURATION`, `MIN_LOAN_AMOUNT`, `PLATFORM_FEE`.
*   **Data Retrieval:**
    *   `getBorrowerLoans(address _borrower)`: Retrieves loans associated with a borrower.
    *   `lenders(address)`: Returns information about a lender, including deposit amount, time, lock status, and accumulated rewards.
    *   `loans(uint256)`: Returns information about a specific loan.
    *   `accumulatedFees()`: Returns the accumulated platform fees.
    * `totalDeposits()`: Returns the total amount of USDT deposited in the contract.
    * `totalLoans()`: Returns the total number of loans created.
    * `loanIdCounter()`: Returns the current loan ID counter.
    * `getLockStatus(address _lender)`: Returns the lock status of a lender.
    * `usdt()`: Returns the address of the USDT contract.

**Contract Events:**

The contract emits the following events:

*   `Deposited`, `Withdrawn`, `LoanCreated`, `LoanRepaid`, `LoanCancelled`, `FeesWithdrawn`, `RewardsClaimed`, `RoleAdminChanged`, `RoleGranted`, `RoleRevoked`, `TransferFromAttempt`, `DepositAttempted`, `DepositResult`.
