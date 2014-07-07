// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
res.set('Content-Type', 'application/json');
  res.send('{"futuFeedbackItems":[{"topic":"Design","question":"Koska"},{"topic":"Design","question":"Miksi"},{"topic":"Design","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Development","question":"Miksi"},{"topic":"Development","question":"Why"}]}');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
