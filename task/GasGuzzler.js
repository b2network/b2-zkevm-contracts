const { task } = require('hardhat/config');

task("GasGuzzler:deploy", "")
  .setAction(async (args, hre) => {
    const dapp = await hre.ethers.deployContract("GasGuzzler")
    console.log(dapp.deployTransaction);
  });


task("GasGuzzler:call", "")
  .addParam("addr", "")
  .setAction(async (args, hre) => {
    const factory = await hre.ethers.getContractFactory("GasGuzzler");
    const dapp = factory.attach(args.addr);
    let res = await dapp.calculateHash("hello",1,10);
    console.log(res);
  });
