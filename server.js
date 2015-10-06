
//var http = require("http");
var express = require("express");
var app     = express();



app.use(express.static(__dirname + '/css'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/js'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/view'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/img'));
//Store all JS and CSS in Scripts folder.



app.get('/',function(req,res){
  res.sendFile('index.html');
  //It will find and locate index.html from View or Scripts
});
var port = process.env.PORT ||3000;
app.listen(port);

console.log('Server running at http://127.0.0.1:3000/');
