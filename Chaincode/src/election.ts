// SPDX-License-Identifier: Apache-2.0

import { Context, Contract } from 'fabric-contract-api';

interface ElectionAsset {
    assetId: string;
    owner: string;
    electionId: string;
}

export class ElectionAssetContract extends Contract {

    async createAsset(ctx: Context, assetId: string, owner: string, electionId: string): Promise<void> {
        const exists = await this.assetExists(ctx, assetId);
        if (exists) {
            throw new Error(`Asset ${assetId} already exists.`);
        }

        const asset: ElectionAsset = {
            assetId,
            owner,
            electionId,
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
    }

    async transferAsset(ctx: Context, assetId: string, newOwner: string): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist.`);
        }

        const asset: ElectionAsset = JSON.parse(assetJSON.toString());
        asset.owner = newOwner;

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
    }

    async getAsset(ctx: Context, assetId: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist.`);
        }

        return assetJSON.toString();
    }

    async assetExists(ctx: Context, assetId: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(assetId);
        return assetJSON && assetJSON.length > 0;
    }

    async associateAssetWithElection(ctx: Context, assetId: string, electionId: string): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist.`);
        }

        const asset: ElectionAsset = JSON.parse(assetJSON.toString());
        asset.electionId = electionId;

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
    }
}
