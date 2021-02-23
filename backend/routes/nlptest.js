var router = require('express').Router();
const { processTask, calculateMatchScores } = require('../nlp_interface');

router.post('/processTask', (req, res, next) => {
  processTask({
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
    .catch(console.error);
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
