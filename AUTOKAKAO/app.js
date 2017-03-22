var express = require('express');
var app = express();
var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');
var config = require('./config/config');
var parseString = require('xml2js').parseString;
var langdetect = require("langdetect");
var extend = require("util-extend");
var languageDect = require("languagedetect");
var request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/keyboard',function(req, res){
  fs.readFile( "keyboard.json",'utf8',function(err,data){
    console.log(data);
    res.end(data);
  });
});


app.post('/friend',function(req,res){
  var param = req.param('user_key');
  var result = { };



  fs.readFile( "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);
      var a = "user_key"+param;
      var UK_Answer = users[a];

      if(UK_Answer != param)
      {
        users["user_key" + param ] = param;

        var writefile = JSON.stringify(users, null ,'\t');

        fs.writeFile( "friend.json" , writefile ,"utf8",function(err,data){
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

app.post('/message',function(req, res){
  var result = { };
  var user_key = req.param('user_key');
  var type = req.param('type');
  var content = req.param('content');

  fs.readFile( "friend.json",'utf8',function(err,data){
      var users = JSON.parse(data);
      var a = "user_key"+user_key;
      var UK_Answer = users[a];


      if(UK_Answer == user_key && type == "text" && content != "")
      {
        //데이터를 찾음
             fs.readFile( "/message.json", 'utf8', function (err, data) {
             var word = content.split(":");
             console.log(content);
             var ang;
              console.log(content.search(":"));
              if(content.search(":") == -1)
              {
                 var message = {};

                 if(content.length <= 1)
                 {
                      var message ={};
                       message["message"] = {"text" : "찾고 싶은 단어수가 하나일 경우 앞에 수식어를 붙여주세요 \n ex) 단어:해 , 단어:물 ,일한:腹    " };
                       res.json(message);
                       return;
                 }

                 try{
                   ang = langdetect.detectOne(content);
                 }
                 catch(exception)
                 {
                   console.log(exception);
                   var count;
                   var error = {};

                  fs.readFile("error.json","utf8",function(err,data){
                    var err = JSON.parse(data);
                    count = Object.keys(err).length;
                    console.log(count);

                   if(count == undefined || count == -1)
                   {
                     count = 1;
                     error["errnum"+count] = { "content " : content };
                     var writefile = JSON.stringify(error, null ,'\t');
                     fs.writeFile( "error.json" , writefile ,"utf8",function(err,data){
                          var message ={};
                         message["message"] = {"text" : "찾고 싶은 단어가 초성으로만 이루어질 때 결과가 호출되지 않습니다." };
                         res.json(message);
                      });
                    return;
                   }

                   else{
                     console.log("Before" + count);
                     ++count;
                     error["errnum"+count] = { "content " : content };
                     var object = {};
                     object  = extend(err,error);

                       fs.writeFile( "error.json" , JSON.stringify(object, null ,'\t') ,"utf8",function(err,data){
                          var message ={};
                         message["message"] = {"text" : "찾고 싶은 단어가 초성으로만 이루어질 때 결과가 호출되지 않습니다." };
                         res.json(message);
                      });
                    return;
                   }

                    });
                 }

                 if(ang == null && ang == -1 && ang == undefined)
                 {
                   console.log("detectOne error");
                    var message ={};
                    message["message"] = {"text" : "찾고 싶은 단어가 초성으로만 이루어질 때 결과가 호출되지 않습니다." };
                    res.json(message);
                    return;
                 }
                 var lng = new languageDect();
                 var bng = lng.detect(content,10);
                 var sol = JSON.stringify(bng);

                console.log(ang + bng);

                 if(ang == "ja") //일본어를 선택할 시
                {
                  console.log("일본어 켜짐");

                  var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                  var client_secret = 'XfZbFFsYOf';

                  var api_url = 'https://openapi.naver.com/v1/language/translate';
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

              else if(ang == "ko") //국어
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
                       message["message"] = {"text" : "데이터가 존재하지 않습니다. \n 찾을 형식을 정확하게 입력해 주세요! \n 단어를 찾고 싶은 분은  단어:  를 앞에 붙여주세요 \n 백과사전을 찾고 싶은 분은 백과:  을 앞에 붙여주세요! \n  한글 -> 영어 번역을 이용 하실 분은 영한: 이라고 치시면 영어로 번역해 드립니다.\n ex) 단어:서울, 백과:유재석, 한영:우리 같이 친구하자, 영한:Hi!, 한일:안녕하세요 \n, 일한:おはよう, 한일:좋은아침!, 한중:감사합니다, 중한:谢谢 \n 앞에 수식어를 안붙이고 영어->한글, 일어->한글 번역이 가능합니다.  " };
                       res.json(message);
                       return;
                    }
                    else if(s == -1) {
                       var message ={};
                       message["message"] = {"text" : "데이터가 존재하지 않습니다. \n 찾을 형식을 정확하게 입력해 주세요! \n 단어를 찾고 싶은 분은  단어:  를 앞에 붙여주세요 \n 백과사전을 찾고 싶은 분은 백과:  을 앞에 붙여주세요! \n  한글 -> 영어 번역을 이용 하실 분은 영한: 이라고 치시면 영어로 번역해 드립니다.\n ex) 단어:서울, 백과:유재석, 한영:우리 같이 친구하자, 영한:Hi!, 한일:안녕하세요 \n, 일한:おはよう, 한일:좋은아침!, 한중:감사합니다, 중한:谢谢 \n 앞에 수식어를 안붙이고 영어->한글, 일어->한글 번역이 가능합니다.  " };
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
                 message["message"] = {"text" : "찾을 형식을 정확하게 입력해 주세요! \n 단어를 찾고 싶은 분은  단어:  를 앞에 붙여주세요 \n 백과사전을 찾고 싶은 분은 백과:  을 앞에 붙여주세요! \n  한글 -> 영어 번역을 이용 하실 분은 영한: 이라고 치시면 영어로 번역해 드립니다.\n ex) 단어:서울, 백과:유재석, 한영:우리 같이 친구하자, 영한:Hi!, 한일:안녕하세요 \n, 일한:おはよう, 한일:좋은아침!, 한중:감사합니다, 중한:谢谢" };
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

              else{
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

                  }).on('error', function(e) {
                      var message ={};
                       message["message"] = {"text" : "안됨"};
                      res.json(message);
              });
                }); //http request
              }//단어

               //한영사전
              else if(word[0] == "-")
              {
                  var url_2 = "http://endic.naver.com/translateAPI.nhn?sLn=kr&_callback=window.__jindo2_callback+"+"."+"$2431&m=getTranslate&query="+encodeURIComponent(word[1])+"&sl=ko&tl=en";
                  var output_2 = '';
                  var result_2 = '';
                  var message_2 = {};

                    http.get(url_2,function(web){
                      web.on('data',function(buffer){
                        output_2 += buffer;
                      });
                      web.on('end',function(){
                        var object = output_2.toString();
                        var a = object.search("resultData");
                        var b = object.indexOf("dir",a);
                        result_2 = object.slice(a+13,b-3);

                        message_2["message"] = {"text" : result_2 };
                        res.json(message_2);
                      });
              });

            }//한영사전

            else if(word[0] == "/")
              {
                var url_3 = "http://endic.naver.com/translateAPI.nhn?sLn=kr&_callback=window.__jindo2_callback+"+"."+"$2431&m=getTranslate&query="+encodeURIComponent(word[1])+"&sl=en&tl=ko";
                  var output_3 = '';
                  var message_3 = {};

                  http.get(url_3,function(web){
                    web.on('data',function(buffer){
                      //  res.write(buffer);
                      output_3 += buffer;
                    });
                    web.on('end',function(){
                      var object = output_3.toString();
                      var a = object.search("resultData");
                      var b = object.indexOf("dir",a);
                      output_3 = object.slice(a+13,b-3);
                      message_3["message"] = {"text" : output_3 };
                        res.json(message_3);
                    });

              });
            }
            //영한사전
             else if(word[0] =="한영")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source':'ko', 'target':'en', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

     //영한사전
             else if(word[0] =="영한")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source': 'en', 'target':'ko', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

       else if(word[0] =="일한")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source':'ja', 'target':'ko', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

      else if(word[0] =="한일")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source':'ko', 'target':'ja', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

      else if(word[0] =="중한")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source':'zh-CN', 'target':'ko', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

      else if(word[0] =="한중")
             {

                var client_id = 'LMBXnR_gI9Y0rT00oP1J';
                var client_secret = 'XfZbFFsYOf';
                var query = word[1];
                var api_url = 'https://openapi.naver.com/v1/language/translate';
                var options = {
                url: api_url,
                form: {'source':'ko', 'target':'zh-CN', 'text':query},
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
               res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
              }
        });
     }

              else if (word[0] == "백과")
              {
                var client_id = 'ImKP3ZrLsLwL6hBgVedd';
                var client_secret = 'ptElXa9Tz5';

                var title ="";
                var description="";
                var link = "";
                var result = "";
                var message = {};

                var api_url = "https://openapi.naver.com/v1/search/encyc?query=" + encodeURIComponent(word[1]);
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

                     result = "내용: " + description + '\n' + "링크: " + link ;
                     console.log(result);

                     message ={};
                     message["message"] = {"text" : result };
                     var s = JSON.stringify(message);

                     res.end(s);
                  }
                    else {
                      res.status(response.statusCode).end();
                      console.log('error = ' + response.statusCode);
                    }


                });

              }
              else{
                var message ={};
                message["message"] = {"text" : "결과가 존재하지 않습니다"};
                res.json(message);
              } //네이버백과사전

              /*
              else if(word[0] == "문장")
              {
                console.log("문장 선택");

                var url_4 ="http://www.jobkorea.co.kr/Service/User/Tool/SpellCheckExecute?tBox="+ encodeURIComponent(word[1]);

                var message_4 = {};
                var output_4 = '';
                var object_4 = "";

                http.get(url_4,function(web){
                  web.on('data',function(buffer){
                  //  res.write(buffer);
                    output_4 += buffer;
                  });
                  web.on('end',function(){
                     output_4 = output_4.toString();
                     var errorWordCount = object_4.search("errorWordCount");
                     var numstart = object_4.indexOf(":",errorWordCount);
                     var numend = object_4.indexOf(",",numstart);
                     var num = object_4.slice(numstart+1, numend);
                     var numb = parseInt(num);

                     var result = "";

                     if(numb == 0)
                     {
                       message_4["message"] = {"text" : "틀린 문장이 없습니다."};
                       res.json(message_4);
                     }
                       while(numb != 0)
                       {
                         var helpMessage = object_4.search("helpMessage");
                         var helpstart = object_4.indexOf(":",helpMessage);
                         var helpend = object_4.indexOf("}",helpstart);
                         var helpresult = object_4.slice(helpstart,helpend);

                         object_4 = object_4.replace("helpMessage","");
                         object_4 = object_4.replace(helpresult,"");

                         result += "지적사항: " + helpresult ;
                         numb--;
                        console.log(result);
                       }
                       var a = result.search("u00");

                       while(a != -1)
                       {
                         result = result.replace("u00","");
                         result = result.replace("\\27","");
                         a = result.search("u00");
                         console.log(a);
                       }

                       message_4["message"] = {"text" : result };
                       res.json(message_4);
                  });
                });//http request
              }
              */
              }
        });//fs

      }
      else
     {
        console.log("Wrong data");
        result["error"] = "WRONG DATA";
        res.json(result);
        return;
     }
  });
});


app.delete('/friend',function(req,res){
  var result = { };
  var param = req.param('user_key');

      fs.readFile( "friend.json",'utf8',function(err,data){
          var users = JSON.parse(data);
          var a = "user_key"+param;
          var UK_Answer = users[a];

          if(UK_Answer == param)
          {
            delete users[a];
            var writefile = JSON.stringify(users, null ,'\t');

            fs.writeFile( "friend.json" , writefile ,"utf8",function(err,data){
                result = 200;
                res.json(result);
                return;
              });
          }

          else{
            result["Failure"] = 0;
            result["error"] = "Not Found";
            res.json(result);
            return;
          }
        });
});

app.delete('/chat_room/:user_key',function(req, res){
  var result = { };
  result = 200;
  res.json(result);
  return;
});



var server = app.listen(config.port, function(){
  console.log("Run at http://localhost:3000");
});
