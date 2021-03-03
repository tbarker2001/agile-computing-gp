const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labelSchema = new Schema({
    label	: String,
    probability	: Number 
});

module.exports = labelSchema;
