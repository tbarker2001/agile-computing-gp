const router = require('express').Router();
let ObjectID = require('mongodb').ObjectID;
let State = require('../models/state.model');
let Task = require('../models/task.model');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  Task.find()
    .populate('creator_user')
    .populate('state')
    .populate('assigned_users')
    .then(tasks => Promise.all(
      tasks.map(task =>
	Promise.all(
	  task.assigned_users.map(user => User.findById(user))
	)
	.then(users => {
	  task.assigned_users = users;
	  console.log(task.state);
	  return State.findById(task.state).then(state => {
	    task.state = state;
	    return task;
	  });
	}))
    ))
    .then(tasks => res.json(tasks))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
});

router.route('/add').post((req, res) => {
  State.findOne({text: req.body.state})
    .then(state => new Task({
      title:                   req.body.title,
      description:             req.body.description,
      state:                   state._id,
      creator_user:            req.body.creator_user,
      assigned_users:          req.body.assigned_users,
      date:                    new Date(),
      deadline:                req.body.deadline === null ? null : Date.parse(req.body.deadline),
      nlp_labels:              req.body.nlp_labels,
      manual_deleted_labels:   req.body.manual_deleted_labels,
      manual_added_labels:     req.body.manual_added_labels
    }))
    .then(newTask => newTask.save())
    .then(() => res.json('Task added!'))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
});

router.route('/assignUser').post((req, res) => {
  console.log("Looking for task " + req.body.task_id);
  User.findOne({username: req.body.username})
    .then(user => {
      Task.findById(req.body.task_id)
      .then(task => {
        task.assigned_users.push(user);
        task.save();
        user.assigned_tasks.push(task);
        user.save();
      })
    })
    .then(() => res.json('User assigned to task!'))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
});

router.route('/unassignUser').post((req, res) => {
  console.log("Looking for task " + req.body.task_id);
  User.findOne({username: req.body.username})
    .then(user => {
      Task.findById(req.body.task_id)
      .then(task => {
        const userindex = task.assigned_users.findIndex(u => String(u) == String(user._id));
        if (userindex > -1) {
          task.assigned_users.splice(userindex, 1);
        }
        task.save();

        const taskindex = user.assigned_tasks.findIndex(t => String(t) == String(task._id));
        if (taskindex > -1) {
          user.assigned_tasks.splice(taskindex, 1);
        }
        user.save();
      })
    })
    .then(() => res.json('User unassigned from task!'))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
});

router.route('/:id').get((req, res) => {
  Task.findById(req.params.id)
  .populate('creator_user')
  .populate('state')
  .populate('assigned_users')
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
      task.date = Date.parse(req.body.date);

      task.save()
        .then(() => res.json('Task updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
