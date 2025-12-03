const express = require('express');
const router = express.Router();
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  updateBugStatus,
  deleteBug,
  getBugStats
} = require('../controllers/bugController');
const { bugValidationRules, validateRequest } = require('../middleware/validation');

router
  .route('/')
  .get(getBugs)
  .post(bugValidationRules(), validateRequest, createBug);

router
  .route('/stats/summary')
  .get(getBugStats);

router
  .route('/:id')
  .get(getBug)
  .put(bugValidationRules(), validateRequest, updateBug)
  .delete(deleteBug);

router
  .route('/:id/status')
  .patch(updateBugStatus);

module.exports = router;