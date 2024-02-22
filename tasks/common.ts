import { task } from 'hardhat/config';
import fs from 'fs';

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

        fs.writeFileSync(args.deployOut, JSON.stringify(deploy, null, 2));
        fs.writeFileSync(args.createRollupOut, JSON.stringify(deploy, null, 2));
    });
