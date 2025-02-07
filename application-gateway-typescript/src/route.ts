
import { Router } from 'express';
import {createElection, castVote, getElectionResults} from './blockchainService';

const router = Router();

/**
 * Route zum Erstellen einer neuen Wahl.
 * Methode: POST
 * Endpoint: /createElection
 * Erwartet im Body:
 * - election_id: Die eindeutige ID der Wahl
 * - options_parse: Eine kommagetrennte Liste der Kandidaten
 * - start_time_str: Startzeit als UNIX-Timestamp (ms)
 * - end_time_str: Endzeit als UNIX-Timestamp (ms)
 */
router.post('/createElection', async (req, res) => {
    try {
        const {election_id, options_parse, start_time_str, end_time_str} = req.body;
        const response = await createElection(election_id, options_parse, start_time_str, end_time_str);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});

/**
 * Route zur Stimmabgabe.
 * Methode: POST
 * Endpoint: /vote
 * Erwartet im Body:
 * - election_id: Die ID der Wahl
 * - options_parse: Der gewählte Kandidat
 * - voter_id: Die ID des Wählers (muss eindeutig sein)
 */
router.post('/vote', async (req, res) => {
    try {
        const {election_id, selected_text, user_id} = req.body;
        const response = await castVote(election_id, selected_text, user_id);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});

/**
 * Route zum Abrufen der Wahlergebnisse.
 * Methode: GET
 * Endpoint: /results/:electionId
 * Erwartet als Parameter:
 * - electionId: Die ID der Wahl, für die Ergebnisse abgefragt werden sollen
 */
router.get('/results/:electionId', async (req, res) => {
    try {
        const election_id = req.params.electionId;
        const response = await getElectionResults(election_id);
        res.json(response);

    } catch(error) {
        res.status(500).json({error});
    }
});

// Exportiert den Router, damit er in der Hauptanwendung genutzt werden kann
export default router;


