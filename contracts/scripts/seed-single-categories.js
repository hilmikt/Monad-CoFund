const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const cofund = await hre.ethers.getContractAt("MonadCoFund", "0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54");
  const count = await cofund.fundCount();

  console.log(`Checking ${count} funds for the single implicit budget...`);

  for (let fundId = 1n; fundId <= count; fundId++) {
    const fund = await cofund.getFund(fundId);
    const categories = await cofund.getCategories(fundId);

    if (categories.length > 0) {
      console.log(`Fund #${fundId}: already configured`);
      continue;
    }

    if (fund.creator.toLowerCase() !== signer.address.toLowerCase()) {
      console.log(`Fund #${fundId}: skipped because the configured wallet is not the creator`);
      continue;
    }

    const tx = await cofund.createCategory(fundId, fund.name, fund.target);
    await tx.wait();
    console.log(`Fund #${fundId}: created implicit budget category`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
