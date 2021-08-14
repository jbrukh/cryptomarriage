//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";


contract CryptoMarriage {

    // Persons
    struct Person {
       address addr;
       string  name;
    } 
    Person[2] public persons;

    // Events
    event Marriage(address addr1, string name1, address addr2, string name2);
    event Witness(address addr1, string name1, address addr2, string name2, address witnessAddr, string witnessName);

    // Constructor
    constructor(address _addr1, string memory _name1, address _addr2, string memory _name2) {
        persons[0] = Person(_addr1, _name1);
        persons[1] = Person(_addr2, _name2);
    }

    
}
