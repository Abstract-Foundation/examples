// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ONFT721} from "./onft721/ONFT721.sol";

contract MyONFT721 is ONFT721 {
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint
    ) ONFT721(_name, _symbol, _lzEndpoint) {}
}
