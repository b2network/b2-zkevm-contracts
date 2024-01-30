require('dotenv/config');
require("chai");
const { task } = require('hardhat/config');
const { getBalances } = require("./lib")
const { writeFile, readFile } = require("node:fs/promises");
const fs = require("fs");
const path = require("path");

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
        const tmp = await getBalances(provider, hre, signers.map((s) => s.address));
        let results = new Map(tmp.entries());
        results.set("chainId", await provider.getNetwork());
        results.set("ethersVersion", hre.ethers.version);
        results.set("conn", provider.connection.url);
        console.table(results);
    });

task("fundCollector", "fund collector account")
    .addParam("addr")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const signers = await hre.ethers.getSigners();
        const addrs = signers.map((s) => s.address);
        const tmp = await getBalances(provider, hre, addrs);
        const bals = new Map(tmp.entries());
        const toAddr = args.addr;

        for (const signer of signers) {
            const val = bals.get(signer.address);
            if (val.isZero()) continue;
            const params = {
                to: toAddr,
                value: val.add(new hre.ethers.BigNumber.from(-210000000000)),
                gasLimit: 21000,
            };

            const tx = await signer.sendTransaction(params);
            await tx.wait();
            console.log("txid", tx.hash);
        };

        return;
    });

task("transfer")
    .addParam("addr")
    .addParam("value")
    .addOptionalParam("offline", "only sign tx, not send tx")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const [signer] = await hre.ethers.getSigners();
        const toAddr = args.addr;
        const params = {
            to: toAddr,
            value: hre.ethers.utils.parseEther(args.value),
            gasLimit: 210000,
            gasPrice: hre.ethers.utils.parseUnits("300", "gwei"),
            chainId: 102,
        };
        if (args.offline) {
            const wallets = await getTestWallets(hre, hre.network.config.accounts.mnemonic, 0, 1);
            const nonce = await provider.getTransactionCount(wallets[0].address);
            params.nonce = nonce;
            const tx = await wallets[0].signTransaction(params);
            console.log(tx);
            return
        }

        const tx = await signer.sendTransaction(params);
        await tx.wait();

        let tmp = await getBalances(provider, hre, [signer.address, toAddr]);
        let bal2 = new Map(tmp.entries());
        bal2.set("tx", tx.hash);
        console.log(bal2);
        return;
    });

task("transferConcurrence")
    .addParam("addr")
    .addParam("concurrence")
    .addParam("value")
    .setAction(async (args, hre) => {
        const con = parseInt(args.concurrence);
        const signers = await hre.ethers.getSigners();
        const value = hre.ethers.utils.parseEther(args.value)
        let transfTasks = [];
        for (let i = 0; i < con; i++) {
            transfTasks.push(transfer(signers[i], args.addr, value));
        }
        const txs = await Promise.all(transfTasks);
        console.log(txs);
        return;
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

async function getTestWallets(hre, mnemonic, from, end) {
    let wallets = [];
    for (let i = from; i < end; i++) {
        wallets.push(hre.ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`));
    }
    return wallets;
}


task("TEST:generateOfflineTx")
    .addParam("startIndex")
    .addParam("endIndex")
    .addParam("round")
    .addParam("value")
    .setAction(async (args, hre) => {
        const mnemonic = hre.network.config.accounts.mnemonic;
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const wallets = await getTestWallets(hre, mnemonic, parseInt(args.startIndex), parseInt(args.endIndex));
        let addrNonce = new Map;
        for (const w of wallets) {
            const nonce = await provider.getTransactionCount(w.address);
            addrNonce.set(w.address, nonce);
        }
        const totalRound = parseInt(args.round);
        let results = new Array();

        for (let round = 0; round < totalRound; round++) {
            let signTasks = new Array();
            for (const w of wallets) {
                const nonce = addrNonce.get(w.address);
                const params = {
                    to: w.address,
                    value: hre.ethers.utils.parseEther(args.value),
                    nonce: nonce,
                    gasLimit: 21000,
                    gasPrice: hre.ethers.utils.parseUnits("1", "gwei")
                };
                addrNonce.set(w.address, nonce + 1);
                signTasks.push(w.signTransaction(params));
            };
            const txs = await Promise.all(signTasks);
            results = results.concat(txs);
        }
        fs.writeFileSync(path.join(".", "txs.txt"), results.join("\n"), "utf-8");
        console.log("save to txs.txt")
    });

task("TEST:prepare")
    .addParam("startIndex")
    .addParam("endIndex")
    .addParam("minSenderBalance")
    .addParam("minBalance")
    .setAction(async (args, hre) => {
        const mnemonic = hre.network.config.accounts.mnemonic;
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const start = parseInt(args.startIndex);
        const end = parseInt(args.endIndex);

        const signers = await hre.ethers.getSigners();
        const addrs = signers.map((w) => w.address);
        const bals = await getBalances(provider, hre, addrs);
        signers.pop();
        const minSenderBal = parseFloat(args.minSenderBalance);
        for (const item of bals) {
            const bal = parseFloat(item[1]);
            if (bal < minSenderBal - 1) {
                await hre.run("transfer", {
                    addr: item[0],
                    value: args.minSenderBalance
                });
            }

        };
        const wallets = await getTestWallets(hre, mnemonic, start, end);
        const testAddrs = wallets.map((w) => w.address);
        const testAddrsBals = Array.from(await getBalances(provider, hre, testAddrs));
        const minBal = parseFloat(args.minBalance);

        for (let index = 0; index < testAddrsBals.length;) {
            let balNotEnoughAddr = [];
            let balEnoughAddr = [];
            for (let i = 0; index < testAddrsBals.length && i < signers.length;) {
                const tmp = testAddrsBals[index];
                index++;
                const bal = parseFloat(tmp[1]);
                if (bal >= minBal) {
                    balEnoughAddr.push(tmp[0]);
                    continue;
                }
                balNotEnoughAddr.push(tmp);
                i++;
            }
            let transfTasks = [];
            for (let i = 0; i < balNotEnoughAddr.length; i++) {
                transfTasks.push(transfer(signers[i], balNotEnoughAddr[i][0], hre.ethers.utils.parseEther(args.minBalance)));
            }
            const txs = await Promise.all(transfTasks);
            console.log("balEnoughAddr size", balEnoughAddr.length);
            console.log("balNotEnoughAddr size", balNotEnoughAddr.length);
            console.log("txs", txs);
        }
    });

async function transfer(from, to, value) {
    const tx = await from.sendTransaction({
        to: to,
        value: value,
    });
    await tx.wait();
    return tx.hash;
}
