// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('{"futuFeedbackItems":[{"topic":"Design","question":"Koska"},{"topic":"Design","question":"Miksi"},{"topic":"Design","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Development","question":"Miksi"},{"topic":"Development","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Development","question":"Miksi"},{"topic":"Design","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Communication","question":"Miksi"},{"topic":"Development","question":"Why"},{"topic":"Support","question":"Koska"},{"topic":"Random","question":"Miksi"},{"topic":"Nothing","question":"Why"}]}');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
