// web.js
var express = require("express");
var logfmt = require("logfmt");
var nano = require('nano')('http://localhost:5984');
var app = express();


app.use(logfmt.requestLogger());

function insertbsdata(db)
{
  
  db.insert({ question: "Why?", topic: "Development", type:"question"});
  db.insert({ question: "What?", topic: "Design", type:"question"});
  db.insert({ question: "What?", topic: "Design", type:"question"});
  db.insert({ question: "What?", topic: "Design", type:"question"});
  db.insert({ question: "Where?", topic: "Development", type:"question"});
  db.insert({ question: "When?", topic: "Design", type:"question"});
  db.insert({ question: "What?", topic: "Design", type:"question"});
  db.insert({ question: "What?", topic: "Design", type:"question"});
  db.insert({ question: "What?", topic: "Communication", type:"question"});
  db.insert({ question: "What?", topic: "Communication", type:"question"});
}

//MIGRATION


// clean up the database we created previously
nano.db.destroy('futufeedback', function() {
  // create a new database
  nano.db.create('futufeedback', function() {
    // specify the database we are going to use
    var db = nano.use('futufeedback');
    // and insert a document in it
    db.insert(
    { "views": 
    { "by_topic": 
      {  "map": 
      function(doc)
     {
      if(doc.topic)
        {
         emit(doc.topic, doc);
        }
     }
    } 
   }, "lists" :
    {
      "question_list" : 
      function (head, req) {
      // specify that we're providing a JSON response
      provides('json', function() 
      {
        // create an array for our result set
        var results = [];

        while (row = getRow()) {
            results.push({
                question: row.value.question,
                topic: row.value.topic
            });
        }

        // make sure to stringify the results :)
        send(JSON.stringify({"futuFeedbackItems":results}));
      });
    }
    } 
  }, '_design/questions', function (error, response) {
  console.log("yay");
  });

  
    insertbsdata(db);
    
  });
});




app.get('/', function(req, res) {
  res.set('Content-Type', 'application/json');
  db.view('questions', 'by_question', ['Design'], function(err, body) {
  if (!err) {
	var obj = {};
	obj['futuFeedbackItems'] = body.rows;
  res.send(obj);
  }
  });
});

/*
app.get('/', function(req, res) {
res.set('Content-Type', 'application/json');
  res.send('{"futuFeedbackItems":[{"topic":"Design","question":"Koska"},{"topic":"Design","question":"Miksi"},{"topic":"Design","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Development","question":"Miksi"},{"topic":"Development","question":"Why"}]}');
});
*/
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
