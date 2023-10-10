require('dotenv/config');
require("chai");
const { writeFile, readFile } = require("node:fs/promises");

task("ERC20PermitMock:info", "")
    .addParam("addr", "contract address")
    .setAction(async (args, hre) => {
        const factory = await hre.ethers.getContractFactory("ERC20PermitMock");
        const dapp = factory.attach(args.addr);
        const provider = new hre.ethers.providers.JsonRpcProvider();
        let results = {};
        results.decimals = await dapp.decimals();
        results.EIP712DOMAIN_HASH = await dapp.EIP712DOMAIN_HASH();
        results.DOMAIN_SEPARATOR = await dapp.DOMAIN_SEPARATOR();
        results.getChainId = await dapp.getChainId();
        results.name = await dapp.name();
        results.NAME_HASH = await dapp.NAME_HASH();
        results.PERMIT_TYPEHASH = await dapp.PERMIT_TYPEHASH();
        results.symbol = await dapp.symbol();
        results.totalSupply = await dapp.totalSupply();
        results.VERSION_HASH = await dapp.VERSION_HASH();
        console.table(results);
    });
