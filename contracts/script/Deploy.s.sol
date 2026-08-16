// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MonadCoFund} from "../src/MonadCoFund.sol";

/**
 * @notice Deploy MonadCoFund to Monad Testnet (or any EVM network).
 *
 * Usage:
 *   forge script script/Deploy.s.sol \
 *     --rpc-url https://testnet-rpc.monad.xyz \
 *     --account <keystore-account> \
 *     --broadcast \
 *     --verify \
 *     --verifier blockscout \
 *     --verifier-url https://testnet.monadexplorer.com/api \
 *     -vvvv
 *
 * IMPORTANT: Do not hard-code private keys.
 * Use --account (keystore) or --ledger or PRIVATE_KEY env var.
 */
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MonadCoFund cofund = new MonadCoFund();

        console.log("MonadCoFund deployed to:", address(cofund));
        console.log("Network chain ID:", block.chainid);

        vm.stopBroadcast();
    }
}
