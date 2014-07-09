// web.js
var express = require("express");
var bodyParser = require('body-parser')



var logfmt = require("logfmt");
var nano = require('nano')('http://localhost:5984');
var app = express();

var db;

app.use(logfmt.requestLogger());
app.use(bodyParser.json());


//MIGRATION

function migration()
{
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

    db.insert({ question: "What?", project: "jokuprokkis", answer: "3", type:"answer"});
    db.insert({ question: "Where?", project: "jokuprokkis", answer: "2", type:"answer"});
    db.insert({ question: "What?", project: "jokuprokkis", answer: "3", type:"answer"});
    db.insert({ question: "What?", project: "jokuprokkis", answer: "2", type:"answer"});


  }
  // clean up the database we created previously
  console.log('clean db')
  nano.db.destroy('futufeedback', function() {
  // create a new database
  nano.db.create('futufeedback', function() {
    // specify the database we are going to use
    db = nano.use('futufeedback');
    // and insert a document in it
    db.insert(
      { 
        "views": 
        { 
          "by_type": 
          {  "map": 
            function(doc)
            {
              if(doc.type)
              {
                emit(doc.type, doc);
              }
            }
          },
          "only_questions": 
          {  "map": 
            function(doc)
            {
              if(doc.type && doc.type == "question")
              {
                emit(doc.type, doc);
              }
            }
          },
          "by_project": 
          {  "map": 
            function(doc)
            {
              if(doc.project)
              {
                emit(doc.project, doc);
              }
            }
          },
          "average_for_question": 
          {  "map": 
            function(doc)
            {
              if(doc.type && doc.type == 'answer' && doc.question)
              {
                emit(doc.question, doc.answer);
              }
            },
             "reduce": 
            function(keys, values)
            {
              var i = 0;
              var avg = 0.0;
              for(var value in values)
              {
                avg = (avg*i +value) / (i + 1);
                i++;
              }
              return avg;
            }
          }
        }, 
        "lists" :
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
            topic: row.value.topic,
            answer: 0
          });
        }
        // make sure to stringify the results :)
      send(JSON.stringify(results));
    });
    }
  } 
}, '_design/questions', function (error, response) {
  console.log("yay");
});
    insertbsdata(db);
  });
});
}

migration();

app.get('/projects/', function(req, res) {
  res.set('Content-Type', 'application/json');
  var project_names = ['Finavia', 'Sanoma', 'SATO', 'feedbackapp!'];
  res.send(JSON.stringify(project_names));
 });

app.post('/futufeedback/:projectname', function(req, res) {
  console.log('posting stuff');
  console.log(req.body);
  console.log(req.body[0].topic);
  for(var i = 0; i < req.body.length; i++)
  {
      var a = req.body[i];
      console.log(a);
      db.insert({ question: a.question, project: req.params.projectname, answer: a.answer, type:"answer"});
  }
  res.send();
 });

app.get('/futufeedback/', function(req, res) {
  res.set('Content-Type', 'application/json');
  db.view_with_list('questions', 'only_questions', 'question_list',  function(err, body) {
  if (!err) {
    res.send(JSON.stringify(body));
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
