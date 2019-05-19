var express=require('express')
var bodyParser=require("body-parser")
app=express();

var port=3000;

var root='/public'

app.use(express.static(__dirname+root));



console.log("Listening on port",port);


app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public'));


app.get("/test",function(request,response){
    var param=request.query.username
    console.log('get requested by'+param)
    response.send('Get Service')
})

app.post("/test",function(request,response){
    console.log(request.body)
    var data=request.body;
    console.log('post requested, here is the data:'+data)
    response.send('post service')
})
app.listen(port);