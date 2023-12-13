async function getBalances(provider, hre, signers) {
    let results = new Map();
    for (const addr of signers) {
        let tmp = await provider.getBalance(addr);
        results.set(addr, hre.ethers.utils.formatEther(tmp));
    }
    return results;
}

exports.getBalances = getBalances;