//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CryptoMarriage is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Persons
    struct Person {
       address addr;
       string  name;
       bool ido;
    } 

    // Witnesses
    struct Witness {
        address addr;
        string name;
        uint blockNumber;
    }

    // Persons (to be married)
    Person[2] public persons;

    // Witnesses
    mapping (address => Witness) private witnessMap;
    Witness[] public witnesses;

    // State
    bool public married = false;
    uint public witnessBlocks;
    bool private divorced = false;
    uint private marriageBlock = 0;
    string private personTokenURI;
    string private witnessTokenURI;

    // Events
    event Marriage(address addr1, string name1, address addr2, string name2);
    event Witnessing(address addr1, string name1, address addr2, string name2, address witnessAddr, string witnessName);
    event Divorce(address addr1, string name1, address addr2, string name2);
    
    // Constructor
    constructor(
        address _addr1,
        string memory _name1,
        address _addr2,
        string memory _name2,
        uint _witnessBlocks,
        string memory _personTokenURI,
        string memory _witnessTokenURI, 
        string memory _tokenName,
        string memory _tokenSymbol
        ) ERC721(_tokenName, _tokenSymbol) {
        persons[0] = Person(_addr1, _name1, false);
        persons[1] = Person(_addr2, _name2, false);
        witnessBlocks = _witnessBlocks;
        personTokenURI = _personTokenURI;
        witnessTokenURI = _witnessTokenURI;
    }

    modifier onlyPersons {
        require(
            msg.sender == persons[0].addr || msg.sender == persons[1].addr, 
            "Only bride and groom can call this."
        );
        _;
    }

    modifier onlyIfMarried {
        require(married, "The parties are not married.");
        _;
    }

    modifier onlyIfNotMarried {
        require(!married, "The parties are already married.");
        _;
    }

    modifier onlyIfNotDivorced {
        require(!divorced, "The parties previously divorced, instantiate a new contract.");
        _;
    }

    modifier onlyInWitnessingWindow {
        require(marriageBlock > 0 && block.number < marriageBlock + witnessBlocks, "You are outside the witnessing window.");
        _;
    }

    modifier onlyIfNewWitness {
        require(witnessMap[msg.sender].addr == address(0), "Witness already witnessed.");
        _;
    }

    // I do
    function ido() public onlyPersons onlyIfNotMarried onlyIfNotDivorced {        
        if (msg.sender == persons[0].addr) {
            persons[0].ido = true;
        } else {
            persons[1].ido = true;
        }
        // check marriage
        if (marriageBlock == 0 && persons[0].ido && persons[1].ido) {
            married = true;
            marriageBlock = block.number;
            _mintNFT(persons[0].addr, personTokenURI);
            _mintNFT(persons[1].addr, personTokenURI);
            emit Marriage(persons[0].addr, persons[0].name, persons[1].addr, persons[1].name);
        }
    }

    // Divorce
    function divorce() public onlyPersons onlyIfMarried {
        if (msg.sender == persons[0].addr) {
            persons[0].ido = false;
        } else {
            persons[1].ido = false;
        }

        // emit only once
        if (married) {
            emit Divorce(persons[0].addr, persons[0].name, persons[1].addr, persons[1].name);
        }

        married = false;
        divorced = true;
    }

    // Witness
    function witness(string memory name) public onlyIfMarried onlyInWitnessingWindow onlyIfNewWitness {
        Witness memory w = Witness(msg.sender, name, block.number);
        witnessMap[msg.sender] = w;
        witnesses.push(w);
        _mintNFT(msg.sender, witnessTokenURI);
        emit Witnessing(persons[0].addr, persons[0].name, persons[1].addr, persons[1].name, msg.sender, name);
    }

    // mint
    function _mintNFT(address recipient, string memory uri) private returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, uri);

        return newItemId;
    }

}
