pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;

import './EternalStorage.sol';

contract ERC735 is EternalStorage{

    event ClaimRequested(uint256 indexed claimRequestId, uint256 indexed topic, address indexed issuer, bytes signature, string[] clauses, string[] conditions);
    event ContractSigned(bytes32 indexed claimId, string[] clauses, string[] conditions, uint256[] initTimeStamp, uint256[] endTimeStamp, uint256[] status, address signer);
    event ClaimAdded(bytes32 indexed claimId, uint256 indexed topic, address indexed issuer, bytes signature, string [] clauses, string[] conditions);
    event GenericClaimAdded(bytes32 indexed claimId, uint256 indexed topic, bytes signature, string [] clauses, string[] conditions);
    event ClaimRemoved(bytes32 indexed claimId, uint256 indexed topic, address indexed issuer, bytes signature, string[] clauses, string[] conditions);
    event nueva(uint256 numero);
    event NewContract(address sender);


    constructor() public {
        root = msg.sender;
        administrators[root] = true;
        emit NewContract(msg.sender);
    }

    function initialize(address owner) public {
        require(!initialized());
        root = owner;
        administrators[root] = true;
        emit NewContract(owner);
        boolStorage[keccak256('v0_initialized')] = true;
    }

    function initialized() public view returns (bool) {
        return boolStorage[keccak256('v0_initialized')];
    }

    /* Modifier to check the sender is root */
    modifier onlyRoot() {
        require(root == msg.sender, 'Must be root');
        _;
    }

    /* Modifier to check the sender is an admin */
    modifier onlyAdmin() {
        require(administrators[msg.sender], 'Must be an adminitrator of the contract');
        _;
    }

    modifier onlyAllowanceSigner(bytes32 _claimId) {
        require(allowanceSigners[_claimId][msg.sender], 'Must be an adminitrator of the contract');
        _;
    }


    modifier onlyAllowanceEnterprise(bytes32 _claimId){
        require(allowanceEnterprise[_claimId][msg.sender], 'Must be an allowance Enterprise');
        _;
    }

    /**
     * Transfers the ownership of the smart contract.
     * @param _address The address to transfer the ownership.
     */
    function transferRoot(address _address) public onlyRoot {
        root = _address;
        administrators[_address] = true;
    }


    /**
     * Grants administration permissions on the smart contract.
     * @param _address The account address.
     */
    function grantAdmin(address _address) public onlyRoot {
        require(!administrators[_address], 'The user is already an administrator.');
        administrators[_address] = true;
    }

    /**
     * Revokes administation permissions.
     * @param _address The account address.
     */
    function revokeAdmin(address _address) public onlyRoot {
        require(administrators[_address], 'The user is not an administrator.');
        require(root != _address, 'Root cannot be revoked from administrator role.');
        administrators[_address] = false;
    }



    function grantAllowanceSigner(bytes32 _claimId, address _address) public onlyAllowanceEnterprise(_claimId) {
        allowanceSigners[_claimId][_address] = true;
        claims[_claimId].num_signers = claims[_claimId].num_signers + 1;
    }

    function revokeAllowanceSigner(bytes32 _claimId, address _address) public onlyAllowanceEnterprise(_claimId) {
        allowanceSigners[_claimId][_address] = false;
    }

    function nueva_fun (uint256 _entrada) public returns (uint256 entrada){
        emit nueva(_entrada);

        return _entrada;
    }

    function getClaim(bytes32 _claimId) public view returns(uint256 topic, address issuer, bytes memory signature, string personalHash, string[] memory clauses, string[] memory conditions, uint256[] memory initTimeStamp, uint256[] memory endTimeStamp, uint256[] memory status, uint256 num_signers, address[] signers){
        Claim memory u = claims[_claimId];
        return (
            u.topic,
            u.issuer,
            u.signature,
            u.personalHash,
            u.clauses,
            u.conditions,
            u.initTimeStamp,
            u.endTimeStamp,
            u.status,
            u.num_signers,
            u.signers
        );
    }

    function addClaimProveedor (uint256 _topic, bytes memory _signature, string[] _clauses, string[] memory _conditions, uint256[] memory _initTimeStamp, uint256[] memory _endTimeStamp, uint256[] memory _status, uint256 _sender) public onlyAdmin returns (bytes32 claimRequestId){
        bytes32 claimId = keccak256(abi.encodePacked(msg.sender, _sender));
        allowanceEnterprise[claimId][msg.sender] = true;
        claims[claimId].topic = _topic;
        claims[claimId].signature = _signature;
        claims[claimId].clauses = _clauses;
        claims[claimId].conditions = _conditions;
        claims[claimId].initTimeStamp = _initTimeStamp;
        claims[claimId].endTimeStamp = _endTimeStamp;
        claims[claimId].status = _status;

        senders[_sender].push(claimId);

        emit GenericClaimAdded(claimId, _topic, _signature, _clauses, _conditions);

        return claimId;
    }

    function addClaimApoderado(bytes32 _genericClaimId, address _issuer, string _personalHash, string[] _clauses, string[] memory _conditions, uint256[] memory _initTimeStamp, uint256[] memory _endTimeStamp, uint256[] memory _status,  uint256 _sender, address[] _signers) public onlyAdmin returns (bytes32 claimRequestId){
        bytes32 claimId = keccak256(abi.encodePacked(_issuer, _sender));
        allowanceEnterprise[claimId][msg.sender] = true;
        claims[claimId].topic = claims[_genericClaimId].topic;
        claims[claimId].issuer = _issuer;
        claims[claimId].signature = claims[_genericClaimId].signature;
        claims[claimId].personalHash = _personalHash;
        claims[claimId].clauses = claims[_genericClaimId].clauses;
        claims[claimId].conditions = claims[_genericClaimId].conditions;
        claims[claimId].initTimeStamp = claims[_genericClaimId].initTimeStamp;
        claims[claimId].endTimeStamp = claims[_genericClaimId].endTimeStamp;
        claims[claimId].status = claims[_genericClaimId].status;

        for (uint i = 0; i < _clauses.length; i++) {
            claims[claimId].clauses.push(_clauses[i]);
        }

        for (i = 0; i < _conditions.length; i++) {
            claims[claimId].conditions.push(_conditions[i]);
            claims[claimId].initTimeStamp.push(_initTimeStamp[i]);
            claims[claimId].endTimeStamp.push(_endTimeStamp[i]);
            claims[claimId].status.push(_status[i]);
        }


        if(_signers.length != 0){
            for (i = 0; i < _signers.length; i++) {
                allowanceSigners[claimId][_signers[i]] = true;
                claims[claimId].num_signers = claims[claimId].num_signers + 1;
            }
            claims[claimId].signatureStatus = 0;
        }



        emit ClaimAdded(claimId, claims[claimId].topic, _issuer, claims[claimId].signature, _clauses, _conditions);

        return claimId;
    }


    function addClaim(uint256 _topic, address _issuer, bytes memory _signature, string _personalHash, string[] _clauses, string[] memory _conditions, uint256[] memory _initTimeStamp, uint256[] memory _endTimeStamp, uint256[] memory _status,  uint256 _sender, address[] _signers) public onlyAdmin returns (bytes32 claimRequestId){
        bytes32 claimId = keccak256(abi.encodePacked(_issuer, _sender));
        allowanceEnterprise[claimId][msg.sender] = true;
        claims[claimId].topic = _topic;
        claims[claimId].issuer = _issuer;
        claims[claimId].signature = _signature;
        claims[claimId].personalHash = _personalHash;
        claims[claimId].clauses = _clauses;
        claims[claimId].conditions = _conditions;
        claims[claimId].initTimeStamp = _initTimeStamp;
        claims[claimId].endTimeStamp = _endTimeStamp;
        claims[claimId].status = _status;

        senders[_sender].push(claimId);

        if(_signers.length != 0){
            for (uint256 i = 0; i < _signers.length; i++) {
                allowanceSigners[claimId][_signers[i]] = true;
                claims[claimId].num_signers = claims[claimId].num_signers + 1;
            }
            claims[claimId].signatureStatus = 0;
        }



        emit ClaimAdded(claimId, _topic, _issuer, _signature, _clauses, _conditions);

        return claimId;
    }


    function removeClaim(bytes32 _claimId) public onlyAllowanceEnterprise(_claimId) returns (bool success){

        emit ClaimRemoved(
            _claimId,
            claims[_claimId].topic,
            claims[_claimId].issuer,
            claims[_claimId].signature,
            claims[_claimId].clauses,
            claims[_claimId].conditions
        );

        delete claims[_claimId];
        return true;
    }

    function getCondition(bytes32 _claimId, uint256 _conditionId) public view returns (string memory condition, uint256 initTimeStamp, uint256 endTimeStamp, uint256 status) {
        return (claims[_claimId].conditions[_conditionId], claims[_claimId].initTimeStamp[_conditionId], claims[_claimId].endTimeStamp[_conditionId], claims[_claimId].status[_conditionId]);
    }

    function changeConditionStatus(bytes32 _claimId, uint256 _conditionId, uint256 _status) public onlyAllowanceEnterprise(_claimId) returns (bool success){
        claims[_claimId].status[_conditionId] = _status;
        return true;
    }

    function signClaim(bytes32 _claimId) public onlyAllowanceSigner(_claimId) returns (bool success){
        claims[_claimId].signers.push(msg.sender);
        emit ContractSigned(_claimId, claims[_claimId].clauses, claims[_claimId].conditions, claims[_claimId].initTimeStamp, claims[_claimId].endTimeStamp, claims[_claimId].status, msg.sender);
        if (claims[_claimId].signatureStatus == claims[_claimId].signers.length) {
            claims[_claimId].signatureStatus = 1;
        }
        return true;
    }


    function changeClaimCondition(bytes32 _claimId, uint256 _conditionId, string memory _condition, uint256 _initTimeStamp, uint256 _endTimeStamp, uint256 _status) public onlyAllowanceEnterprise(_claimId) returns (bool success){
        bytes memory stringTemp = bytes(_condition);
        if (stringTemp.length != 0) {
            claims[_claimId].conditions[_conditionId] = _condition;
            claims[_claimId].status[_conditionId] = _status;
            claims[_claimId].signatureStatus = 0;
        }

        if (_initTimeStamp != 0){
            claims[_claimId].initTimeStamp[_conditionId] = _initTimeStamp;
            claims[_claimId].status[_conditionId] = _status;
            claims[_claimId].signatureStatus = 0;
        }

        if (_endTimeStamp != 0){
            claims[_claimId].endTimeStamp[_conditionId] = _endTimeStamp;
            claims[_claimId].status[_conditionId] = _status;
            claims[_claimId].signatureStatus = 0;
        }

        return true;
    }

    function changeClaim(string _personalHash, bytes32 _claimId, string[] _clauses, string[] memory _conditions, uint256[] memory _initTimeStamp, uint256[] memory _endTimeStamp, uint256[] memory _status) public onlyAllowanceEnterprise(_claimId) returns (bool success){
        claims[_claimId].personalHash = _personalHash;
        claims[_claimId].clauses = _clauses;
        claims[_claimId].conditions = _conditions;
        claims[_claimId].initTimeStamp = _initTimeStamp;
        claims[_claimId].endTimeStamp = _endTimeStamp;
        claims[_claimId].status = _status;
        claims[_claimId].signatureStatus = 0;

        return true;
    }

    function getTimestampForContract(bytes32 _claimId) public view returns (uint256[] memory _initTimeStamp, uint256[] memory _endTimeStamp, uint256[] memory _status, uint256 time){
        Claim memory u = claims[_claimId];
        return (
            u.initTimeStamp,
            u.endTimeStamp,
            u.status,
            now
        );
    }
}