var router = require('express').Router();
const { processProfile, processTask, calculateMatchScores } = require('../nlp_interface');

router.post('/processTask', (req, res, next) => {
  processTask({
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
    .catch(console.error);
})

router.post('/processProfile', (req, res, next) => {        // simply a copy of /processTask above
  processProfile({                                          
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
    .catch(console.error);
})

router.post('/topTasksForUser', (req, res, next) => {

  const labelled_tasks = req.body.labelled_tasks;
  const labelled_user = req.body.labelled_user;

  calculateMatchScores(labelled_tasks, labelled_user)
    .then(result => res.send(result.account_set[labelled_user.__id]))
    .catch(console.error)
})

router.post('/topUsersForTask', (req, res, next) => {
  const taskId = req.body.task_id;
  const taskModelOutput = req.body.task_model_output;
  let input = {};
  input[taskId] = taskModelOutput;
  // TODO make query to db
  const hardcodedUserOutputs = {
    david: [{label: 'git', probability: 0.8}],
    bob: [{label: 'git', probability: 0.3}, {label: 'css', probability: 1}]
  };
  calculateMatchScores(input, hardcodedUserOutputs)
    .then(result => res.send(result.task_set[taskId]))
    .catch(console.error)
})

module.exports = router;
