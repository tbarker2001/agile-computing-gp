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

router.post('/processProfile', (req, res, next) =>
  // Re-evaluate labels from profile page
  processProfile(req.body)
    .then(labels => {
      res.send(labels)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    }))

// labelled tasks should be a dict like [task_id: [model_output]]
router.post('/topTasksForUser', (req, res, next) => {
  const labelled_tasks = req.body.labelled_tasks;
  const username = req.body.username;

  User.find({username: username})
  .then(users => Object.fromEntries(users.map(user => [
user.username,
user.nlp_labels
  ])))
  .then(users => calculateMatchScores(labelled_tasks, users))
  .then(result => res.send(result.account_set[Object.keys(result.account_set)[0]]))
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
