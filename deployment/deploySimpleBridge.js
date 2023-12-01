const {ethers} = require('hardhat');

async function main() {
    // deploy bridge contract
    const Bridge = await ethers.getContractFactory("SimpleBridge");
    const bridge = await Bridge.deploy();
    await bridge.deployed();
    console.log("bridge :", bridge.address);

    // deploy bridge admin contract
    const BridgeProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const bridgeProxyAdmin = await BridgeProxyAdmin.deploy();
    await bridgeProxyAdmin.deployed();
    console.log("bridgeProxyAdmin :", bridgeProxyAdmin.address);

    // deploy bridge proxy contract
    const BridgeProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
    const bridgeProxy = await BridgeProxy.deploy(bridge.address, bridgeProxyAdmin.address, "0x8129fc1c");
    await bridgeProxy.deployed();
    console.log("bridgeProxy :", bridgeProxy.address);

}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
