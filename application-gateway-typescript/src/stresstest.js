import axios from 'axios';

// Basis-URL für die API-Endpunkte
const API_BASE_URL = "http://localhost:6666/api";
// Anzahl der Transaktionen für den TPS-Test
const NUM_TRANSACTIONS = 1000;
// Anzahl der Messungen für den Latenztest
const NUM_LATENCY_TESTS = 100;
// ID der Wahl, die getestet wird
const electionId = 'Wahl5';

/**
 * Erstellt eine neue Wahl in der API.
 * Die Wahl hat zwei Optionen: Alice und Bob.
 * Die Start- und Endzeit werden relativ zur aktuellen Zeit gesetzt.
 */
async function createElection() {
    console.log("Erstelle eine neue Wahl...");
    const response = await axios.post(`${API_BASE_URL}/createElection`, { election_id: electionId, options_parse: 'Alice,Bob', start_time_str: Date.now(), end_time_str: Date.now() + 86400000});
    return response.data.electionId;
}

/**
 * Misst die Transaktionen pro Sekunde (TPS) für eine Wahl.
 * Es werden NUM_TRANSACTIONS Stimmabgaben an die API gesendet.
 */
async function measureTPS(electionId) {
    let txCount = 0; // Zähler für erfolgreich gesendete Transaktionen
    const startTime = Date.now();

    const txPromises = [];
    for (let i = 0; i < NUM_TRANSACTIONS; i++) {
        txPromises.push(axios.post(`${API_BASE_URL}/vote`, { election_id: electionId, selected_text: "Alice", user_id: String(i)}).then(() => txCount++));
        await Promise.all(txPromises);
    }
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`TPS: ${txCount / duration}`);
}

/**
 * Misst die durchschnittliche Latenz für Stimmabgaben.
 * Es werden NUM_LATENCY_TESTS Stimmabgaben durchgeführt und die Antwortzeit gemessen.
 */
async function measureLatency(electionId) {
    let totalLatency = 0;
    for (let i = 0; i < NUM_LATENCY_TESTS; i++) {
        const startTime = Date.now();
        await axios.post(`${API_BASE_URL}/vote`, { election_id: electionId, selected_text: "Bob", user_id: String(i+5000) });
        totalLatency += Date.now() - startTime;
    }
    console.log(`Durchschnittliche Latenz: ${totalLatency / NUM_LATENCY_TESTS} ms`);
}

console.log("Starte Stresstest...");
await createElection();
console.log("Starte measureTPS");
await measureTPS(electionId);
console.log("Ende measureTPS");
console.log("Starte measureLatency");
await measureLatency(electionId);
console.log("Stresstest abgeschlossen.");