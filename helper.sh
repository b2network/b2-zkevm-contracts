set -x

# NET=hardhat
NET=localhost

shopt -s expand_aliases
alias runTask="time npx hardhat --network $NET"
alias runScript="time npx hardhat run --network $NET"

repoProbe() {
    # git config --local core.hooksPath .githooks/
    # npm i
    # npm run test
    # npm run lint:fix
    # npm run lint
    # npm run deploy:ZkEVM:localhost
    # npm run gas:report
    # npm run deploy:v2:localhost
    return
}

genRollupParams() {
    runTask genRollupParams \
        --create-rollup-in deployment/v2/create_rollup_parameters.json.example \
        --deploy-in deployment/v2/deploy_parameters.json.example \
        --create-rollup-out deployment/v2/create_rollup_parameters.json \
        --deploy-out deployment/v2/deploy_parameters.json
    runScript deployment/testnet/prepareTestnet.ts
}

genKeystore() {
    mkdir -p keystore
    runTask genKeystore \
        --mnemonic "${MNEMONIC}" \
        --sequencer-path "m/44'/60'/0'/0/1" \
        --sequencer-passwd $SEQPWD \
        --aggreator-path "m/44'/60'/0'/0/2" \
        --aggreator-passwd $AGGPWD \
        --output keystore
}

rollupDeploy() {
    npx ts-node deployment/v2/1_createGenesis.ts --test
    runScript deployment/v2/2_deployPolygonZKEVMDeployer.ts
    runScript deployment/v2/3_deployContracts.ts
    runScript deployment/v2/4_createRollup.ts
}

fillGenesis() {
    runTask fillGenesis \
        --create-rollup deployment/v2/create_rollup_parameters.json \
        --create-rollup-output deployment/v2/create_rollup_output.json \
        --deploy-output deployment/v2/deploy_output.json \
        --genesis deployment/v2/genesis.json \
        --out /root/b2network/b2-deployment/dc/test.genesis.config.json

    return
}

rollupInit() {
    # exec >"$FUNCNAME.log" 2>&1
    set -e
    genKeystore

    npx hardhat compile
    rm -f .openzeppelin/unknown-*.json

    genRollupParams
    rollupDeploy

    jq . deployment/v2/deploy_output.json
    jq . deployment/v2/create_rollup_output.json

    sleep 10s
    fillGenesis
}

tmp() {
    # npx hardhat compile
    # rm -f deployment/testV1ToV2/deploy_ongoing.json
    # npm run prepare:testV1ToV2:ZkEVM:localhost
    # npx hardhat run deployment/testV1ToV2/prepareTestnet.ts --network hardhat
    # npm run deploy:testV1ToV2:localhost
    # rm -f .openzeppelin/unknown-*.json
    # npx ts-node deployment/testV1ToV2/1_createGenesis.ts
    # npx hardhat run deployment/testV1ToV2/2_deployPolygonZKEVMDeployer.ts --network hardhat
    # npx hardhat run deployment/testV1ToV2/3_deployContracts.ts --network hardhat
    return
}

probeConf() {
    icdiff config/test.prover.config.json /root/b2network/b2-deployment/dc/test.prover.config.json
    icdiff config/test.node.config.toml /root/b2network/b2-deployment/dc/test.node.config.toml
    # icdiff config/test.genesis.config.json /root/b2network/b2-deployment/dc/test.genesis.config.json
    return
}

deployPOL() {
    RPC_URL=http://127.0.0.1:8545
    forge script \
        script/1.1.0/Deploy.s.sol \
        --broadcast \
        --rpc-url $RPC_URL \
        --chain-id 102
    # --verify \
    # --verifier-url https://api-goerli.etherscan.io/api \
}

run(){
    runTask showAccounts --extra 0x3e8010d4a49EBD72CA7063A8ad572886B3F34Ba9
}
$@
