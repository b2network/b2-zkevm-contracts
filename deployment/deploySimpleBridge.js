const {ethers, upgrades} = require("hardhat");

async function main() {

    // SimpleBridge
    const SimpleBridge = await ethers.getContractFactory("SimpleBridge");
    const instance = await upgrades.deployProxy(SimpleBridge);
    await instance.waitForDeployment();
    console.log("SimpleBridge V1:", instance.target);

}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
