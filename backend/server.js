const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let State = require('./models/state.model');

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
	colour: "green"
      });
      const closed = new State({
	text: "CLOSED",
	colour: "red"
      });
      Promise.all([
	open.save(),
	closed.save()
      ]).catch(console.error);
    }
  })
  .catch(console.error);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
