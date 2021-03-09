const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let State = require('./models/state.model');
let Task = require('./models/task.model');
var ObjectId = require('mongodb').ObjectID;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb://localhost:27017/task-management-site';
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');
const nlpTestRouter = require('./routes/nlptest');

app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/nlptest', nlpTestRouter);

// If no states are saved, save them to database
State.find()
  .then(states => {
    if (states.length == 0) {
      const open = new State({
	text: "OPEN",
	colour: "#AADDAA"
      });
      const closed = new State({
	text: "CLOSED",
	colour: "#DDAAAA"
      });
      Promise.all([
	open.save(),
	closed.save()
      ]).catch(console.error);
    }
  })
  .catch(console.error);

// If no tasks are saved, create tests
Task.find()
  .then(tasks => {
    if (tasks.length == 0) {
      const test1 = new Task({
        title: "Test task",
        description: "Test description",
      
        state: ObjectId("604622910a42ca3ee400063f"), //open
      
        creator_user: ObjectId("603f9540f5d0582828b665d3"), //dan
        assigned_users: [ObjectId("603ae42c75ad0e13d8fe13b0")],
      
        date: Date("2021-03-03T13:55:12.689Z"),
        deadline: Date("2021-06-06T13:55:12.689Z"),
      
        nlp_labels: [{label: "computing", probability: 1.0}],
        manual_deleted_labels: [],
        manual_added_labels: [],
      });

      Promise.all([
        test1.save(),
      ]).catch(console.error);
    }
  })
  .catch(console.error);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
