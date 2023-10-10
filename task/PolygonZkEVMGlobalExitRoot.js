require('dotenv/config');
require("chai");
const { writeFile, readFile } = require("node:fs/promises");

task("PolygonZkEVMGlobalExitRoot:info", "")
    .addParam("addr", "contract address")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVMGlobalExitRoot");
        const dapp = factory.attach(args.addr);
        // const provider = new hre.ethers.providers.JsonRpcProvider();
        let results = {};
        results.bridgeAddress = await dapp.bridgeAddress();
        results.getLastGlobalExitRoot = await dapp.getLastGlobalExitRoot();
        results.lastMainnetExitRoot = await dapp.lastMainnetExitRoot();
        results.lastRollupExitRoot = await dapp.lastRollupExitRoot();
        results.rollupAddress = await dapp.rollupAddress();
        console.table(results);
    });
