set -x

init() {
    npm i
    npm run test
    return
}

run() {
    # exec >"$FUNCNAME.log" 2>&1

    # npx hardhat test test/contracts/polygonZkEVM.test.js

    # Proof of Efficiency
    # POE
    # PolygonZkEVM
    # forge flatten --hardhat contracts/PolygonZkEVM.sol >tmp.sol
    # return

    # npx hardhat --help
    # time npx hardhat --network polygonL1net scanEOAAndContract
    # time npx hardhat --network polygonL1net debug
    txhashs='0x765730c24d1b99ee43c89f691f93c13cf9dfeac68280b2698e9cc4e349f34848,0x6b3dce636a755a7eb74b5b76ebee5262203bad0437f805ec5e22fa692391f239'
    npx hardhat --network polygonL1net PolygonZkEVM:parseLog \
        --addr 0x610178dA211FEF7D417bC0e6FeD39F05609AD788 \
        --txhash $txhashs | jq .
        # --txhash $txhashs
    return
    time npx hardhat --network polygonL1net PolygonZkEVM \
        --addr 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
    return
    time npx hardhat --network polygonL1net findTxOfAAddr \
        --addr 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
    # --height 10000
    return
}

verify() {
    ADDR_POE=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
    npx hardhat verify \
        --network polygonL1net \
        --contract contracts/PolygonZkEVM.sol:PolygonZkEVM \
        $ADDR_POE
}
$@
