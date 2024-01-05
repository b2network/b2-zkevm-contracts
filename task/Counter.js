const { task } = require('hardhat/config');

task("Counter:deploy", "")
  .setAction(async (args, hre) => {
    const dapp = await hre.ethers.deployContract("Counter")
    console.log(dapp.deployTransaction);
  });


task("Counter:call", "")
  .addParam("addr", "")
  .setAction(async (args, hre) => {
    const factory = await hre.ethers.getContractFactory("Counter");
    const dapp = factory.attach(args.addr);
    let res = await dapp.inc();
    res = await dapp.get();
    console.log(res);
  });
