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
    forge flatten --hardhat contracts/PolygonZkEVM.sol >tmp.sol
    return

    # npx hardhat --help
    # time npx hardhat --network polygonL1net scanEOAAndContract
    # time npx hardhat --network polygonL1net debug
    # time npx hardhat --network polygonL1net PolygonZkEVM

    time npx hardhat --network polygonL1net findTxOfAAddr \
        --addr 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
        # --height 10000
    return
}

verify(){
    ADDR_POE=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
    npx hardhat verify \
        --network polygonL1net \
        --contract contracts/PolygonZkEVM.sol:PolygonZkEVM \
        $ADDR_POE
}
$@
