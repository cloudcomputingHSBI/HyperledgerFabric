import axios from 'axios';

const API_BASE_URL = "http://localhost:6666/api";
const NUM_TRANSACTIONS = 1000;
const NUM_LATENCY_TESTS = 100;
const electionId = 'Wahl5';

async function createElection() {
    console.log("Erstelle eine neue Wahl...");
    const response = await axios.post(`${API_BASE_URL}/createElection`, { election_id: electionId, options_parse: 'Alice,Bob', start_time_str: Date.now(), end_time_str: Date.now() + 86400000});
    return response.data.electionId;
}

async function measureTPS(electionId) {
    let txCount = 0;
    const startTime = Date.now();

    const txPromises = [];
    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
        txPromises.push(axios.post(`${API_BASE_URL}/vote`, { election_id: electionId, selected_text: "Alice", user_id: String(i)}).then(() => txCount++));
        await Promise.all(txPromises);
    }
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`TPS: ${txCount / duration}`);
}

async function measureLatency(electionId) {
    let totalLatency = 0;
    for (let i = 0; i < NUM_LATENCY_TESTS; i++) {
        const startTime = Date.now();
        await axios.post(`${API_BASE_URL}/vote`, { election_id: electionId, selected_text: "Bob", user_id: String(i+5000) });
        totalLatency += Date.now() - startTime;
    }
    console.log(`Durchschnittliche Latenz: ${totalLatency / NUM_LATENCY_TESTS} ms`);
}

//(async () => {

//})();
console.log("Starte Stresstest...");
await createElection();
console.log("Starte measureTPS");
await measureTPS(electionId);
console.log("Ende measureTPS");
console.log("Starte measureLatency");
await measureLatency(electionId);
console.log("Stresstest abgeschlossen.");