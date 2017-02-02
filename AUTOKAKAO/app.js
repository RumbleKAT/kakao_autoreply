var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');
var config = require('./config/config');
var parseString = require('xml2js').parseString;

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
      var bool = false;

      if(UK_Answer == user_key && type != "" && content != "") //
      {
        //데이터를 찾음
          fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
            var messages = JSON.parse(data);
            if( type =="buttons" && content == "우리말찾기"){
                fs.readFile( __dirname + "/data/messagesearch.json", 'utf8',  function(err, data){
                    res.end(data);
                });
            }
           else if( type =="buttons" && content == "도움말"){
                  fs.readFile( __dirname + "/data/messageinfo.json", 'utf8',  function(err, data){
                      res.end(data);
                  });
            }
          else
          {
            fs.readFile( __dirname + "/../data/message.json", 'utf8', function (err, data) {
              var word = content.split(":");

              if(word[0] == "단어")
              {
                console.log("단어 선택");
                var url = "http://opendict.korean.go.kr/api/search?key=15A4C53F5510FE3CBAEE3C96291C2FEE&q="+ encodeURIComponent(word[1]);
                console.log(url);

                var message = {};
                var output = '';
                var object = "";

                http.get(url,function(web){
                  web.on('data',function(buffer){
                  //  res.write(buffer);
                    output += buffer;
                  });
                  web.on('end',function(){
                     object = output.toString();
                     var s = "";
                     parseString(object, function (err, result) {
                        s = result["channel"]["item"]; //xml로 파싱한 상태
                     });
                    var string = JSON.stringify(s);
                    var resultword = new Array(10);
                    var resultde = new Array(10);
                    var result = "";
                    var a ="";

                    while(a != -1)
                  {
                    var  i = 0;
                    var word = string.search("word");
                    a = word;
                    var definition = string.search("definition");

                    var wordstart = string.indexOf("[",word);
                    var wordend = string.indexOf("]",wordstart);
                    var wordslice = string.slice(wordstart+2, wordend-1);
                    resultword[i] = wordslice;

                    string = string.replace("word","");
                    string = string.replace(wordslice,"");

                    var depstart = string.indexOf("[",definition);
                    var depend = string.indexOf("]",depstart);
                    var depslice = string.slice(depstart+2, depend-1);
                    resultde[i] = depslice;

                    string = string.replace("definition","");
                    string = string.replace(depslice,"");
                    result += "단어: " + resultword[0] + "\n" + "의미: " +resultde[0] + "\n";
                    i++;
                  }

                    message["message"] = {"text" : result};
                    res.json(message);

                  });
                })//http request
              }

              else if(word[0] == "문장")
              {
                console.log("문장 선택");

                var url ="http://www.jobkorea.co.kr/Service/User/Tool/SpellCheckExecute?tBox="+ encodeURIComponent(word[1]);
                console.log(url);

                var message = {};
                var output = '';
                var object = "";

                http.get(url,function(web){
                  web.on('data',function(buffer){
                  //  res.write(buffer);
                    output += buffer;
                  });
                  web.on('end',function(){
                     object = output.toString();
                     var errorWordCount = object.search("errorWordCount");


                    message["message"] = {"text" : object};
                    res.json(message);
                  });
                })//http request
              }
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
