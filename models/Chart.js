var mongoose = require('mongoose');

// Subdocument schema for votes
var voteSchema = new mongoose.Schema({ ip: 'String' });

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({
    x: String,
    y: []
});

// Document schema for polls
exports.ChartSchema = new mongoose.Schema({
    title: { type: String, required: true },
    variables: [choiceSchema]
});