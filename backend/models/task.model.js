const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const labelSchema = require('./label.schema.js');

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },

  creator_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  date: { type: Date, required: true },

  nlp_labels: [labelSchema],
  manual_deleted_labels: [{ type: String }],
  manual_added_labels: [{ type: String }],
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
