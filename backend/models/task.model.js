const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  creator_username: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  state: { type: String, required: true },
  date: { type: Date, required: true },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;