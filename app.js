var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/keyboard',function(req, res){
  fs.readFile( __dirname + "/data/" + "keyboard.json",'utf8',function(err,data){
    console.log(data);
    res.end(data);
  })
});

app.post('/friend',function(req,res){
  var param = req.param('user_key');
  var result = { };
  //var users = { };

  fs.readFile(__dirname + "/data/" + "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);

      if(users[users.user_key] == param)
      {
        result["success"] = 0;
        result["error"] = "EXISTED";
        res.json(result);
        return;
      }
      else{
        users["user_key"] = param;

        var writefile = JSON.stringify(users, null ,'\t');

        fs.writeFile(__dirname + "/data/" + "friend.json" , writefile ,"utf8",function(err,data){
            result = 200;
            res.json(result);
            return;
          })
      }
    })
  });

app.post('/message',function(req, res){
  var result = { };
  var user_key = req.param('user_key');
  var type = req.param('type');
  var content = req.param('content');

  if(user_key == null || type == null || content == null){
    result["success"] = 0;
    result["error"] = "Invalid Request";
    res.json(result);
    return;
  }

  if(req.body["content"] == "사전찾기"){
    fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
      var messages = JSON.parse(data);
      messages["message"] = {"text" : "국어 단어를 입력해주세요!"};
    })
    fs.writeFile(__dirname + "/data/message.json","utf8",function(err,data){
      res.end(data);
      return;
    })
  } else{
    var http = require('http'); //get방식으로 request에 대한 response를 받기위해
    var encodeURISafe = require('encodeuri-safe'); //get방식에 쓰일 파라미터 값을 인코딩하기 위해
    var param = encodeURISafe.encodeURIComponent(content);
    

  }
});

app.delete('/friend/:user_key',function(req,res){
  var result = { };
  var param = req.param('user_key');

  fs.readFile(__dirname + "/data/" + "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);

      if(users[users.user_key] != param)
      {
        result["success"] = 0;
        result["error"] = "Not Found";
        res.json(result);
        return;
      }

      else{
        delete users["user_key"];
        var writefile = JSON.stringify(users, null ,'\t');

        fs.writeFile(__dirname + "/data/" + "friend.json" , writefile ,"utf8",function(err,data){
            result = 200;
            res.json(result);
            return;
          })
      }

    })
});

app.delete('/chat_room/:user_key',function(req, res){
  var result = { };
  result = 200;
  res.json(result);
  return;
})



var server = app.listen(8080, function(){
  console.log("Run at http://localhost:8080");
});
