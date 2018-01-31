var express = require('express');
var router = express.Router();
var Trello = require("node-trello");
var path = require('path');
var config = require('../server/config.json');
var request = require('request');
var mysql = require('mysql');
var nodemailer = require('nodemailer');

var connection = mysql.createConnection({
    "host": "localhost",
    "port": 3306,
    "name": "xx",
    "user": "xxxxxxxxx",
    "password": "xxxxxxxxxx",
    "database": "xxxxxxxxxxxxx"
})

connection.connect(function(err) {
    if (err) throw err    
})

var trello = {
    trelloDevice: function(req, res) {
        var t = new Trello("xxxxxxxxxxxxxxxxxxxxxxxxx", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        var variableDetails = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            technology: req.body.technology,
            yearOfExperience: req.body.yearOfExperience
        };

        var myData = "Name:" + req.body.name + 
        "\nEmail: " + req.body.email + "\nPhone: " + req.body.phone + "\nNumber of Experience: " + req.body.yearOfExperience
        t.post("/1/cards", {
            'name': req.body.name,
            'desc': myData,
            'idLabels': config.trelloLables[req.body.technology],
            'idList': config.trelloLists[req.body.yearOfExperience]
        }, function(err, data) {
            console.log("data====", data);
            console.log("err====", err);
            if (err) throw err;
            var trelloBoardData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                technology: req.body.technology,
                yearOfExperience: req.body.yearOfExperience,
                cardId: data.id,
            }
            console.log("cardId", data.id)
            connection.query('INSERT INTO applicant SET ?', trelloBoardData, function(err, results) {
                if (err) throw err
                console.log("results", trelloBoardData)
            })
            // Implement webhook
            request.post({
                url: "https://api.trello.com/1/tokens/xxxxxxxxxxxxxxxxxxxxxxxxx/webhooks/?key=xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                form: {
                    description: req.body.name,
                    callbackURL: "xxx.xx.xx.xx:xxxx/xxxx",
                    idModel: data.id,
                }
            }, function(error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
            });

            res.render('layout', {
                title: 'Viithiisys/layout'
            });
        });
    },

    trelloHookDevice: function(initialReq, hookResponse) {
        if(initialReq.body.action.type == "commentCard" && initialReq.body.action.data.text.search("#sendemail") == 0 ) {
         
            var str = initialReq.body.action.data.text;
            initialReq.body.action.data.text = str.slice(11);

            var sql = 'SELECT * FROM applicant WHERE cardId ='+ "'"+initialReq.body.model.id+"'";
            
            connection.query(sql, function(err, results) {
                if (err) throw err
                console.log("results", results)
            
                var transporter = nodemailer.createTransport({
                    service : 'gmail',
                    auth: {
                            user: 'xxxx@xxxxxxxxxxx.xxxxx',
                            pass: 'xxxxxxxxxxxxxxxxxx'
                            }
                    })
                    var mailOptions = {
                        from: 'xxxx@xxxxxxxxxxxx.xxxxx', // sender address
                        to: results[0].email, // list of receivers
                        subject: 'trello', // Subject line
                        html: initialReq.body.action.data.text // html body
                    };
                    
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                       console.log(error);
                       return;
                    }
                    console.log('Message sent');
                    transporter.close();
                    hookResponse.status(200).end();
                });         
            })
        }
        
    }

}

module.exports = trello;