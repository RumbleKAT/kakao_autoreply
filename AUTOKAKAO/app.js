var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');
var stringM  = require("string");
var config = require('./config/config');

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

  fs.readFile(__dirname + "/data/" + "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);
      var a = "user_key"+param;
      var UK_Answer = users[a];

      if(UK_Answer != param)
      {
        users["user_key" + param ] = param;

        var writefile = JSON.stringify(users, null ,'\t');

        fs.writeFile(__dirname + "/data/" + "friend.json" , writefile ,"utf8",function(err,data){
            result = 200;
            res.json(result);
            return;
          })
      }

      else{
        result["success"] = 0;
        result["error"] = "EXISTED";
        res.json(result);
        return;
      }
    })
  });

app.post('/message',function(req, res){
  var result = { };
  var user_key = req.param('user_key');
  var type = req.param('type');
  var content = req.param('content');

  fs.readFile(__dirname + "/data/" + "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);
      var a = "user_key"+user_key;
      var UK_Answer = users[a];
      var string = "text";

      if(UK_Answer == user_key && type != "" && content != "") //
      {
        //데이터를 찾음
          fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
            var messages = JSON.parse(data);
            if( type =="buttons" && content == "사전찾기"){
                messages["message"] = {"text" : "찾고 싶은 국어 단어를 찾아 주세요!"};
                res.end(data);
                return;

            fs.writeFile(__dirname + "/data/message.json",
    							 JSON.stringify(messages, null, '\t'), "utf8", function(err, data){
    				})

          }
          else{
            fs.readFile( __dirname + "/../data/message.json", 'utf8', function (err, data) {
              var url = "http://endic.naver.com/translateAPI.nhn?sLn=kr&_callback=window.__jindo2_callback+"+"."+"$2431&m=getTranslate&query="+encodeURIComponent(content)+"&sl=ko&tl=en";
              //var url = "http://opendict.korean.go.kr/api/search?key=15A4C53F5510FE3CBAEE3C96291C2FEE&q="+ encodeURIComponent(content);
              console.log(url);
              var result = {};
              var output = '';

              http.get(url,function(web){
                web.on('data',function(buffer){
                //  res.write(buffer);
                  output += buffer;
                });
                web.on('end',function(){
                  var object = output.toString();
                  var a = object.search("resultData");
                  var b = object.indexOf("dir",a);
                  output = object.slice(a+13,b-3);
                  //res.end();
                });
                console.log("Request_user_key : "+ user_key);
                console.log("Request_type : keyboard - "+ content);

                fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
                  var messages = JSON.parse(data);
                  messages["message"] = {"text" : output };
                  console.log("Send Ok!");
                  fs.writeFile(__dirname + "/data/message.json",
                         JSON.stringify(messages, null, '\t'), "utf8", function(err, data){
                  })
                  res.end(data);
                  return;
                })
              })

          })
        }
      })
    }
      else
      {
        console.log("Wrong data");
        result["error"] = "WRONG DATA";
        res.json(result);
        return;
      }
  })
});

app.delete('/friend',function(req,res){
  var result = { };
  var param = req.param('user_key');

      fs.readFile(__dirname + "/data/" + "friend.json",'utf8',function(err,data){
          var users = JSON.parse(data);
          var a = "user_key"+param;
          var UK_Answer = users[a];

          if(UK_Answer == param)
          {
            delete users[a];
            var writefile = JSON.stringify(users, null ,'\t');

            fs.writeFile(__dirname + "/data/" + "friend.json" , writefile ,"utf8",function(err,data){
                result = 200;
                res.json(result);
                return;
              })
          }

          else{
            result["Failure"] = 0;
            result["error"] = "Not Found";
            res.json(result);
            return;
          }
        })
});

app.delete('/chat_room/:user_key',function(req, res){
  var result = { };
  result = 200;
  res.json(result);
  return;
})



var server = app.listen(config.port, function(){
  console.log("Run at http://localhost:3000");
});
