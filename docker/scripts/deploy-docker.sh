# sudo rm -rf docker/gethData/geth_data
# rm deployment/deploy_ongoing.json
# DEV_PERIOD=1 docker-compose -f docker/docker-compose.geth.yml up -d geth
# sleep 5
set -x
set -e

NET=b2node
# npx hardhat \
#     --network $NET \
#     init-fund-accounts

cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
cp docker/scripts/genesis_docker.json deployment/genesis.json

npx hardhat run \
    --network $NET \
    deployment/testnet/prepareTestnet.js

npx hardhat run \
    --network $NET \
    deployment/2_deployPolygonZKEVMDeployer.js

npx hardhat run \
    --network $NET \
    deployment/3_deployContracts.js

# mkdir docker/deploymentOutput
# mv deployment/deploy_output.json docker/deploymentOutput
# docker-compose -f docker/docker-compose.geth.yml down
# sudo docker build -t hermeznetwork/geth-zkevm-contracts -f docker/Dockerfile.geth .
# Let it readable for the multiplatform build coming later!
# sudo chmod -R go+rxw docker/gethData
