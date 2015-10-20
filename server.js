//var http = require("http");
var express = require("express");
var app     = express();
var maps = require("./modules/MapsController");
var bodyParser = require('body-parser')


app.use(express.static(__dirname + '/css'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/js'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/view'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/img'));
//Store all JS and CSS in Scripts folder.

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.get('/',function(req,res){
  res.sendFile('index.html');
  //It will find and locate index.html from View or Scripts
});

app.all('/saveMap',maps.saveMap);

app.all('/loadMap/:name',maps.loadMap);

app.all('/maps',maps.listMaps);
app.all('/deleteMap/:name',maps.deleteMap);

app.listen(process.env.PORT || 3000);

console.log('Server running at http://127.0.0.1:3000/');