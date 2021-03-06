var router = require('express').Router();
var User = require('../models/user.model');
const { processProfile, processTask, calculateMatchScores } = require('../nlp_interface');

router.post('/processTask', (req, res, next) => {
  processTask({
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
})

/// @deprecated Not used
router.post('/processProfile', (req, res, next) => {        // simply a copy of /processTask above
  processProfile({                                          
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
})

router.post('/topTasksForUser', (req, res, next) => {

  const labelled_tasks = req.body.labelled_tasks;
  const labelled_user = req.body.labelled_user;

  calculateMatchScores(labelled_tasks, labelled_user)
    .then(result => res.send(result.account_set[labelled_user.__id]))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
})

router.post('/topUsersForTask', (req, res, next) => {
  const tasks = {
    thistask: req.body
  };

  User.find()
    .then(users => Object.fromEntries(users.map(user => [
	user.username,
	user.nlp_labels
    ])))
    .then(users => calculateMatchScores(tasks, users))
    .then(result => res.send(result.task_set.thistask))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
})

module.exports = router;
