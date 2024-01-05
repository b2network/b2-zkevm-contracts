// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint public count;

    function get() public view returns (uint) {
        return count;
    }

    function inc() public {
        count += 1;
    }

    function dec() public {
        count -= 1;
    }
}

contract GasGuzzler {
    function calculateHash(
        string memory str,
        uint num,
        uint iterations
    ) public pure returns (bytes32 lastHash) {
        lastHash = keccak256(abi.encodePacked(str, num));
        for (uint i = 1; i < iterations; i++) {
            lastHash = keccak256(abi.encodePacked(lastHash));
        }
    }
}
