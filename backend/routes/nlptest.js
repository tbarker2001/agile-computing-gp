var router = require('express').Router();
var User = require('../models/user.model');
var Task = require('../models/task.model');
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
  const getTasks =
    Promise.all(Object.keys(req.body.labelled_tasks).map(taskId => 
      Task.findById(taskId)
	.then(task => [taskId, {
	  model_output: task.nlp_labels,
	  manual_added_labels: task.manual_added_labels,
	  manual_deleted_labels: task.manual_deleted_labels
	}])))
    .then(Object.fromEntries);

  const username = req.body.username;
  const getUsers = User.findOne({username: username})
  .then(user => Object.fromEntries([[username, user.nlp_labels]]));

  Promise.all([getTasks, getUsers])
    .then(([tasks, users]) => calculateMatchScores(tasks, users))
    .then(result => {console.log("r:", result); return result;})
    .then(result => res.send(result.account_set[username]))
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
