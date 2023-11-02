set -x

shopt -s expand_aliases
alias run='time npx hardhat --network '

init() {
    npm i
    npm run test
    return
}

flatten() {
    # exec >"$FUNCNAME.log" 2>&1

    # Proof of Efficiency
    # POE
    # PolygonZkEVM
    # forge flatten --hardhat contracts/PolygonZkEVM.sol >tmp.sol
    # forge flatten --hardhat  >tmp.sol

    COMMIT=$(git rev-parse --short HEAD)
    # FILE_PATH='contracts/mocks/ERC20PermitMock.sol'
    # FILE_PATH='contracts/PolygonZkEVMGlobalExitRoot.sol'
    # FILE_PATH='contracts/PolygonZkEVMTimelock.sol'
    FILE_PATH='contracts/PolygonZkEVMBridge.sol'
    OUT_PATH=tmp-$COMMIT-$(basename $FILE_PATH).sol
    forge flatten --hardhat $FILE_PATH >$OUT_PATH
    gh gist create $OUT_PATH --desc "$FILE_PATH"
    return
}

probePolygonZkEVM() {
    # exec >"$FUNCNAME.log" 2>&1
    # npx hardhat test test/contracts/polygonZkEVM.test.js
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

probe() {
    # exec >"$FUNCNAME.log" 2>&1
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol' | cut -d':' -f2 | sort -u --sort=version
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol' | cut -d':' -f2 | sort --sort=version
    # npx hardhat compile --verbose
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol'
    # grep -Elr 'pragma solidity (\^|>|)0.8.20' --exclude-dir node_modules --include='*.sol' | xargs sed -i 's|0.8.20|0.8.13|g'
    # return
    # for net in polygonL1net polygonL2net; do
    for net in b2node; do
        # run $net simpleTransfer
        # run $net simpleTransfer --help
        # run $net simpleTransfer --init-account-balance 90000
        # run $net showAccounts
        # run $net init-fund-accounts
        npm run deployRollupContract
        # scanEOAAndContract
    done
}

probeERC20PermitMock() {
    # exec >"$FUNCNAME.log" 2>&1
    time npx hardhat \
        --network polygonL1net \
        ERC20PermitMock:info \
        --addr 0x5FbDB2315678afecb367f032d93F642f64180aa3
}

probePolygonZkEVMGlobalExitRoot() {
    # exec >"$FUNCNAME.log" 2>&1
    time npx hardhat \
        --network polygonL1net \
        PolygonZkEVMGlobalExitRoot:info \
        --addr 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
}

probePolygonZkEVMTimelock() {
    # exec >"$FUNCNAME.log" 2>&1
    time npx hardhat \
        --network polygonL1net \
        PolygonZkEVMTimelock:info \
        --addr 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
}

tmp() {
    exec >"$FUNCNAME.log" 2>&1
    npm run docker:contracts
}
$@
