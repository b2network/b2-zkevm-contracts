set -x
# set -e

NET=b2node

initFundAccount() {
    npx hardhat \
        --network $NET \
        init-fund-accounts
}

cleanOldConfig() {
    rm -rf .openzeppelin
    git checkout deployment/genesis.json
}

copyConfig() {
    cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
    cp docker/scripts/genesis_docker.json deployment/genesis.json
}

deployRollupContract() {
    exec >"$FUNCNAME.log" 2>&1
    sleep 20
    # NOTE maybe it's unnecessary
    # initFundAccount

    # NOTE maybe need to clean old config
    cleanOldConfig
    copyConfig

    npx hardhat run \
        --network $NET \
        deployment/testnet/prepareTestnet.js

    npx hardhat run \
        --network $NET \
        deployment/2_deployPolygonZKEVMDeployer.js

    npx hardhat run \
        --network $NET \
        deployment/3_deployContracts.js

    # NOTE l1(b2ndoe) status will commit and push to github repo https://github.com/b2network/b2-node-single-client-all-data
}

$@
