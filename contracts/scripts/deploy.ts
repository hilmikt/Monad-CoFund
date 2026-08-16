import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MonadCoFund to Monad Testnet...");

  const MonadCoFund = await ethers.getContractFactory("MonadCoFund");
  const cofund = await MonadCoFund.deploy();
  await cofund.waitForDeployment();

  const address = await cofund.getAddress();
  console.log("-----------------------------------------------");
  console.log("MonadCoFund deployed successfully!");
  console.log("Contract Address:", address);
  console.log("-----------------------------------------------");
  console.log("Next step: Set this address in web/.env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
