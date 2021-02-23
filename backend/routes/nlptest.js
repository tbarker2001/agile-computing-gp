var router = require('express').Router();
const { processTask } = require('../nlp_interface');

router.post('/processTask', (req, res, next) => {
  processTask({
    text: req.body.text
  })
    .then(labels => {
      res.send(labels)
    })
})

module.exports = router;
