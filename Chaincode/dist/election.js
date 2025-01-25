"use strict";
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionAssetContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
class ElectionAssetContract extends fabric_contract_api_1.Contract {
    createAsset(ctx, assetId, owner, electionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.assetExists(ctx, assetId);
            if (exists) {
                throw new Error(`Asset ${assetId} already exists.`);
            }
            const asset = {
                assetId,
                owner,
                electionId,
            };
            yield ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        });
    }
    transferAsset(ctx, assetId, newOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetJSON = yield ctx.stub.getState(assetId);
            if (!assetJSON || assetJSON.length === 0) {
                throw new Error(`Asset ${assetId} does not exist.`);
            }
            const asset = JSON.parse(assetJSON.toString());
            asset.owner = newOwner;
            yield ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        });
    }
    getAsset(ctx, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetJSON = yield ctx.stub.getState(assetId);
            if (!assetJSON || assetJSON.length === 0) {
                throw new Error(`Asset ${assetId} does not exist.`);
            }
            return assetJSON.toString();
        });
    }
    assetExists(ctx, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetJSON = yield ctx.stub.getState(assetId);
            return assetJSON && assetJSON.length > 0;
        });
    }
    associateAssetWithElection(ctx, assetId, electionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetJSON = yield ctx.stub.getState(assetId);
            if (!assetJSON || assetJSON.length === 0) {
                throw new Error(`Asset ${assetId} does not exist.`);
            }
            const asset = JSON.parse(assetJSON.toString());
            asset.electionId = electionId;
            yield ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        });
    }
}
exports.ElectionAssetContract = ElectionAssetContract;
