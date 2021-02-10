var express = require('express');
var router = express.Router();
var mongodb = require('mongodb')
var mongoose = require('mongoose')

// WORK IN PROGRESS: CONVERTING TO USING MONGOOSE
mongoose.connect('mongodb://localhost:27017/task-management-site');
mongoose.model('Task', {
  title: String,
  description: String,
  creation_date: Date,
  state: String,
  assigned_user_ids: [{}]
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function use_db(fun){
  var MongoClient = mongodb.MongoClient;
  // Default url for accessing mongodb
  var url = 'mongodb://localhost:27017/task-management-site'
  dbx = MongoClient.connect(url, function(err, db){
    if(err){
      console.log('Error connecting to db server.', err)
    } else {
      console.log('Connected to db server successfully.')
      fun(db);
    }
  });
}

/* GET tasks list. */
// Fetches task list from mongodb, passes it to taskslist.jade to render
router.get('/taskslist', function(req, res){
  console.log('Trying to connect')
  use_db(function(db){
    // Load tasks table
    var collection = db.collection('tasks');
    collection.find({}).toArray(function(err, result){
      if (err){
        // Print error to screen
        res.send(err);
      } else if (result.length) {
        // Render the jade file taskslist.jade, passing it the tasks table result
        res.render('taskslist', {
          "taskslist": result
        });
      } else {
        res.send('No documents found');
      }
      // Don't close db until we know the work we want to do is done
      db.close();
    });
  });
});

/* POST add task. */
router.post('/addtask', function(req, res, next) {
  use_db(function(db){
    // TO DO: VALIDATE DATA
    var collection = db.collection('tasks');
    var task1 = {
      title: req.body.title,
      description: req.body.description,
      creation_date: new Date(),
      state: "Unassigned"
    };
    collection.insert([task1], function(err, result){
      if (err){
        console.log(err);
      } else {
        // Once we've inserted into db, redirect back to /taskslist
        res.redirect("taskslist");
      }
      // Don't close db until we know the work we want to do it done
      db.close();
    });
  });
});

module.exports = router;
