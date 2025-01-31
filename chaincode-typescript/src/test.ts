import { Context, Contract, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';

export class TestContract extends Contract {
    
    @Transaction()
    async ledger(ctx: Context): Promise<void> {
        console.info('Ledger wurde initialisiert');
        const message = { text: 'BITTE FUNKTIONIER!' };
        await ctx.stub.putState('message', Buffer.from(stringify(message)));
    }

    @Transaction()
    async setMsg(ctx: Context, newMessage: string): Promise<string> {
        const message = { text: newMessage };
        await ctx.stub.putState('message', Buffer.from(stringify(message)));
        return `Nachricht erfolgreich gezogen: ${newMessage}`;
    }

    @Transaction(false)
    async getMsg(ctx: Context): Promise<string> {
        const messageAsBytes = await ctx.stub.getState('message');
        if (!messageAsBytes || messageAsBytes.length === 0) {
            throw new Error('Keine Nachricht schade...');
        }
        const message = JSON.parse(messageAsBytes.toString());
        return message.text;
    }
}