import { beginCell, toNano } from 'ton-core';
import { FNFTCollection, RoyaltyParams } from '../wrappers/FNFTCollection';
import { NetworkProvider } from '@ton-community/blueprint';

const OFFCHAIN_TAG = 0x01;
const BASE_URL = 'https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/';

export async function run(provider: NetworkProvider) {
    const deployer = provider.sender();
    console.log('Deploying contract with deployer address', deployer.address);
    const collectionContent = beginCell().storeInt(OFFCHAIN_TAG, 8).storeStringRefTail(BASE_URL).endCell();
    const royaltyParams: RoyaltyParams = {
        $$type: 'RoyaltyParams',
        numerator: 99n,
        denominator: 121n,
        destination: deployer.address!,
    };
    const nftCollection = provider.open(
        await FNFTCollection.fromInit(deployer.address!, collectionContent, royaltyParams)
    );
    await nftCollection.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );
    await provider.waitForDeploy(nftCollection.address);
}
