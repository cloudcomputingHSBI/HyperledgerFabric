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
exports.VotingContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
class VotingContract extends fabric_contract_api_1.Contract {
    createElection(ctx, electionId, name, candidates) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.electionExists(ctx, electionId);
            if (exists) {
                throw new Error(`Election ${electionId} already exists.`);
            }
            const election = {
                name,
                candidates: candidates.map(candidate => ({ name: candidate, voteCount: 0 })),
                totalVotes: 0,
                isActive: true,
            };
            yield ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        });
    }
    castVote(ctx, electionId, candidateName) {
        return __awaiter(this, void 0, void 0, function* () {
            const electionJSON = yield ctx.stub.getState(electionId);
            if (!electionJSON || electionJSON.length === 0) {
                throw new Error(`Election ${electionId} does not exist.`);
            }
            const election = JSON.parse(electionJSON.toString());
            if (!election.isActive) {
                throw new Error(`Election ${electionId} is not active.`);
            }
            const candidate = election.candidates.find(c => c.name === candidateName);
            if (!candidate) {
                throw new Error(`Candidate ${candidateName} does not exist in election ${electionId}.`);
            }
            candidate.voteCount += 1;
            election.totalVotes += 1;
            yield ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        });
    }
    closeElection(ctx, electionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const electionJSON = yield ctx.stub.getState(electionId);
            if (!electionJSON || electionJSON.length === 0) {
                throw new Error(`Election ${electionId} does not exist.`);
            }
            const election = JSON.parse(electionJSON.toString());
            election.isActive = false;
            yield ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        });
    }
    getElection(ctx, electionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const electionJSON = yield ctx.stub.getState(electionId);
            if (!electionJSON || electionJSON.length === 0) {
                throw new Error(`Election ${electionId} does not exist.`);
            }
            return electionJSON.toString();
        });
    }
    electionExists(ctx, electionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const electionJSON = yield ctx.stub.getState(electionId);
            return electionJSON && electionJSON.length > 0;
        });
    }
}
exports.VotingContract = VotingContract;
