// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RentalAgreement.sol";

contract RentalFactory {
    // ==================
    // STATE VARIABLES
    // ==================
    address public owner;

    struct AgreementInfo {
        address contractAddress;
        address landlord;
        address tenant;
        string propertyId;
        string propertyTitle;
        uint256 rentAmount;
        uint256 depositAmount;
        uint256 createdAt;
        bool isActive;
    }

    // All agreements
    AgreementInfo[] public allAgreements;

    // Landlord → their agreements
    mapping(address => address[]) public landlordAgreements;

    // Tenant → their agreements
    mapping(address => address[]) public tenantAgreements;

    // PropertyId → agreement address
    mapping(string => address) public propertyAgreement;

    // ==================
    // EVENTS
    // ==================
    event AgreementCreated(
        address indexed contractAddress,
        address indexed landlord,
        address indexed tenant,
        string propertyId,
        uint256 rentAmount
    );

    // ==================
    // CONSTRUCTOR
    // ==================
    constructor() {
        owner = msg.sender;
    }

    // ==================
    // CREATE AGREEMENT
    // ==================
    function createAgreement(
        address _landlord,
        address _tenant,
        uint256 _rentAmount,
        uint256 _depositAmount,
        uint256 _durationDays,
        uint256 _rentDueDay,
        string memory _propertyId,
        string memory _propertyTitle
    ) external returns (address) {
        RentalAgreement agreement = new RentalAgreement(
            _landlord,
            _tenant,
            _rentAmount,
            _depositAmount,
            _durationDays,
            _rentDueDay,
            _propertyId,
            _propertyTitle
        );

        address contractAddress = address(agreement);

        allAgreements.push(
            AgreementInfo({
                contractAddress: contractAddress,
                landlord: _landlord,
                tenant: _tenant,
                propertyId: _propertyId,
                propertyTitle: _propertyTitle,
                rentAmount: _rentAmount,
                depositAmount: _depositAmount,
                createdAt: block.timestamp,
                isActive: true
            })
        );

        landlordAgreements[_landlord].push(contractAddress);
        tenantAgreements[_tenant].push(contractAddress);
        propertyAgreement[_propertyId] = contractAddress;

        emit AgreementCreated(
            contractAddress,
            _landlord,
            _tenant,
            _propertyId,
            _rentAmount
        );

        return contractAddress;
    }

    // ==================
    // VIEW FUNCTIONS
    // ==================
    function getLandlordAgreements(
        address _landlord
    ) external view returns (address[] memory) {
        return landlordAgreements[_landlord];
    }

    function getTenantAgreements(
        address _tenant
    ) external view returns (address[] memory) {
        return tenantAgreements[_tenant];
    }

    function getPropertyAgreement(
        string memory _propertyId
    ) external view returns (address) {
        return propertyAgreement[_propertyId];
    }

    function getAllAgreements() external view returns (AgreementInfo[] memory) {
        return allAgreements;
    }

    function getTotalAgreements() external view returns (uint256) {
        return allAgreements.length;
    }
}
