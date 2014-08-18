// web.js
var express = require("express");
var bodyParser = require('body-parser');
var aspass = require('./app-script-password.js');

var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

var request = require('request');

app.get('/api', function(req, res) {
request({
        uri: "https://script.google.com/macros/s/AKfycbxcrx98J_4u4yEmCZmTtU8pQHdU56Ov0Ob1Gdf34ndWMFqp6vV0/exec?password=" + aspass.password,
        method: "GET",
        headers: {
        }
      }, function(error, response, body) {
            console.log(response.headers);
            console.log(body);
            res.set('Content-Type', 'application/json');
            res.send(body);
      });
});

console.log("Start");

app.use(express.static(__dirname));

var port = Number(process.env.PORT || 8001);
app.listen(port, function() {
  console.log("Listening on " + port);
});
