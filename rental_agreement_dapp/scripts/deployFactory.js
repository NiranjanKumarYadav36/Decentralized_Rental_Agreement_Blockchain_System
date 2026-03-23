const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying RentalFactory Contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with address:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(
    await hre.ethers.provider.getBalance(deployer.address)
  ), "ETH");

  const RentalFactory = await hre.ethers.getContractFactory("RentalFactory");
  const factory = await RentalFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log("✅ RentalFactory deployed to:", factoryAddress);
  console.log("👤 Owner:", deployer.address);
  console.log("");
  console.log("🔍 View on Etherscan:");
  console.log("https://sepolia.etherscan.io/address/" + factoryAddress);
  console.log("");
  console.log("⚠️ Save this address! Add to frontend .env:");
  console.log("VITE_FACTORY_ADDRESS=" + factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });