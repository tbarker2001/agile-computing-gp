const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkSchema = new Schema({
    link_type: String,
    url: String,
});

module.exports = linkSchema;