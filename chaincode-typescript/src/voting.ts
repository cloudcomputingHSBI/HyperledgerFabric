// SPDX-License-Identifier: Apache-2.0

import { Context, Contract } from 'fabric-contract-api';

interface Candidate {
    name: string;
    voteCount: number;
}

interface Election {
    name: string;
    candidates: Candidate[];
    totalVotes: number;
    isActive: boolean;
}

export class VotingContract extends Contract {

    async createElection(ctx: Context, electionId: string, name: string, candidates: string[]): Promise<void> {
        const exists = await this.electionExists(ctx, electionId);
        if (exists) {
            throw new Error(`Election ${electionId} already exists.`);
        }

        const election: Election = {
            name,
            candidates: candidates.map(candidate => ({ name: candidate, voteCount: 0 })),
            totalVotes: 0,
            isActive: true,
        };

        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    async castVote(ctx: Context, electionId: string, candidateName: string): Promise<void> {
        const electionJSON = await ctx.stub.getState(electionId);
        if (!electionJSON || electionJSON.length === 0) {
            throw new Error(`Election ${electionId} does not exist.`);
        }

        const election: Election = JSON.parse(electionJSON.toString());

        if (!election.isActive) {
            throw new Error(`Election ${electionId} is not active.`);
        }

        const candidate = election.candidates.find(c => c.name === candidateName);
        if (!candidate) {
            throw new Error(`Candidate ${candidateName} does not exist in election ${electionId}.`);
        }

        candidate.voteCount += 1;
        election.totalVotes += 1;

        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    async closeElection(ctx: Context, electionId: string): Promise<void> {
        const electionJSON = await ctx.stub.getState(electionId);
        if (!electionJSON || electionJSON.length === 0) {
            throw new Error(`Election ${electionId} does not exist.`);
        }

        const election: Election = JSON.parse(electionJSON.toString());

        election.isActive = false;
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    async getElection(ctx: Context, electionId: string): Promise<string> {
        const electionJSON = await ctx.stub.getState(electionId);
        if (!electionJSON || electionJSON.length === 0) {
            throw new Error(`Election ${electionId} does not exist.`);
        }

        return electionJSON.toString();
    }

    async electionExists(ctx: Context, electionId: string): Promise<boolean> {
        const electionJSON = await ctx.stub.getState(electionId);
        return electionJSON && electionJSON.length > 0;
    }
}
