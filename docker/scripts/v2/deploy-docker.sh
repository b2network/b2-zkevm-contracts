#!/bin/bash
set -x
set -e
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml down
# sudo rm -rf docker/gethData/geth_data
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml up -d geth
# sleep 5
# node docker/scripts/fund-accounts.js
cp docker/scripts/v2/deploy_parameters_docker.json deployment/v2/deploy_parameters.json
cp docker/scripts/v2/create_rollup_parameters_docker.json deployment/v2/create_rollup_parameters.json
npm run deploy:testnet:v2:localhost
# npx hardhat compile
# rm -f .openzeppelin/unknown-*.json
# npm run prepare:testnet:ZkEVM:localhost
# npx ts-node deployment/v2/1_createGenesis.ts --test
# npx hardhat run deployment/v2/2_deployPolygonZKEVMDeployer.ts --network localhost
# npx hardhat run deployment/v2/3_deployContracts.ts --network localhost
# # exit 1
# npx hardhat run deployment/v2/4_createRollup.ts --network localhost

rm -rf docker/deploymentOutput
mkdir -p docker/deploymentOutput
mv deployment/v2/deploy_output.json docker/deploymentOutput
mv deployment/v2/genesis.json docker/deploymentOutput
mv deployment/v2/create_rollup_output.json docker/deploymentOutput
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.yml down
# docker build -t hermeznetwork/geth-zkevm-contracts -f docker/Dockerfile .
# Let it readable for the multiplatform build coming later!
# sudo chmod -R go+rxw docker/gethData
