const router = require('express').Router();
let ObjectID = require('mongodb').ObjectID;
let Project = require('../models/project.model');

router.route('/add').post((req, res) => {
  State.findOne({text: req.body.state})
    .then(state => new Project({
      title: req.body.title,
    }))
    .then(newProject => newProject.save())
    .then(() => res.json('Project added!'))
    .catch(err => {
      console.error(err)
      res.status(400).json('Error: ' + err)
    })
});

router.route('/:id').get((req, res) => {
  Project.findById(req.params.id)
    .then(project => res.json(project))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/update/:id').post((req, res) => {
  Project.findById(req.params.id)
    .then(project => {
      project.title = req.body.title;

      project.save()
        .then(() => res.json('Project name updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;