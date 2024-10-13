// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    // The constructor initializes the token with a name, symbol, and initial supply
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        // Mint the initial supply of tokens to the contract deployer
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }

    // You can still keep the custom "echo" function if needed
    event Echo(string message);

    function echo(string calldata message) external {
        emit Echo(message);
    }
}
