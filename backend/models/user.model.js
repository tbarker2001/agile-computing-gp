const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const labelSchema = require('./label.schema.js');
const linkSchema = require('./link.schema.js');

const userSchema = new Schema({
  username: {
    type: String,
    required: true, 
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true, 
    minlength: 3
  },
  email: {
    type: String,
    required: true, 
    minlength: 3
  },
  assigned_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  links: [linkSchema],
  nlp_labels: [labelSchema],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;