// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RentalAgreement {
    // ==================
    // STATE VARIABLES
    // ==================
    address public landlord;
    address public tenant;
    uint256 public rentAmount;
    uint256 public depositAmount;
    uint256 public agreementStart;
    uint256 public agreementEnd;
    uint256 public rentDueDay;
    bool public isActive;
    bool public depositReturned;
    uint256 public totalRentPaid;
    uint256 public lastRentPaid;
    bool public disputeActive;
    string public disputeReason;

    // Property reference
    string public propertyId;
    string public propertyTitle;

    // ==================
    // EVENTS
    // ==================
    event AgreementSigned(
        address indexed landlord,
        address indexed tenant,
        uint256 rentAmount,
        uint256 depositAmount
    );
    event RentPaid(address indexed tenant, uint256 amount, uint256 timestamp);
    event DepositReturned(address indexed tenant, uint256 amount);
    event AgreementTerminated(address indexed terminatedBy, uint256 timestamp);
    event DisputeRaised(
        address indexed raisedBy,
        string reason,
        uint256 timestamp
    );

    // ==================
    // CONSTRUCTOR
    // ==================
    constructor(
        address _landlord,
        address _tenant,
        uint256 _rentAmount,
        uint256 _depositAmount,
        uint256 _agreementDurationDays,
        uint256 _rentDueDay,
        string memory _propertyId,
        string memory _propertyTitle
    ) {
        landlord = _landlord;
        tenant = _tenant;
        rentAmount = _rentAmount;
        depositAmount = _depositAmount;
        agreementStart = block.timestamp;
        agreementEnd =
            block.timestamp +
            (
                _agreementDurationDays == 0
                    ? 1 minutes
                    : _agreementDurationDays * 1 days
            );
        rentDueDay = _rentDueDay;
        propertyId = _propertyId;
        propertyTitle = _propertyTitle;
        isActive = false;
        depositReturned = false;
        disputeActive = false;
    }

    // ==================
    // MODIFIERS
    // ==================
    modifier onlyLandlord() {
        require(msg.sender == landlord, "Only landlord");
        _;
    }
    modifier onlyTenant() {
        require(msg.sender == tenant, "Only tenant");
        _;
    }
    modifier agreementIsActive() {
        require(isActive, "Agreement not active");
        _;
    }
    modifier noActiveDispute() {
        require(!disputeActive, "Resolve dispute first");
        _;
    }

    // ==================
    // MAIN FUNCTIONS
    // ==================
    function signAgreement() external payable onlyTenant {
        require(!isActive, "Already active");
        require(msg.value == depositAmount, "Wrong deposit amount");
        isActive = true;
        emit AgreementSigned(landlord, tenant, rentAmount, depositAmount);
    }

    function payRent()
        external
        payable
        onlyTenant
        agreementIsActive
        noActiveDispute
    {
        require(msg.value == rentAmount, "Wrong rent amount");
        require(block.timestamp <= agreementEnd, "Agreement expired");
        totalRentPaid += msg.value;
        lastRentPaid = block.timestamp;
        payable(landlord).transfer(msg.value);
        emit RentPaid(tenant, msg.value, block.timestamp);
    }

    function terminateAgreement() external agreementIsActive noActiveDispute {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "Not authorized"
        );
        require(block.timestamp >= agreementEnd, "Agreement period not ended");
        isActive = false;
        if (!depositReturned) {
            depositReturned = true;
            payable(tenant).transfer(depositAmount);
            emit DepositReturned(tenant, depositAmount);
        }
        emit AgreementTerminated(msg.sender, block.timestamp);
    }

    function raiseDispute(string memory _reason) external agreementIsActive {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "Not authorized"
        );
        require(!disputeActive, "Dispute already active");
        disputeActive = true;
        disputeReason = _reason;
        emit DisputeRaised(msg.sender, _reason, block.timestamp);
    }

    function resolveDispute(bool _returnDeposit) external onlyLandlord {
        require(disputeActive, "No active dispute");
        disputeActive = false;
        disputeReason = "";
        if (_returnDeposit && !depositReturned) {
            depositReturned = true;
            payable(tenant).transfer(depositAmount);
            emit DepositReturned(tenant, depositAmount);
        }
    }

    // ==================
    // VIEW FUNCTIONS
    // ==================
    function getAgreementDetails()
        external
        view
        returns (
            address _landlord,
            address _tenant,
            uint256 _rentAmount,
            uint256 _depositAmount,
            uint256 _agreementEnd,
            bool _isActive,
            uint256 _totalRentPaid,
            bool _disputeActive
        )
    {
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

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
