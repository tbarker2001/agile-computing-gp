const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stateSchema = new Schema({
  text: { type: String, required: true },
  colour: { type: String, required: true },
}, {
  timestamps: true,
});

const State = mongoose.model('State', stateSchema);

module.exports = State;