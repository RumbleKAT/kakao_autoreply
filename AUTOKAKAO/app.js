var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');
var config = require('./config/config');
var i18n  = require('i18n');
var MsTranslator = require("mstranslator");
var parseString = require('xml2js').parseString;
var langdetect  = require('langdetect');
var extend = require("util-extend");
var sortBy = require("sort-by");
var by = require('sortby');
var arraySort = require("array-sort");


var lanuageDect = require('languagedetect');





var parse = require('xml-parser');
var inspect = require('util').inspect;

var client = new MsTranslator({
  api_key : "789a9cf5936f46d8bcb8b7df0ce41324"
},true);

var params = {
  text: 'How\'s it going?'
  , from: 'en'
  , to: 'ja'
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/weather',function(req,res){

var request = require('request');
var url = 'http://www.kweather.co.kr/air/data/api/air_1hr_all2.xml';
var result = "";

client.translate(params, function(err, data) {
  console.log(data);
});

request({
    url: url ,
    method: 'GET'
}, function (error, response, body) {

  parseString(body, function (err, result) {
     s = result["air"]["item_10001"]; //xml로 파싱한 상태
     var string = JSON.stringify(s);
     var first = string.search("pm10Value");
     var end = string.indexOf(",",first);
     result = string.slice(first+13, end-2);
     console.log(result);
     res.json(result);
     return;
  });

});
});

app.get('/keyboard',function(req, res){
  fs.readFile( __dirname + "/data/" + "keyboard.json",'utf8',function(err,data){
    console.log(data);
    res.end(data);
  })
});

app.get("/ranking",function(req,res)
{
  var result = [];
  var object = {};
  fs.readFile("userdata.json","utf8",function(err,data){
    var userdata = JSON.parse(data);
    var count  = Object.keys(userdata).length;

    //console.log(parseInt("10"));

    for(var i = 1 ; i<count+1;i++)
    {
      result[i-1] = userdata["count"+i];
    }
    console.log(arraySort(result,'user_SCORE'));
    result = arraySort(result,'user_SCORE');

    console.log("1등:" + result[count-1].user_ID); //1등

    for(var i = 0 ; i<count ; i++)
    {
      console.log(count-i+"th:" + result[i].user_ID); //1등
      object[count-i+"th"] = result[i].user_ID;
    }
    res.json(object);

  });
});





app.get("/userdata",function(req,res){
  var user_ID = req.param("user_ID");
  var user_SCORE = req.param("user_SCORE");

  var result = {};
  fs.readFile("userdata.json","utf8",function(err,data){
    //만약 userID가 일치 할 경우 덮어씌워야함
    var userdata = JSON.parse(data); //userID와 같을 때
    console.log("길이" + Object.keys(userdata).length);
    var count  = Object.keys(userdata).length;

    console.log(userdata["count"+count].user_ID);
    //count = userdata[user_ID].count;

    if(userdata["count"+count].user_ID != user_ID ) //인증을 거치지 않은 부분
    {
      ++count;
      result["count"+count] = { "user_ID" : user_ID , "user_SCORE" : user_SCORE ,"count" : count};

      var object  = extend(userdata,result);
      console.log(object);

      var writefile = JSON.stringify(object, null ,'\t');
      fs.writeFile("userdata.json",writefile,"utf8",function(err,data){
          result = 200;
          res.json(result);
          return;
      });
    }
    else{
      result["success"] = 0;
      result["error"] = "EXISTED";
      res.json(result);
      return;
    }
});
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

              console.log(word.length);
              console.log("word: "+word[1]);

              if(content.search(":") == -1)
              {
                var message = {};

              //  var ang = langdetect.detectOne(content);
                var lng  = new lanuageDect();
                var ang  = lng.detect(content,10);

                var sol = JSON.stringify(ang);

                console.log(ang);

                //console.log("content:" + content);
                //console.log("language:" + ang);

                if(sol.search("ja") != -1 ) //일본어를 선택할 시
                {
                  console.log("일본어 켜짐");

                  var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                  var client_secret = 'XfZbFFsYOf';

                  var api_url = 'https://openapi.naver.com/v1/language/translate';
                  var request = require('request');
                  var options = {
                      url: api_url,
                      form: {'source':'ja', 'target':'ko', 'text': content },
                      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                  };
                    request.post(options, function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                        var a  = JSON.stringify(body);
                        var find = a.search("translatedText");
                        var start = a.indexOf( ":", find );
                        var end  =  a.indexOf("}",start);
                        var result = a.slice(start + 3, end -2);
                        message ={};
                        message["message"] = {"text" : result };
                        var s = JSON.stringify(message);
                        console.log(s);
                        res.end(s);
                        }
                        else {
                        //res.status(response.statusCode).end();
                        console.log('error = ' + response.statusCode);

                        var result = ":을 안붙이셨습니다. \n 양식에 맞게 :을 붙여주세요!"
                        message["message"] = {"text" : result};
                        res.json(message);

                        }
                    });
                }
                else if(sol.search("en") != -1 ) //영어를 선택할 시
                {
                  console.log("영어 켜짐");

                  var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                  var client_secret = 'XfZbFFsYOf';

                    var api_url = 'https://openapi.naver.com/v1/language/translate';
                    var request = require('request');
                    var options = {
                      url: api_url,
                      form: {'source':'en', 'target':'ko', 'text': content },
                      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                    };
                    request.post(options, function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                        var a  = JSON.stringify(body);
                        var find = a.search("translatedText");
                        var start = a.indexOf( ":", find );
                        var end  =  a.indexOf("}",start);
                        var result = a.slice(start + 3, end -2);
                          message ={};
                          message["message"] = {"text" : result };
                        var s = JSON.stringify(message);
                        console.log(s);
                        res.end(s);

                      } else {
                        //res.status(response.statusCode).end();
                        console.log('error = ' + response.statusCode);

                        var result = ":을 안붙이셨습니다. \n 양식에 맞게 :을 붙여주세요!"
                        message["message"] = {"text" : result};
                        res.json(message);
                  }
                });
              }
                else if(ang == "ko")
                {
                  console.log("한국어 단어 켜짐");
                  console.log("단어 선택");
                var url = "http://opendict.korean.go.kr/api/search?key=15A4C53F5510FE3CBAEE3C96291C2FEE&q="+ encodeURIComponent(content);

                console.log(url);

                var message = {};
                var output = '';
                var object = "";

                http.get(url,function(web){
                  web.on('data',function(buffer){
                    output += buffer;
                  });
                  web.on('end',function(){
                     object = output.toString();
                     var s = "";
                     parseString(object, function (err, result) {
                        s = result["channel"]["item"]; //xml로 파싱한 상태
                     });
                     s = JSON.stringify(s);

                    var resultword = new Array(10);
                    var resultde = new Array(10);
                    var result = "";
                    var a = 0;

                    if(s == undefined)
                    {
                      console.log(s);
                      var message ={};
                       message["message"] = {"text" : "데이터가 존재하지 않습니다."};
                       res.json(message);
                       return;
                    }
                  else{
                    while(a != -1)
                  {
                    var  i = 0;
                    var word = s.search("word");
                    console.log(word);
                    a = word;
                    var definition = s.indexOf("definition");

                    var wordstart = s.indexOf("[",word);
                    var wordend = s.indexOf("]",wordstart);
                    var wordslice = s.slice(wordstart+2, wordend-1);
                    resultword[i] = wordslice;

                    s = s.replace("word","");
                    s = s.replace(wordslice,"");

                    var depstart = s.indexOf("[",definition);
                    var depend = s.indexOf("]",depstart);
                    var depslice = s.slice(depstart+2, depend-1);
                    resultde[i] = depslice;

                    s = s.replace("definition","");
                    s = s.replace(depslice,"");
                    result += "단어: " + resultword[0] + "\n" + "의미: " +resultde[0] + "\n";
                    i++;
                  }
                    var message ={};
                    message["message"] = {"text" : result};
                    res.json(message);
                  }
                });
              });
            }
                else{
                var result = ":을 안붙이셨습니다. \n 양식에 맞게 :을 붙여주세요!"
                message["message"] = {"text" : result};
                res.json(message);
                }
              }

              else if(word.length != 2 )
              {
                console.log(":을 하나 이상 더 붙이셨습니다. \n :을 하나만 붙여주세요!");
                var message = {};

                var result = ":을 하나 이상 더 붙이셨습니다. \n :을 하나만 붙여주세요!"
                message["message"] = {"text" : result};
                res.json(message);
              }


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
              //영한사전
              else if(word[0] == "한영")
              {
                  var url = "http://endic.naver.com/translateAPI.nhn?sLn=kr&_callback=window.__jindo2_callback+"+"."+"$2431&m=getTranslate&query="+encodeURIComponent(word[1])+"&sl=ko&tl=en";
                    console.log(url);
                    // var result = {};
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
                      fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
                        var messages = JSON.parse(data);
                        // 이미지검색 결과 저장 및 번환
                        messages["message"] = {"text" : output };
                        fs.writeFile(__dirname + "/data/message.json",
                               JSON.stringify(messages, null, '\t'), "utf8", function(err, data){
                                 fs.readFile( __dirname + "/data/message.json", 'utf8', function (err, data) {
                                  res.end(data);
                                  return;
                                })
                        })
                      })
              })
             }
              else if(word[0] == "영한")
               {
                var url = "http://endic.naver.com/translateAPI.nhn?sLn=kr&_callback=window.__jindo2_callback+"+"."+"$2431&m=getTranslate&query="+encodeURIComponent(word[1])+"&sl=en&tl=ko";
                  console.log(url);
                  // var result = {};
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
                    fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
                      var messages = JSON.parse(data);
                      // 이미지검색 결과 저장 및 번환
                      messages["message"] = {"text" : output };
                      fs.writeFile(__dirname + "/data/message.json",
                             JSON.stringify(messages, null, '\t'), "utf8", function(err, data){
                               fs.readFile( __dirname + "/data/message.json", 'utf8', function (err, data) {
                                res.end(data);
                                return;
                              })
                      })
                    })
              })
             }
              else if (word[0] == "사전")
              {
                var client_id = 'ImKP3ZrLsLwL6hBgVedd';
                var client_secret = 'ptElXa9Tz5';
                var message = {};

                var title ="";
                var description="";
                var link = "";

                var api_url = "https://openapi.naver.com/v1/search/encyc?query=" + encodeURIComponent(word[1]);
                var request = require('request');
                var options = {
                  url: api_url,
                  headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                };

                request.get(options,function(error, response, body){
                  if (!error && response.statusCode == 200) {
                    res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                    var a  = JSON.parse(body);
                     title = a.items[0].title;
                     description = a.items[0].description;
                     link = a.items[0].link;

                     console.log(title + description + link);
                     var result = "제목: " + title + '\n' +"내용: " + description + "\n" + "링크: " + link;

                     // 파일 입출력
                     fs.readFile( __dirname + "/data/message.json", 'utf8',  function(err, data){
                       var messages = JSON.parse(data);
                       // 이미지검색 결과 저장 및 번환
                       messages["message"] = {"text" : result};
                       fs.writeFile(__dirname + "/data/message.json",
                              JSON.stringify(messages, null, '\t'), "utf8", function(err, data){
                                fs.readFile( __dirname + "/data/message.json", 'utf8', function (err, data) {
                                 res.end(data);
                                 return;
                               })
                       })
                     })
                    }
                    else {
                      res.status(response.statusCode).end();
                      console.log('error = ' + response.statusCode);
                    }

                });
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
                     var numstart = object.indexOf(":",errorWordCount);
                     var numend = object.indexOf(",",numstart);
                     var num = object.slice(numstart+1, numend);

                     var result = "";

                     if(num == 0)
                     {
                       message["message"] = {"text" : "틀린 문장이 없습니다."};
                       res.json(message);
                     }
                       while(num != 0)
                       {
                         var helpMessage = object.search("helpMessage");
                         var helpstart = object.indexOf(":",helpMessage);
                         var helpend = object.indexOf("}",helpstart);
                         var helpresult = object.slice(helpstart,helpend);

                         object = object.replace("helpMessage","");
                         object = object.replace(helpresult,"");

                         result += "지적사항: " + helpresult ;
                         num--;
                       }
                       var a = result.search("u00");

                       while(a != -1)
                       {
                         result = result.replace("u00","");
                         result = result.replace("\\27","");
                         a = result.search("u00");
                         console.log(a);
                       }

                       message["message"] = {"text" : result };
                       res.json(message);
                  });
                })//http request
              }

            });
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
