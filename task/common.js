require('dotenv/config');
require("chai");
const { getBalances } = require("./lib")
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

task("showAccounts", "show current accounts derived from mnemonic")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const signers = await hre.ethers.getSigners();
        const tmp = await getBalances(provider, hre, signers);
        let results = new Map(tmp.entries());
        results.set("chainId", await provider.getNetwork());
        results.set("ethersVersion", hre.ethers.version);
        results.set("conn", provider.connection.url);
        console.table(results);
    });

task("simpleTransfer", "acc1 transfer random eth to acc2")
    .addOptionalParam("initAccountBalance", "transfer x eth from acc0 to acc1")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const [acc0, acc1, acc2] = await hre.ethers.getSigners();
        if (args.initAccountBalance) {
            const tx = await acc0.sendTransaction({
                to: acc1.address,
                value: hre.ethers.utils.parseEther(args.initAccountBalance)
            });
            await tx.wait();
            let tmp = await getBalances(provider, hre, [acc0, acc1]);
            let bal2 = new Map(tmp.entries());
            bal2.set("tx", tx.hash);
            console.log(bal2);
            return;
        }

        let tmp = await getBalances(provider, hre, [acc1, acc2]);
        let bal1 = new Map(tmp.entries());
        const num = (Math.random() * 2).toString();
        bal1.set("value", num);
        console.log(bal1);
        const tx = await acc1.sendTransaction({
            to: acc2.address,
            value: hre.ethers.utils.parseEther(num)
        });
        await tx.wait();
        tmp = await getBalances(provider, hre, [acc1, acc2]);
        let bal2 = new Map(tmp.entries());
        bal2.set("tx", tx.hash);
        console.log(bal2);
    });

task("showContractCode", "")
    .addParam("addrs")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const addrs = args.addrs.split(",");
        let results = new Map();
        for (const addr of addrs) {
            let code = await provider.getCode(addr);
            results.set(addr, code);
        }
        console.log(results);
    });

task("getHashByHeight", "")
    .addParam("heights")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const heights = args.heights.split(",");
        let results = new Map();
        for (const item of heights) {
            let tmp = await provider.getBlockNumber();
            let res = await provider.getBlock(Number(item));
            results.set(item, res);
        }
        console.log(results);
    });