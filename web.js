// web.js
var express = require("express");
var bodyParser = require('body-parser');

var logfmt = require("logfmt");
var nano = require('nano')('http://localhost:5984');
var app = express();

var db;

app.use(logfmt.requestLogger());
app.use(bodyParser.json());

db = nano.use('futufeedback');

//MIGRATION

function migration()
{
  function insertbsdata(db)
  {
    db.insert({ question: "Rate the quality and timeliness of the project delivery", topic: "Management", type:"question"});
    db.insert({ question: "Rate the quality of the design work in the project", topic: "Design", type:"question"});
    db.insert({ question: "Rate the quality of the developers in the project", topic: "Development", type:"question"});
    db.insert({ question: "Rate the return of investment from the project", topic: "Business", type:"question"});
    db.insert({ question: "Rate the project team work and chemistry with yourself", topic: "Communication", type:"question"});
    db.insert({ question: "Rate the trust and transparency during the project", topic: "Communication", type:"question"});
    db.insert({ question: "Rate the amount of care the project team showed in your business", topic: "Business", type:"question"});
    db.insert({ question: "Rate the way the project team has changed the way of working and thinking", topic: "Insight", type:"question"});
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
        "projects": 
        {  "map": 
        function(doc)
        {
          if(doc.project_name)
          {
            emit(doc.project_name, doc);
          }
        }
      },
      "answers_by_project": 
      {  "map": 
      function(doc)
      {
        if(doc.type && doc.type == 'answer' && doc.project)
        {
          emit(doc.project, doc) ;
        }
      },
      "reduce": 
      function(key, values, rereduce) {

        if (!rereduce){
          values = values.map(function(elem)
          {
            return parseFloat(elem.answer);
          }
          );
          var length = values.length
          return [sum(values) / length, length]
        }else{
          var length = sum(values.map(function(v){return v[1]}))
          var avg = sum(values.map(function(v){
            return v[0] * (v[1] / length)
          }))
          return [avg, length]
        }
      }
    },
    "answers_by_question": 
    {  
      "map": 
      function(doc)
      {
        if(doc.type && doc.type == 'answer' && doc.question)
        {
          emit(doc.question, doc.answer);
        }
      },
      "reduce":
      function(key, values, rereduce) {

        if (!rereduce){
          values = values.map(function(elem)
          {
            return parseFloat(elem.answer);
          }
          );
          var length = values.length
          return [sum(values) / length, length]
        }else{
          var length = sum(values.map(function(v){return v[1]}))
          var avg = sum(values.map(function(v){
            return v[0] * (v[1] / length)
          }))
          return [avg, length]
        }
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

//migration();

app.get('/api/projects', function(req, res) {
  db.view('questions', 'projects', {reduce:false}, function(err, body) {
    if (!err) {
      console.log(body);
      res.send(JSON.stringify(body.rows));
    }
    else 
    {
      console.log(err);
      res.send(404);
    }
  });
});

app.get('/api/projects/:projectname/avg/', function(req, res) {
  db.view('questions', 'answers_by_project', {keys: [req.params.projectname], reduce:true, group:true}, function(err, body) {
    if (!err) {
      console.log(body.rows[0].value);
      res.send(JSON.stringify(body.rows[0].value[0]));
    }
    else 
    {
      console.log(err);
      res.send(404);
    }
  });
});

app.get('/api/projects/:projectname/all/', function(req, res) {
  db.view('questions', 'answers_by_project', {keys: [req.params.projectname], reduce:false}, function(err, body) {
    if (!err) {
      var questionlist = body.rows.map(
        function(elem)
        {
          return {'question':elem.value.question, 'answer': elem.value.answer, 'topic': elem.value.topic};
        }
        );
      res.send(JSON.stringify(questionlist));
    }
    else res.send(404);
  });
});

app.post('/api/futufeedback/:projectname', function(req, res) {
  console.log('posting stuff');
  console.log(req.body);
  db.insert(req.body);
  
  res.send();
});

app.get('/api/futufeedback/', function(req, res) {
console.log(req);
  res.set('Content-Type', 'application/json');
  db.view('questions', 'by_type', {keys: ['question']}, function(err, body) {
    if (!err) {
      var questionlist = body.rows.map(
        function(elem)
        {
          return {'question':elem.value.question, 'topic': elem.value.topic, 'answer': 0};
        }
        );
      res.send(JSON.stringify(questionlist));
    }
  });
});

/*
app.get('/', function(req, res) {
res.set('Content-Type', 'application/json');
  res.send('{"futuFeedbackItems":[{"topic":"Design","question":"Koska"},{"topic":"Design","question":"Miksi"},{"topic":"Design","question":"Why"},{"topic":"Development","question":"Koska"},{"topic":"Development","question":"Miksi"},{"topic":"Development","question":"Why"}]}');
});
*/
app.use(express.static(__dirname));

var port = Number(process.env.PORT || 8001);
app.listen(port, function() {
  console.log("Listening on " + port);
});
