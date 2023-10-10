require('dotenv/config');
require("chai");
const { writeFile, readFile } = require("node:fs/promises");

task("PolygonZkEVMTimelock:info", "")
    .addParam("addr", "contract address")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVMTimelock");
        const dapp = factory.attach(args.addr);
        let results = {};
        results.CANCELLER_ROLE = await dapp.CANCELLER_ROLE();
        results.DEFAULT_ADMIN_ROLE = await dapp.DEFAULT_ADMIN_ROLE();
        results.EXECUTOR_ROLE = await dapp.EXECUTOR_ROLE();
        results.getMinDelay = await dapp.getMinDelay();
        results.polygonZkEVM = await dapp.polygonZkEVM();
        results.PROPOSER_ROLE = await dapp.PROPOSER_ROLE();
        results.TIMELOCK_ADMIN_ROLE = await dapp.TIMELOCK_ADMIN_ROLE();
        console.table(results);
    });
