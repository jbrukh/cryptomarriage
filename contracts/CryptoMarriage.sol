//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";


contract CryptoMarriage {

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
    Witness[] public witnesses;

    // State
    bool public married = false;
    bool private divorced = false;
    uint private marriageBlock;

    // Events
    event Marriage(address addr1, string name1, address addr2, string name2);
    event Witnessing(address addr1, string name1, address addr2, string name2, address witnessAddr, string witnessName);

    // Constructor
    constructor(address _addr1, string memory _name1, address _addr2, string memory _name2) {
        persons[0] = Person(_addr1, _name1, false);
        persons[1] = Person(_addr2, _name2, false);
    }

    modifier onlyPersons {
        require(
            msg.sender == persons[0].addr || msg.sender == persons[1].addr, 
            "Only bride and groom can call this."
        );
        _;
    }

    modifier onlyIfNotDivorced {
        require(!divorced, "The parties previously divorced, instantiate a new contract.");
        _;
    }

    modifier onlyInWitnessingWindow {
        require(true, "");
        _;
    }

    modifier onlyIfNotMarried {
        require(!married, "The parties are already married.");
        _;
    }

    // I do
    function ido() public onlyPersons onlyIfNotDivorced onlyIfNotMarried {        
        if (msg.sender == persons[0].addr) {
            persons[0].ido = true;
        } else {
            persons[1].ido = true;
        }
        // check marriage
        if (persons[0].ido && persons[1].ido) {
            married = true;
            marriageBlock = block.number;
            emit Marriage(persons[0].addr, persons[0].name, persons[1].addr, persons[1].name);
        }
    }

    // Divorce
    function divorce() public onlyPersons {
        if (msg.sender == persons[0].addr) {
            persons[0].ido = false;
        } else {
            persons[1].ido = false;
        }
        married = false;
        divorced = true;
    }

    // Witness
    function witness(string memory name) public onlyInWitnessingWindow {

    }

}
