const bcrypt = require('bcryptjs');
const router = require('express').Router();
let User = require('../models/user.model');
const {processProfile} = require('../nlp_interface');

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
  const free_text = req.body.free_text;
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
  let extractLabelsFromProfiles =   /// TODO: scrape free-text as well as links? 
    processProfile({
      username: username,
      links: links,
      freeText: free_text
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
        free_text: free_text,
        nlp_labels: nlp_labels,
        is_admin: false,
        is_alive: true
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

router.route('/update/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(doc => {
      doc.username = req.body.username;
      doc.email = req.body.email;
      doc.links = req.body.links;
      doc.free_text = req.body.free_text;
      doc.nlp_labels = req.body.nlp_labels;

      return doc.save()
    })
    .then(() => res.json('User updated'))
    .catch(err => {
      console.error(err);
      res.status(400).json('Error: ' + err)
    });
});

router.route('/deactivate/:username').post((req, res) => {
  User.findOne({username: req.params.username})
    .then(doc => {
      doc.is_alive = false
      return doc.save();
    })
    .then(() => res.json('User deactivated'))
    .catch(err => {
      console.error(err);
      res.status(400).json('Error: ' + err)
    });
});


router.route('/activate/:username').post((req, res) => {
  User.findOne({"username": req.params.username})
    .then(user => {
      user.is_alive = true;

      user.save()
        .then(() => res.json('User reactivated'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/delete/').post((req, res) => {
  User.findOne({"username": req.params.username})
    .then(user => {

      user.delete()
        .then(() => res.json('User deleted'))
        .catch(err => res.status(400).json('Error: ' + err));

      Cookies.remove("username");
      window.location = '/';
    })
    .catch(err => res.status(400).json('Error: ' + err));
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
    if (!user.is_alive){
      console.log("User's account has been deactivated")
      return routeres.status(400).json("You cannot log in, as your account has been deactivated. Contact us or your manager for more info.")
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
