require('dotenv/config');
require("chai");
const { writeFile, readFile } = require("node:fs/promises");

task("scanEOAAndContract", "scan tx from genesis to now, and get all EOA and Contract address、balance")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider();
        let info = {};
        info.blockNumber = await provider.getBlockNumber();
        let EOAAddrs = new Map();
        let ContractAddrs = new Map();

        for (let i = 1; i < info.blockNumber; i++) {
            const block = await provider.getBlock(i);
            for (let txid of block.transactions) {
                let tx = await provider.getTransaction(txid);
                for (let addr of [tx.from, tx.to]) {
                    if (addr == null) continue;
                    if (EOAAddrs.has(addr) || ContractAddrs.has(addr)) continue;
                    let code = await provider.getCode(addr);
                    let tmp = await provider.getBalance(addr);
                    let bal = hre.ethers.utils.formatEther(tmp);
                    if (code == "0x") {
                        EOAAddrs.set(addr, bal);
                    } else {
                        ContractAddrs.set(addr, bal);
                    }
                }
            }
        }

        info.EOAAddrs = Array.from(EOAAddrs);
        info.ContractAddrs = Array.from(ContractAddrs);

        await writeFile("info.json", JSON.stringify(info));
    });

task("debug", "just for debug, query net info etc.")
    .setAction(async (args, hre) => {
        let info = {};
        info.signer = (await hre.ethers.getSigner()).address;
        const provider = new hre.ethers.providers.JsonRpcProvider();
        info.net = await provider.getNetwork();
        info.ethersVersion = hre.ethers.version;
        console.log(info);
    });

task("PolygonZkEVM", "call PolygonZkEVM contract")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVM");
        const dapp = factory.attach('0x610178dA211FEF7D417bC0e6FeD39F05609AD788');

        let results = {};
        results.fee = await dapp.getForcedBatchFee();
        results.calculateRewardPerBatch = await dapp.calculateRewardPerBatch();

        console.table(results);
    });

task("findTxOfAAddr", "scan tx from genesis to now, and get all tx of a address")
    .addParam("addr")
    .addOptionalParam("height", "scan height from 1 to height, default now")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider();
        height = args.height || await provider.getBlockNumber();
        console.log(`scan from 1 to ${height}`);
        let results = [];
        for (let i = 1; i < height; i++) {
            const block = await provider.getBlock(i);
            for (let txid of block.transactions) {
                let tx = await provider.getTransaction(txid);
                let addrs = [];
                if (tx.from != null) addrs.push(tx.from.toUpperCase());
                if (tx.to != null) addrs.push(tx.to.toUpperCase());

                let target = args.addr.toUpperCase();
                if (addrs.includes(target)) results.push(txid);
            }
        }
        // console.log(results);
        await writeFile(`tx-${args.addr}.json`, JSON.stringify(results));
    });

task("matchContract", "try to match contract address by call contract function")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("PolygonZkEVM");
        const info = JSON.parse(await readFile("./info.json", "utf-8"));
        let results = {};
        for (let addr of info.ContractAddrs) {
            try {
                const dapp = factory.attach(addr[0]);
                const fee = await dapp.getForcedBatchFee();
                results.addr = addr[0];
                results.fee = fee;
            }
            catch (e) {
                // console.error(e);
                continue;
            }
        }
        console.log(results);
    });