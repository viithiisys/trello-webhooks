var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
var mysql = require('mysql');
var notifier  = require('mail-notifier');
var Imap = require('imap');
var Trello = require("node-trello");
var request = require('request');

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');

    // Receive email and Send to Trello Board
    var imap = {
        user: "XXXX@xxxxx.com",
        password: "xxxxxxx!xx#",
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        markSeen: true,
        box: 'INBOX',
        tlsOptions: { 
          rejectUnauthorized: false
        }
    };
    console.log("imap==",imap)
    var connection = mysql.createConnection({
      "host": "localhost",
      "port": 3306,
      "name": "xx",
      "user": "xxxxx",
      "password": "xxxxx",
      "database": "xxxxx"
    })

    connection.connect(function(err) {
      if (err) throw err
    })

    notifier(imap).on('mail',function(mail){
      console.log(mail.from[0].address, mail.subject);
      console.log("GOT MAIL");
      console.log(mail.text);
      var sql = 'SELECT * FROM applicant WHERE email ='+ "'"+mail.from[0].address+"'";  
      connection.query(sql, function(err, results) {
        if (err) throw err
        var t = new Trello("xxxx", "xxxxx");
          t.post("/1/cards/"+ results[0].cardId + "/actions/comments", {"text": mail.text }, function(err, data) {
            console.log(results[0].cardId);
          })
      })
        
    }).start();

  });
};
app.start();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
