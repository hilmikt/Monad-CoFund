require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src",
    tests: "./test/hardhat",
    cache: "./cache_hardhat",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {},
    monadTestnet: {
      url: "https://rpc-testnet.monadinfra.com",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
