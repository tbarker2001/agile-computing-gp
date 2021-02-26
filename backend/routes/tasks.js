const router = require('express').Router();
let Task = require('../models/task.model');

router.route('/').get((req, res) => {
  Task.find()
    .then(tasks => res.json(tasks))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const state = req.body.state;

  const creator_user = req.body.creator_user;
  const assigned_users = [];
  const date = Date.parse(req.body.date);
  const nlp_labels = [];
  const manual_deleted_labels = [];
  const manual_added_labels = [];

  const newTask = new Task({
    title,
    description,
    state,
    creator_user,
    assigned_users,
    date,
    nlp_labels,
    manual_deleted_labels,
    manual_added_labels
  });

  newTask.save()
  .then(() => res.json('Task added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Task.findById(req.params.id)
    .then(task => res.json(task))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Task.findByIdAndDelete(req.params.id)
    .then(() => res.json('Task deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  Task.findById(req.params.id)
    .then(task => {
      task.title = req.body.title;
      task.description = req.body.description;
      task.state = req.body.state;
    
      task.creator_user = req.body.creator_user;
      task.assigned_users = [];
      task.date = Date.parse(req.body.date);
      task.nlp_labels = [];
      task.manual_deleted_labels = [];
      task.manual_added_labels = [];

      task.save()
        .then(() => res.json('Task updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;