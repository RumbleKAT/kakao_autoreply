var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var httpRequest = require('./Routes/httpManager');

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "content-type");
    next();
});
var user = "";

var routers = require('./Routes/routeManager')(app,user);
httpRequest.get('korean','GET','국회의원');


http.createServer(app).listen(port, function () {
    console.log('Express server listening on port '+ port);
});