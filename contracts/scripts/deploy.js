const hre = require("hardhat");

async function main() {
  console.log("Deploying MonadCoFund to Monad Testnet...");

  const MonadCoFund = await hre.ethers.getContractFactory("MonadCoFund");
  const cofund = await MonadCoFund.deploy();
  const deploymentTransaction = cofund.deploymentTransaction();
  await cofund.waitForDeployment();

  const address = await cofund.getAddress();
  console.log("-----------------------------------------------");
  console.log("MonadCoFund deployed successfully!");
  console.log("Contract Address:", address);
  if (deploymentTransaction) {
    console.log("Deployment Transaction:", deploymentTransaction.hash);
  }
  console.log("-----------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
