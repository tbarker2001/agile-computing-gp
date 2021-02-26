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

router.route('/signup').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const assigned_tasks = [];
  const links = req.body.links;
  const nlp_labels = [];

  // todo: check if username exists, password meets min requirements, email validity

  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(password, salt);

  const newUser = new User({
    username,
    hashed_password,
    email,
    assigned_tasks,
    links,
    nlp_labels
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/login').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let user = await User.findOne({ username: username });
  if (!user){
    return res.status(400).json("Error: User Not Exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json("Incorrect Password !");
  }

  // todo: set session

  res.json('User logged in!');
});


module.exports = router;