import express, { Router } from "express";
import { createTeam, deleteTeam, getAllTeams, getTeamById, updateTeam } from "../../controllers/event.controller/team.controller";

const router: Router = express.Router();

//team routes
router.post('/', createTeam); //create team
router.get('/:eventId', getAllTeams); //get all teams
router.get('/:id', getTeamById); //get team by id
router.put('/:id', updateTeam); //update team
router.delete('/:id', deleteTeam); //delete team

export default router;