require('dotenv/config');
const ethers = require('ethers');
const { getBalances } = require("../../task/lib")
const DEFAULT_NUM_ACCOUNTS = 20;

task("init-fund-accounts", "acc0 transfer 50eth to other accounts")
    .setAction(async (args, hre) => {
        const provider = new hre.ethers.providers.JsonRpcProvider(hre.network.config.url);
        const signers = await hre.ethers.getSigners();
        let tmp = await getBalances(provider, hre, signers);
        let bal1 = new Map(tmp.entries());
        const num = (50).toString();
        bal1.set("value", num);
        console.log(bal1);

        const numAccountsToFund = process.env.NUM_ACCOUNTS || DEFAULT_NUM_ACCOUNTS;
        for (let i = 1; i < numAccountsToFund; i++) {
            const tx = await signers[0].sendTransaction({
                to: signers[i].address,
                value: hre.ethers.utils.parseEther(num)
            });
            await tx.wait();
        }
        tmp = await getBalances(provider, hre, signers);
        let bal2 = new Map(tmp.entries());
        console.log(bal2);
    });