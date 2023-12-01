const {expect} = require('chai');
const {ethers, upgrades} = require('hardhat');

describe('SimpleBridge Contract', () => {

    it('Testing the withdraw feature of the SimpleBridge contract. ', async () => {
        // deploy
        const [deployer] = await ethers.getSigners();
        const SimpleBridge = await ethers.getContractFactory("SimpleBridge");
        const simpleBridge = await upgrades.deployProxy(SimpleBridge);
        await simpleBridge.deployed();

        // withdraw
        let btc_address = "bc1quzdvc9u807km05su798y8zlkzx0j8dp84m7r6r";
        let decimals = 10000000000;
        let amount = 1;
        await expect(simpleBridge.withdraw(btc_address, {value: amount * decimals}))
            .to.emit(simpleBridge, 'WithdrawEvent')
            .withArgs(deployer.address, btc_address, amount);
    });


    it('Testing the deposit feature of the SimpleBridge contract. ', async () => {
        // deploy
        const [deployer, depositAcc, depositToAcc] = await ethers.getSigners();
        const SimpleBridge = await ethers.getContractFactory("SimpleBridge");
        const simpleBridge = await upgrades.deployProxy(SimpleBridge);
        await simpleBridge.deployed();

        // transfer
        const transferTx = await deployer.sendTransaction({
            to: simpleBridge.address, value: ethers.utils.parseEther('10'),
        });
        await transferTx.wait();

        // grantRole
        const grantRoleTx = await simpleBridge.grantRole(await simpleBridge.ADMIN_ROLE(), depositAcc.address);
        await grantRoleTx.wait();

        // deposit
        let eth_address = depositToAcc.address;
        let decimals = 10000000000;
        let amount = 5;
        await expect(simpleBridge.connect(depositAcc).deposit(eth_address, amount))
            .to.emit(simpleBridge, 'DepositEvent')
            .withArgs(depositAcc.address, eth_address, amount * decimals);
    });
});
