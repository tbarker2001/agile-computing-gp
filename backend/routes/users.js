const bcrypt = require('bcryptjs');
const router = require('express').Router();
let User = require('../models/user.model');
const { processProfile} = require('../nlp_interface');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/get_by_id/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/get_by_username/:username').get((req, res) => {
  User.findOne({"username": req.params.username})
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/get_id_by_username/:username').get((req, res) => {
  console.log(req.params);
  User.findOne({"username": req.params.username})
    .then(user => res.json(user._id.toString()))
    .catch(err => {console.error(err); throw err;})
    .catch(err => res.status(400).json('Error: ' + err));
});

// This is not used by the front-end currently
router.route('/add').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const assigned_tasks = [];
  const links = req.body.links;
  const nlp_labels = processProfile({username:username,links: links}); //links might need to be turned into json

  const newUser = new User({
    username: username,
    password: password,
    email: email,
    assigned_tasks: assigned_tasks,
    links: links,
    nlp_labels: nlp_labels
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/signup').post((req, routeres) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const assigned_tasks = [];
  const links = req.body.links;
  const nlp_labels = [];

  // todo: check if username exists, password meets min requirements, email validity

  let generatePassword = new Promise((resolve, reject) => {

    console.log("About to generate salt");

    bcrypt.genSalt(10, function (err, res) {
      const salt = res;

      console.log("About to generate hash");

      bcrypt.hash(password, salt, function (err, res) {
	const password = res;
	resolve(password);
      });
    });
  });

  // In the meantime, scrape the user's profile and extract labels
  let extractLabelsFromProfiles =
    processProfile({
      username: username,
      links: links
    }).then(result => result.model_output);

  Promise.all([generatePassword, extractLabelsFromProfiles])
    .then(results => {
      const password = results[0];
      const nlp_labels = results[1];

      const newUser = new User({
	username: username,
	password: password,
	email: email,
	assigned_tasks: assigned_tasks,
	links: links,
	nlp_labels: nlp_labels
      });
    
      console.log("About to save user to dbs");

      return newUser.save();
    })
    .then(() => {
      console.log("Saved!");
      routeres.json('User added!');
    })
    .catch(err => {
      console.log('Error: ' + err);
      routeres.status(400).json('Error: ' + err)
    });
});

router.route('/login').post((req, routeres) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("Logging in");

  User.findOne({ username: username }, function (err, res) {
    let user = res;
    if (!user){
      console.log("User not found")
      return routeres.status(400).json("Error: User does not exist");
    }
  
    bcrypt.compare(password, user.password, function(err, res) {
      const isMatch = res;
      if (!isMatch) {
        console.log(`Password not matched (in db: ${user.password}, user entered ${password}`)
        return routeres.status(400).json("Error: Incorrect password");
      }

      console.log("User logged in!")
      routeres.cookie('username', username).json('User logged in!');
    });
  });
});

module.exports = router;
