// Connect to MongoDB using Mongoose
var mongoose = require('mongoose');
var db;
//console.log("what are process.env.VCAP_SERVICES: "+process.env.VCAP_SERVICES);
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    db = mongoose.createConnection('mongodb://edwardhunton:hostnation@oceanic.mongohq.com:10021/app22979394');

} else {
 //  db = mongoose.createConnection('mongodb://edwardhunton:hostnation@oceanic.mongohq.com:10021/app22979394');
   db = mongoose.createConnection('localhost', 'charts');
}

// Get Poll schema and model
var ChartSchema = require('../models/Chart.js').ChartSchema;
var Chart = db.model('charts', ChartSchema);

// Main application view
exports.index = function(req, res) {
    res.render('index');
};

// JSON API for list of polls
exports.list= function(req, res) {
    // Query Mongo for polls, just get back the question text
    Chart.find({}, 'title', function(error, charts) {
        res.json(charts);
    });
};

// JSON API for getting a single poll
exports.chart = function(req, res) {
    // Poll ID comes in the URL
    var chartId = req.params.id;

    // Find the poll by its ID, use lean as we won't be changing it
    Chart.findById(chartId, '', { lean: true }, function(err, chart) {
        if(chart) {
            var userVoted = false,
                userChoice,
                totalVotes = 0;

            // Loop through poll choices to determine if user has voted
            // on this poll, and if so, what they selected
            for(c in chart.variables) {
                var variable = chart.variables[c];

                for(v in variable.votes) {
                    var vote = variable.votes[v];
                    totalVotes++;

                    if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
                        userVoted = true;
                        userChoice = { _id: choice._id, text: choice.text };
                    }
                }
            }

            // Attach info about user's past voting on this poll
            //poll.userVoted = userVoted;
           // poll.userChoice = userChoice;

            //poll.totalVotes = totalVotes;

            res.json(chart);
        } else {
            res.json({error:true});
        }
    });
};

// JSON API for creating a new poll
exports.create = function(req, res) {
    var reqBody = req.body,
    // Filter out choices with empty text
        variables = reqBody.variables.filter(function(v) { return v.x != ''; }),
    // Build up poll object to save

        chartObj = {title: reqBody.title, variables: variables};

    // Create poll model from built up poll object
    var chart = new Chart(chartObj);

    // Save poll to DB
    chart.save(function(err, doc) {
        if(err || !doc) {
            throw 'Error';
        } else {
            res.json(doc);
        }
    });
};

exports.update = function(req, res) {
    var reqBody = req.body,
    // Filter out choices with empty text
        variables = reqBody.variables.filter(function(v) { return v.x != ''; }),
    // Build up poll object to save

        chartObj = {title: reqBody.title, variables: variables};

    // Create poll model from built up poll object
    var chart = new Chart(chartObj);

    // Save poll to DB
    chart.save(function(err, doc) {
        if(err || !doc) {
            throw 'Error';
        } else {
            res.json(doc);
        }
    });
};

exports.remove = function(req, res){
   //var chart = new Chart();

    // Save poll to DB
    var charts  = Chart.query(function(){
        for(var i in charts){
            var id = charts[i]._id;
            var chart = new Chart(charts[i]);
            chart.findByIdAndRemove(id, function(err, user) {
                    if (err) {
                        console.log('could not delete user: ' + id);
                    }

                    callback(err, user);
                }
            );
        }

}

exports.vote = function(socket) {
    socket.on('send:vote', function(data) {
        var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;

        Chart.findById(data.chart_id, function(err, chart) {
            var variable = chart.variables.id(data.variable);
            variable.votes.push({ ip: ip });

            chart.save(function(err, doc) {
                var theDoc = {
                    question: doc.question, _id: doc._id, choices: doc.choices,
                    userVoted: false, totalVotes: 0
                };

                // Loop through poll choices to determine if user has voted
                // on this poll, and if so, what they selected
                for(var i = 0, ln = doc.choices.length; i < ln; i++) {
                    var choice = doc.choices[i];

                    for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
                        var vote = choice.votes[j];
                        theDoc.totalVotes++;
                        theDoc.ip = ip;

                        if(vote.ip === ip) {
                            theDoc.userVoted = true;
                            theDoc.userChoice = { _id: choice._id, text: choice.text };
                        }
                    }
                }

                socket.emit('myvote', theDoc);
                socket.broadcast.emit('vote', theDoc);
            });
        });
    });
};