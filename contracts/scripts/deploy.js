const hre = require("hardhat");

async function main() {
  console.log("Deploying MonadCoFund contract to network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "MON");

  const MonadCoFund = await hre.ethers.getContractFactory("MonadCoFund");
  const cofund = await MonadCoFund.deploy();
  await cofund.waitForDeployment();

  const address = await cofund.getAddress();
  console.log("==================================================");
  console.log("MonadCoFund deployed successfully!");
  console.log("Contract Address:", address);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
