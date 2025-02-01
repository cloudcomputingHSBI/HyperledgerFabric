
import { Router } from "express";
import {createElection, castVote, getElectionResults} from './blockchainService';

const router = Router();



router.post('/elections', async (req, res) => {
    try {
        const {electionId, candidates, startTime, endTime} = req.body;
        const response = await createElection(electionId, candidates, startTime, endTime);
        res.json(response);

    } catch(error) {
        res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten1' });
    }
});
    
router.post('/vote', async (req, res) => {
    try {
        const {electionId, candidates} = req.body;
        console.log(electionId, candidates);
        const response = await castVote(electionId, candidates);
        res.json(response);

    } catch(error) {
        res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten2' });
    }
});

router.get('/results/:electionId', async (req, res) => {
    try {
        const electionId = req.params.electionId;
        const response = await getElectionResults(electionId);
        res.json(response);

    } catch(error) {
        res.status(500).json({ error: 'Ein interner Fehler ist aufgetreten3' });
    }
});


export default router;


