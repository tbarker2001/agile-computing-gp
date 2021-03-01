const bcrypt = require('bcryptjs');
const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const assigned_tasks = [];
  const links = req.body.links;
  const nlp_labels = [];

  const newUser = new User({
    username,
    password,
    email,
    assigned_tasks,
    links,
    nlp_labels
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
  console.log("About to generate salt");

  bcrypt.genSalt(10, function (err, res) {
    const salt = res;

    console.log("About to generate hash");

    bcrypt.hash(password, salt, function (err, res) {
      const password = res;
      const newUser = new User({
        username,
        password,
        email,
        assigned_tasks,
        links,
        nlp_labels
      });
    
      console.log("About to save user to dbs");

      newUser.save()
        .then(() => {console.log("Saved!"); routeres.json('User added!');})
        .catch(err => {console.log('Error: ' + err); routeres.status(400).json('Error: ' + err)});
    });
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