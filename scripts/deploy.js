// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const CryptoMarriage = await hre.ethers.getContractFactory("CryptoMarriage");
  let cryptoMarriage = await CryptoMarriage.deploy('0x6a6134989bB133950fFf5038Ec2dE2858dcbd4e8', 'Roxette Sklavos', '0x094A05706b4d3274Ce58Fef838E73b246bbcB5a9', 'Jake Brukhman', 10000);

  await cryptoMarriage.deployed();
  
  console.log("CryptoMarriage deployed to:", cryptoMarriage.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
