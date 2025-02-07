
import * as grpc from '@grpc/grpc-js';
import { connect, hash, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

// Name des Channels, in dem die Chaincode-Transaktionen ausgeführt werden.
const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
// Name des verwendeten Chaincodes (Smart Contract).
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
// Identität der Organisation (MSP - Membership Service Provider).
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Basispfad für die kryptografischen Materialien der Organisation.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', '..', 'go', 'src', 'github.com', 'stabilovic', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Pfad zum privaten Schlüssel.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Pfad zum Zertifikat.
const certDirectoryPath = envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts'));

// Pfad zum TLS-Zertifikat des Peers.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Endpunkt des Gateway-Peers.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Hostname des Peers für SSL-Zertifikate.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();

/**
 * Erstellt eine Verbindung zum Smart Contract auf dem Hyperledger Fabric Netzwerk.
 * @returns Ein Vertrag (Contract) zur Interaktion mit dem Chaincode.
 */
async function getContract() {

    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
    });

    const network = gateway.getNetwork(channelName);
    return network.getContract(chaincodeName);
    
}

/**
 * Erstellt eine neue Wahl mit den übergebenen Parametern.
 * @param electionId - Die eindeutige ID der Wahl.
 * @param candidates - Eine kommagetrennte Liste der Kandidaten.
 * @param startTime - Startzeit der Wahl als UNIX-Timestamp.
 * @param endTime - Endzeit der Wahl als UNIX-Timestamp.
 * @returns Eine Bestätigung über die erfolgreiche Erstellung.
 */
export async function createElection(electionId: string, candidates: string, startTime: number, endTime: number) {
    const contract = await getContract();
    console.log(electionId, candidates, String(startTime), String(endTime));
    await contract.submitTransaction('createElection', electionId, candidates, String(startTime), String(endTime));
    return {message: 'Wahl erstellt'};
    
}

/**
 * Gibt eine Stimme für einen bestimmten Kandidaten ab.
 * @param electionId - Die ID der Wahl.
 * @param candidate - Der Name des gewählten Kandidaten.
 * @param voter_id - Eine eindeutige Wähler-ID.
 * @returns Eine Bestätigung über die erfolgreiche Stimmabgabe.
 */
export async function castVote(electionId: string, candidate: string, voter_id: string){
    const contract = await getContract();
    console.log('Start Vote');
    await contract.submitTransaction('castVote', electionId, candidate, voter_id);
    console.log('Erfoglreiche Stimme');
    return {message: 'Stimme abgegeben'};
}

/**
 * Ruft die Wahlergebnisse aus der Blockchain ab.
 * @param electionId - Die ID der Wahl.
 * @returns Die Wahlergebnisse als JSON-Objekt.
 */
export async function getElectionResults(electionId: string){
    const contract = await getContract();
    const results = await contract.evaluateTransaction('getElectionResults', electionId);
    return JSON.parse(utf8Decoder.decode(results));
}





//--------------------------------------------------------------------

/**
 * Erstellt eine neue gRPC-Verbindung mit TLS-Zertifikaten zum Peer.
 * @returns Ein gRPC-Client zur Kommunikation mit Hyperledger Fabric.
 */
async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

/**
 * Erstellt eine neue Identität für die Verbindung zum Netzwerk.
 * @returns Die Identität des Benutzers (bestehend aus MSP-ID und Zertifikat).
 */
async function newIdentity(): Promise<Identity> {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

/**
 * Liest den ersten Dateinamen aus einem Verzeichnis und gibt den vollständigen Pfad zurück.
 * @param dirPath - Pfad zum Verzeichnis.
 * @returns Der vollständige Pfad der ersten Datei im Verzeichnis.
 */
async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

/**
 * Erstellt eine Signatur für Transaktionen mit dem privaten Schlüssel des Benutzers.
 * @returns Einen Signierer, der Transaktionen signieren kann.
 */
async function newSigner(): Promise<Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}
/**
 * Holt einen Umgebungsvariablenwert oder gibt den Standardwert zurück.
 * @param key - Der Name der Umgebungsvariable.
 * @param defaultValue - Der Standardwert, falls die Variable nicht gesetzt ist.
 * @returns Den Wert der Umgebungsvariable oder den Standardwert.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() gibt die globalen Parameter aus.
 */
/* function displayInputParameters(): void {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
} */
