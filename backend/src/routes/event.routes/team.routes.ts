import express, { Router } from "express";
import { 
    createTeam, 
    deleteTeam, 
    getAllTeams, 
    getTeamById, 
    updateTeam, 
    getEventAllTeams,
    registerUserToTeam,
    removeUserFromTeam
 } from "../../controllers/event.controller/team.controller";

const router: Router = express.Router();

//team routes
router.post('/', createTeam); //create team
router.get('/', getAllTeams); //get all teams
router.get('/:id', getEventAllTeams); //get teams of the event
router.get('/:id', getTeamById); //get team by id
router.put('/:id', updateTeam); //update team
router.delete('/:id', deleteTeam); //delete team
router.put('/:teamId/register', registerUserToTeam); // Register user to team
router.put('/:teamId/remove', removeUserFromTeam); // Remove user from team

export default router;