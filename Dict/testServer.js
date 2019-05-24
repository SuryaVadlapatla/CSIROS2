var fs = require('fs')
var axios = require('axios')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://db1:admin123@cluster1-w69jz.mongodb.net/test?retryWrites=true"
    

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false, useNewUrlParser: true}))

var words = [{label:'',definition:''}]
var myWord = [{label:''}]
var searchResult = [];
app.get('/words', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("csirodb");
        dbo.collection("words").find({}).toArray(function(err, result) {
            if (err) throw err;
            var finalResult = [];
            if(result){
                for(var  i = 0; i < result.length; i++){
                    finalResult.push(result[i].label);
                }
            }
            db.close();
            res.send(finalResult);
          });        
      });
      
})

app.post('/words', (req, res) => {
    console.log(req.body.label)
    io.emit('words',req.body.label)
    adapter(req.body.label);

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("csirodb");
        var myobj = { label: req.body.label };
        dbo.collection("words").findOne(myobj, function(err, result) {
            if (err) throw err;
            if(result){
                console.log("Word already in db");
            }
            else{
                myobj.description =  req.body.description
                dbo.collection("words").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                  });
            }
            db.close();
          });        
      });
    res.sendStatus(200);
})

io.on('connection', (socket) => {
    console.log("An user connected")
})

//app.listen(3000)
var server = http.listen(3000, () => {
    console.log("Test Server is listening on port" + server.address().port )
})

function  adapter(searchWord){
    axios.get('http://data.bioontology.org/search?q='+searchWord+'&apikey=0233b5cd-3109-40a0-b575-348de5c3fe3e')
    .then(response => {
        var result = response.data.collection.forEach(collection => {
            searchResult.label = collection.prefLabel
            searchResult.definition = collection.definition
            if(collection.definition != undefined){
                words.push({label: searchResult.label, definition: searchResult.definition})
            }
        //    words.push({label: searchResult.label, definition: searchResult.definition})
           
        });
      console.log("ok");
    })
    .catch(error => {
      console.log(error);
    });
    return;
  }