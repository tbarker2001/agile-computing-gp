const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labelSchema = new Schema({
    text    : String,
    weight  : Number 
});

module.exports = labelSchema;