require('dotenv/config');
require("chai");
const { writeFile, readFile } = require("node:fs/promises");

task("PolygonZkEVM:parseLog", "parse log of a tx")
    .addParam("addr", "contract address")
    .addParam("txhash", "tx hash, split by ','")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVM");
        const provider = new hre.ethers.providers.JsonRpcProvider();
        const txs = args.txhash.split(",");
        let results = [];

        for (const hash of txs) {
            let tx = await provider.getTransactionReceipt(hash);
            for (const content of tx.logs) {
                try {
                    let log = factory.interface.parseLog(content);
                    delete log.eventFragment;
                    results.push(log);
                } catch (e) {
                    console.error('error:', e);
                }
            }
        }
        console.log(JSON.stringify(results));
    });

task("PolygonZkEVM:info", "call PolygonZkEVM contract")
    .addParam("addr")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVM");
        const dapp = factory.attach(args.addr);

        let results = {};
        results.admin = await dapp.admin();
        results.batchFee = await dapp.batchFee();
        results.bridgeAddress = await dapp.bridgeAddress();
        results.calculateRewardPerBatch = await dapp.calculateRewardPerBatch();
        results.chainID = await dapp.chainID();
        results.forceBatchTimeout = await dapp.forceBatchTimeout();
        results.forkID = await dapp.forkID();
        results.getForcedBatchFee = await dapp.getForcedBatchFee();
        results.getLastVerifiedBatch = await dapp.getLastVerifiedBatch();
        results.globalExitRootManager = await dapp.globalExitRootManager();
        results.isEmergencyState = await dapp.isEmergencyState();
        results.isForcedBatchDisallowed = await dapp.isForcedBatchDisallowed();
        results.lastBatchSequenced = await dapp.lastBatchSequenced();
        results.lastForceBatchSequenced = await dapp.lastForceBatchSequenced();
        results.lastPendingState = await dapp.lastPendingState();
        results.lastPendingStateConsolidated = await dapp.lastPendingStateConsolidated();
        results.lastTimestamp = await dapp.lastTimestamp();
        results.lastVerifiedBatch = await dapp.lastVerifiedBatch();
        results.matic = await dapp.matic();
        results.multiplierBatchFee = await dapp.multiplierBatchFee();
        results.networkName = await dapp.networkName();
        results.owner = await dapp.owner();
        results.pendingAdmin = await dapp.pendingAdmin();
        results.pendingStateTimeout = await dapp.pendingStateTimeout();
        results.rollupVerifier = await dapp.rollupVerifier();
        results.trustedAggregator = await dapp.trustedAggregator();
        results.trustedAggregatorTimeout = await dapp.trustedAggregatorTimeout();
        results.trustedSequencer = await dapp.trustedSequencer();
        results.trustedSequencerURL = await dapp.trustedSequencerURL();
        results.verifyBatchTimeTarget = await dapp.verifyBatchTimeTarget();
        console.table(results);
    });
