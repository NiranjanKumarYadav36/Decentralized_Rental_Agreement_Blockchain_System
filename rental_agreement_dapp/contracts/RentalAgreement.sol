// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RentalAgreement {

    // ==================
    // STATE VARIABLES
    // ==================

    address public landlord;
    address public tenant;
    uint256 public rentAmount;        // in wei
    uint256 public depositAmount;     // in wei
    uint256 public agreementStart;
    uint256 public agreementEnd;
    uint256 public rentDueDay;        // day of month rent is due
    bool public isActive;
    bool public depositReturned;

    // ==================
    // RENT TRACKING
    // ==================

    uint256 public totalRentPaid;
    uint256 public lastRentPaid;

    // ==================
    // EVENTS
    // ==================

    event AgreementSigned(
        address indexed landlord,
        address indexed tenant,
        uint256 rentAmount,
        uint256 depositAmount
    );

    event RentPaid(
        address indexed tenant,
        uint256 amount,
        uint256 timestamp
    );

    event DepositReturned(
        address indexed tenant,
        uint256 amount
    );

    event AgreementTerminated(
        address indexed terminatedBy,
        uint256 timestamp
    );

    event DisputeRaised(
        address indexed raisedBy,
        string reason,
        uint256 timestamp
    );

    // ==================
    // DISPUTE TRACKING
    // ==================

    bool public disputeActive;
    string public disputeReason;

    // ==================
    // CONSTRUCTOR
    // ==================

    constructor(
        address _tenant,
        uint256 _rentAmount,
        uint256 _depositAmount,
        uint256 _agreementDurationDays,
        uint256 _rentDueDay
    ) {
        landlord = msg.sender;
        tenant = _tenant;
        rentAmount = _rentAmount;
        depositAmount = _depositAmount;
        agreementStart = block.timestamp;
        agreementEnd = block.timestamp + 
            (_agreementDurationDays * 1 days);
        rentDueDay = _rentDueDay;
        isActive = false;
        depositReturned = false;
        disputeActive = false;
    }

    // ==================
    // MODIFIERS
    // ==================

    modifier onlyLandlord() {
        require(msg.sender == landlord, 
            "Only landlord can call this");
        _;
    }

    modifier onlyTenant() {
        require(msg.sender == tenant, 
            "Only tenant can call this");
        _;
    }

    modifier agreementIsActive() {
        require(isActive, 
            "Agreement is not active yet");
        _;
    }

    modifier noActiveDispute() {
        require(!disputeActive, 
            "Resolve dispute first");
        _;
    }

    // ==================
    // MAIN FUNCTIONS
    // ==================

    // Tenant signs agreement by sending deposit
    function signAgreement() external payable onlyTenant {
        require(!isActive, 
            "Agreement already active");
        require(msg.value == depositAmount, 
            "Send exact deposit amount");

        isActive = true;

        emit AgreementSigned(
            landlord,
            tenant,
            rentAmount,
            depositAmount
        );
    }

    // Tenant pays monthly rent
    function payRent() external payable 
        onlyTenant 
        agreementIsActive 
        noActiveDispute 
    {
        require(msg.value == rentAmount, 
            "Send exact rent amount");
        require(block.timestamp <= agreementEnd, 
            "Agreement has expired");

        totalRentPaid += msg.value;
        lastRentPaid = block.timestamp;

        // Transfer rent to landlord immediately
        payable(landlord).transfer(msg.value);

        emit RentPaid(tenant, msg.value, block.timestamp);
    }

    // Terminate agreement and return deposit
    function terminateAgreement() external 
        agreementIsActive 
        noActiveDispute 
    {
        require(
            msg.sender == landlord || 
            msg.sender == tenant,
            "Not authorized"
        );
        require(block.timestamp >= agreementEnd,
            "Agreement period not ended yet");

        isActive = false;

        // Return deposit to tenant
        if(!depositReturned) {
            depositReturned = true;
            payable(tenant).transfer(depositAmount);
            emit DepositReturned(tenant, depositAmount);
        }

        emit AgreementTerminated(
            msg.sender, 
            block.timestamp
        );
    }

    // Raise a dispute
    function raiseDispute(string memory _reason) 
        external 
        agreementIsActive 
    {
        require(
            msg.sender == landlord || 
            msg.sender == tenant,
            "Not authorized"
        );
        require(!disputeActive, 
            "Dispute already active");

        disputeActive = true;
        disputeReason = _reason;

        emit DisputeRaised(
            msg.sender, 
            _reason, 
            block.timestamp
        );
    }

    // Landlord resolves dispute
    function resolveDispute(bool _returnDeposit) 
        external 
        onlyLandlord 
    {
        require(disputeActive, 
            "No active dispute");

        disputeActive = false;
        disputeReason = "";

        if(_returnDeposit && !depositReturned) {
            depositReturned = true;
            payable(tenant).transfer(depositAmount);
            emit DepositReturned(tenant, depositAmount);
        }
    }

    // ==================
    // VIEW FUNCTIONS
    // ==================

    function getAgreementDetails() external view returns (
        address _landlord,
        address _tenant,
        uint256 _rentAmount,
        uint256 _depositAmount,
        uint256 _agreementEnd,
        bool _isActive,
        uint256 _totalRentPaid,
        bool _disputeActive
    ) {
        return (
            landlord,
            tenant,
            rentAmount,
            depositAmount,
            agreementEnd,
            isActive,
            totalRentPaid,
            disputeActive
        );
    }

    function getContractBalance() 
        external view returns (uint256) {
        return address(this).balance;
    }
}