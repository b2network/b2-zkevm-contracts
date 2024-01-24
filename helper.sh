set -x

shopt -s expand_aliases
alias run='time npx hardhat --network '
DATE=$(date +%Y%m%d-%H%M%S)

# WORK_NET=polygonL1net polygonL2net
# WORK_NET=polygonL1net
# WORK_NET=debugB2Node
# WORK_NET=b2node
# WORK_NET=b2DevNetRollup
# WORK_NET="b2LocalRollup b2node"
WORK_NET="b2LocalRollup"
# WORK_NET=gethDev
# WORK_NET=b2node b2rollup
# WORK_NET=b2PublicTestRollup
# WORK_NET=b2PublicTestRollupMyAccount
# WORK_NET=b2PublicTestNode b2PublicTestRollup

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
    forge flatten --hardhat contracts/PolygonZkEVM.sol >tmp.sol
    return
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
    ADDR=0x67d269191c92Caf3cD7723F116c85e6E9bf55933
    for net in $WORK_NET; do
        # run b2node PolygonZkEVM:parseLog \
        #     --addr $ADDR \
        #     --txhash $txhashs | jq .
        run $net PolygonZkEVM:info \
            --addr $ADDR
    done
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
    L1NETWORK_DOCKER_COMPOSE_DIR=/root/b2network/single-client-datadir
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

jmeterTest() {
    # sleep 10m
    for net in $WORK_NET; do
        TEST_FLAG="--start-index 1 --end-index 10"

        run $net TEST:prepare \
            --min-sender-balance 50 \
            --min-balance 0.2 \
            $TEST_FLAG

        # run $net TEST:generateOfflineTx \
        #     --value 0.002 \
        #     --round 100 $TEST_FLAG

    done
}

runLoop() {
    for num in {1..300}; do
        for net in $WORK_NET; do
            run $net transfer --addr 0xffF2454a5396bf207C6cD77e857653205B57484a --value 0.001
            sleep 1m
        done
    done
}

debug() {
    set -e
    # cast to-wei 21000000000000000000000000
    # cast to-hex 21000000000000000000000000000000000000000000
    # return
    for net in $WORK_NET; do
        # run $net transfer --addr 0xffF2454a5396bf207C6cD77e857653205B57484a --value 1
        run $net transferConcurrence --concurrence 8 --addr 0xffF2454a5396bf207C6cD77e857653205B57484a --value 0.01
        # run $net transfer --help
        # run $net transfer --init-account-balance 90

        # run $net showAccounts
        # run $net getHashByHeight --heights 1

        # run $net MyERC721:deploy
        # run $net Counter:deploy
        # run $net Counter:call --addr 0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44
        # run $net GasGuzzler:deploy
        # run $net GasGuzzler:call --addr 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d

        # run $net TEST:debug

        # b2nodeADDR
        # codeAddrs='0x67d269191c92Caf3cD7723F116c85e6E9bf55933,0x3Aa5ebB10DC797CAC828524e59A333d0A371443c,0x09635F643e140090A9A8Dcd712eD6285858ceBef'
        # polygonAddr
        # codeAddrs='0x610178dA211FEF7D417bC0e6FeD39F05609AD788,0x5FbDB2315678afecb367f032d93F642f64180aa3,0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
        # run $net showContractCode --addrs $codeAddrs

        # npm run deployRollupContract
        # run $net scanEOAAndContract
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
