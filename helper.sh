set -x

shopt -s expand_aliases
alias run='time npx hardhat --network '
DATE=$(date +%Y%m%d-%H%M%S)

init() {
    # npm i
    # npm install hardhat-function-signatures
    # npm run test
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

test() {
    # npx hardhat test test/contracts/**.test.js
    npx hardhat test test/contracts/polygonZkEVM.test.js
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

initRollup() {
    # exec >"$FUNCNAME-$DATE.log" 2>&1
    set -e
    # repo: git@github.com:b2network/b2-node-single-client-all-data.git
    L1NETWORK_DOCKER_COMPOSE_DIR=/root/b2-node-single-client-all-data
    cd $L1NETWORK_DOCKER_COMPOSE_DIR
    docker-compose down
    bash helper.sh restore
    docker-compose up -d
    sleep 10s
    docker-compose ps
    docker-compose logs --tail 20
    cd -
    npm run docker:contracts
    cd $L1NETWORK_DOCKER_COMPOSE_DIR
    docker-compose down
    git add .
    cd -
}

probe() {
    # deploy:testnet:ZkEVM:localhost
    # rm -f .openzeppelin/unknown-31337.json
    # node deployment/1_createGenesis.js
    # npx hardhat run deployment/2_deployPolygonZKEVMDeployer.js --network localhost
    # npx hardhat run deployment/3_deployContracts.js --network localhost

    # exec >"$FUNCNAME.log" 2>&1
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol' | cut -d':' -f2 | sort -u --sort=version
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol' | cut -d':' -f2 | sort --sort=version
    # npx hardhat compile #--verbose
    # return
    # grep -Eor 'pragma solidity (\^|>|)0.[0-9]{1,}.[0-9]{1,}' --exclude-dir node_modules --include='*.sol'
    # grep -Elr 'pragma solidity (\^|>|)0.8.20' --exclude-dir node_modules --include='*.sol' | xargs sed -i 's|0.8.20|0.8.13|g'

    grep -Er 'PolygonZkEVMGlobalExitRootL2' \
        --exclude-dir node_modules \
        --exclude-dir artifacts
    return

    grep -Er 'fork' \
        --exclude-dir node_modules \
        --exclude-dir artifacts \
        --include='*.js'

    # --include='*.sol'
    # --include='*.json'
    return
}

debug() {
    # for net in polygonL1net polygonL2net; do
    # for net in polygonL1net; do
    # for net in polygonL2net; do
    # for net in b2node; do
    # for net in b2DevNetRollup; do
    for net in b2LocalRollup; do
        # for net in gethDev; do
        # for net in b2node b2rollup; do
        # for net in b2PublicTestRollup; do
        # for net in b2PublicTestNode b2PublicTestRollup; do
        # run $net transfer --addr 0x61097BA76cD906d2ba4FD106E757f7Eb455fc295 --value 1000
        # run $net transfer --help
        # run $net transfer --init-account-balance 90
        # run $net showAccounts
        # run $net getHashByHeight --heights 1

        TEST_FLAG="--start-index 100 --end-index 1000"

        run $net TEST:prepare \
            --min-sender-balance 100 \
            --min-balance 0.2 \
            $TEST_FLAG

        run $net TEST:generateOfflineTx \
            --value 0.002 \
            --round 2 $TEST_FLAG

        # run $net TEST:debug

        # b2nodeADDR
        # codeAddrs='0x67d269191c92Caf3cD7723F116c85e6E9bf55933,0x3Aa5ebB10DC797CAC828524e59A333d0A371443c,0x09635F643e140090A9A8Dcd712eD6285858ceBef'
        # polygonAddr
        # codeAddrs='0x610178dA211FEF7D417bC0e6FeD39F05609AD788,0x5FbDB2315678afecb367f032d93F642f64180aa3,0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
        # run $net showContractCode --addrs $codeAddrs

        # npm run deployRollupContract
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
