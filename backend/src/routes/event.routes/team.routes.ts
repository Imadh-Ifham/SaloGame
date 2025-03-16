import express from 'express';
import { upload } from '../../middleware/eventLogo';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  registerTeamForEvent
} from '../../controllers/event.controller/team.controller';


const router = express.Router();

// Event registration route
router.post('/:teamId/register-team', registerTeamForEvent);

router.post('/register', upload.single('teamLogo'), createTeam);
router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);




export default router;