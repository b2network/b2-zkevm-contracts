import { task } from 'hardhat/config';
import fs from 'fs';
import path from 'path';
import "@nomicfoundation/hardhat-ethers";

task("genKeystore", "")
    .addParam("mnemonic")
    .addParam("sequencerPath")
    .addParam("sequencerPasswd")
    .addParam("aggreatorPath")
    .addParam("aggreatorPasswd")
    .addParam("output")
    .setAction(async (args, hre) => {
        let wallet = await hre.ethers.Wallet.fromPhrase(args.mnemonic, args.sequencerPath);
        let keystore = await wallet.encrypt(args.sequencerPasswd);
        fs.writeFileSync(path.join(args.output, "sequencer.json"), keystore, "utf-8");

        wallet = await hre.ethers.Wallet.fromPhrase(args.mnemonic, args.aggreatorPath);
        keystore = await wallet.encrypt(args.aggreatorPasswd);
        fs.writeFileSync(path.join(args.output, "aggregator.json"), keystore, "utf-8");
        console.log("hello");
    });

task("genRollupParams", "")
    .addParam("deployIn", "")
    .addParam("createRollupIn", "")
    .addParam("deployOut", "")
    .addParam("createRollupOut", "")
    .setAction(async (args, hre) => {
        const signers = await hre.ethers.getSigners();
        let deploy = JSON.parse(fs.readFileSync(args.deployIn, 'utf8'));
        let createRollup = JSON.parse(fs.readFileSync(args.createRollupIn, 'utf8'));

        deploy.initialZkEVMDeployerOwner = signers[0].address;
        deploy.admin = signers[1].address;
        deploy.trustedAggregator = signers[2].address;
        deploy.zkEVMDeployerAddress = signers[3].address;
        deploy.timelockAdminAddress = signers[4].address;
        deploy.emergencyCouncilAddress = signers[5].address;
        deploy.polTokenAddress = "";

        createRollup.trustedSequencer = signers[6].address;
        createRollup.adminZkEVM = signers[7].address;
        createRollup.chainID = 1003;
        createRollup.forkID = 7;
        createRollup.description = "b2network rollup testnet v0.4.0";

        console.table(deploy);
        console.table(createRollup);
        fs.writeFileSync(args.deployOut, JSON.stringify(deploy, null, 2));
        fs.writeFileSync(args.createRollupOut, JSON.stringify(createRollup, null, 2));
    });

task("fillGenesis", "")
    .addParam("genesis", "")
    .addParam("createRollup", "")
    .addParam("createRollupOutput", "")
    .addParam("deployOutput", "")
    .addParam("out", "")
    .setAction(async (args, hre) => {
        const deploy = JSON.parse(fs.readFileSync(args.deployOutput, 'utf8'));
        const createRollup = JSON.parse(fs.readFileSync(args.createRollup, 'utf8'));
        const createRollupOut = JSON.parse(fs.readFileSync(args.createRollupOutput, 'utf8'));
        let genesis = JSON.parse(fs.readFileSync(args.genesis, 'utf8'));
        let l1config = {
            "chainId": createRollup.chainID,
            "polygonZkEVMAddress": createRollupOut.rollupAddress,
            "polygonRollupManagerAddress": deploy.polygonRollupManager,
            "polTokenAddress": deploy.polTokenAddress,
            "polygonZkEVMGlobalExitRootAddress": deploy.polygonZkEVMGlobalExitRootAddress,
        };
        genesis.l1Config = l1config;
        genesis.genesisBlockNumber = createRollupOut.createRollupBlock;
        fs.writeFileSync(args.out, JSON.stringify(genesis, null, 2));
    });

async function getBalances(provider, hre, signers) {
    let results = new Map();
    for (const addr of signers) {
        let tmp = await provider.getBalance(addr);
        results.set(addr, tmp);
    }
    return results;
}

task("showAccounts", "show current accounts derived from mnemonic")
    .addOptionalParam("extra", "")
    .setAction(async (args, hre) => {
        const provider = new ethers.getDefaultProvider(hre.network.config.url);
        const signers = await hre.ethers.getSigners();
        let addrs = signers.map((s) => s.address);
        if (args.extra)
            addrs.push(args.extra);
        const tmp = await getBalances(provider, hre, addrs);
        let balsEther = new Map();
        for (let [k, v] of tmp.entries()) {
            balsEther.set(k, hre.ethers.formatEther(v));
        }
        let results = new Map(balsEther.entries());
        const chainId = await provider.getNetwork();
        results.set("chainId", chainId.chainId);
        results.set("ethersVersion", hre.ethers.version);
        results.set("conn", hre.network.config.url);
        console.table(results);
    });
