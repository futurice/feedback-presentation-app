// web.js
var express = require("express");
var bodyParser = require('body-parser');

var logfmt = require("logfmt");
var nano = require('nano')('http://localhost:5984');
var salesforce = require('./salesforce_conn.js');
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
    db.insert({ question: "Rate the quality and timeliness of the project delivery", topic: "Care", type:"question"});
    db.insert({ question: "Rate the quality of the design work in the project", topic: "Design", type:"question"});
    db.insert({ question: "Rate the quality of the developers in the project", topic: "Development", type:"question"});
    db.insert({ question: "Rate the return of investment from the project", topic: "ROI", type:"question"});
    db.insert({ question: "Rate the project team work and chemistry with yourself", topic: "Team Work", type:"question"});
    db.insert({ question: "Rate the trust and transparency during the project", topic: "Care", type:"question"});
    db.insert({ question: "Rate the amount of care the project team showed in your business", topic: "Care", type:"question"});
    db.insert({ question: "Rate the way the project team has changed the way of working and thinking", topic: "Team Work", type:"question"});
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
      
      "views": { 
          "questions": 
          {  
            "map": 
            function(doc)
            {
              if(doc.type && doc.type == 'question') {
                emit(doc.type, doc);
              }
            }
          },
          "projects": 
          {  
            "map": 
            function(doc)
            {
              if(doc.type && doc.type == 'project' && doc.project_name)
              {
                emit(doc.project_name, doc);
              }
            }
          }
        }
      }, '_design/views', function (error, response) {});
      insertbsdata(db);
    });
  });
}

//migration();

app.get('/api/opportunities', function(req, res) {
		salesforce.getSalesforceData(function(data)
		{
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
		});
});

app.get('/api/projects', function(req, res) {
  db.view('views', 'projects', function(err, body) {
    if (!err) {
      res.send(JSON.stringify(body.rows));
    }
    else 
    {
      res.send(404);
    }
  });
});


app.post('/api/futufeedback', function(req, res) {
  req.body.type = 'project';
  db.insert(req.body, function(err, body) {
    if (!err) {
      res.send();
    }
    else {
      res.send(404);
    }
  });
});

app.get('/api/futufeedback', function(req, res) {
  res.set('Content-Type', 'application/json');
  db.view('views', 'questions', function(err, body) {
    if (!err) {
      var questionlist = body.rows.map(
        function(elem) {
          return {'question':elem.value.question, 'topic': elem.value.topic, 'answer': 0};
        }
        );
      res.send(JSON.stringify(questionlist));
    }
  });
});

app.use(express.static(__dirname));

var port = Number(process.env.PORT || 8001);
app.listen(port, function() {
  console.log("Listening on " + port);
});
