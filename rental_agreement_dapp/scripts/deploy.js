const hre = require("hardhat");

async function main() {

  console.log("Deploying Rental Agreement Contract...");

  // Get deployer account (landlord)
  const [landlord] = await hre.ethers.getSigners();
  console.log("Deploying with landlord address:", 
    landlord.address);
  console.log("Landlord balance:", 
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(
        landlord.address
      )
    ), "ETH");

  // ==================
  // DEPLOYMENT PARAMS
  // ==================

  // Tenant address — put your second MetaMask account here
  const tenantAddress = "0x07CcAc6b2BAAdADD3965E2588dC85166eAEEDA70";

  // Rent amount — 0.01 ETH in wei
  const rentAmount = hre.ethers.parseEther("0.01");

  // Deposit amount — 0.02 ETH in wei
  const depositAmount = hre.ethers.parseEther("0.02");

  // Agreement duration — 30 days
  const durationDays = 0;

  // Rent due day — 1st of every month
  const rentDueDay = 1;

  // ==================
  // DEPLOY CONTRACT
  // ==================

  const RentalAgreement = await hre.ethers.getContractFactory(
    "RentalAgreement"
  );

  const rentalAgreement = await RentalAgreement.deploy(
    tenantAddress,
    rentAmount,
    depositAmount,
    durationDays,
    rentDueDay
  );

  await rentalAgreement.waitForDeployment();

  const contractAddress = await rentalAgreement.getAddress();

  console.log("✅ RentalAgreement deployed to:", 
    contractAddress);
  console.log("📋 Landlord:", landlord.address);
  console.log("📋 Tenant:", tenantAddress);
  console.log("💰 Rent Amount: 0.01 ETH");
  console.log("💰 Deposit Amount: 0.02 ETH");
  console.log("📅 Duration: 30 days");
  console.log("");
  console.log("🔍 View on Etherscan:");
  console.log("https://sepolia.etherscan.io/address/" 
    + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });