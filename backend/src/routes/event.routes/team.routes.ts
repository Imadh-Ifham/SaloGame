import express from 'express';
import upload from '../../middleware/eventLogo'
import {
  createTeam,
  updateTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  verifyMember,
  registerTeamForEvent
} from '../../controllers/event.controller/team.controller';


const router = express.Router();

// Event registration route
router.post('/:eventId/register-team', registerTeamForEvent);
router.post('/register', upload.single('teamLogo'), createTeam);
router.get('/verify-member/:token', verifyMember);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);
router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);




export default router;