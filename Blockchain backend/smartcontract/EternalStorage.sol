pragma solidity ^0.4.26;

/**
 * @title EternalStorage
 * @dev This contract holds all the necessary state variables to carry out the storage of any contract.
 */
contract EternalStorage {

  
    struct Claim {
        uint256 topic;
        address issuer; // msg.sender
        bytes signature; // this.address + topic + data
        string personalHash;
        string[] clauses;
        string[] conditions;
        uint256[] initTimeStamp;
        uint256[] endTimeStamp;
        uint256[] status;
        uint256 signatureStatus;
        uint256 num_signers;
        address[] signers;
    }

    address public root; // Owner of the contract, the creator
    
    mapping (bytes32 => Claim) public claims;
    mapping (uint256 => bytes32[]) public senders;
    mapping (address => bool) public administrators;
    mapping (bytes32 => mapping (address => bool)) public allowanceSigners;
    mapping (bytes32 => mapping (address => bool)) public allowanceEnterprise;
  
  mapping(bytes32 => uint256) internal uintStorage;
  mapping(bytes32 => string) internal stringStorage;
  mapping(bytes32 => address) internal addressStorage;
  mapping(bytes32 => bytes) internal bytesStorage;
  mapping(bytes32 => bool) internal boolStorage;
  mapping(bytes32 => int256) internal intStorage;

}