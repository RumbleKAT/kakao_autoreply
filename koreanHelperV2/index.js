var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var request = require('request');
var app = express();
var parseString = require('xml2js').parseString;
var mongoose = require("mongoose");
var dbManager = require("./Routes/DBManager")(mongoose);
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "content-type");
    next();
});

new Promise(function (resolve, reject) {
    console.log("DB setting...");
    dbManager.set(function(){
        resolve(true);
    });
}).then(function(){
    var korean = require('./Routes/koreanManager')(request, parseString);
    var ortho = require('./Routes/orthoManager')(request, parseString);
    var papago = require('./Routes/papagoManager')(request);
    var routers = require("./Routes/routeManager")(app);
})
.then(function(){
    http.createServer(app).listen(port, function () {
        console.log('Express server listening on port ' + port);
    });  
})