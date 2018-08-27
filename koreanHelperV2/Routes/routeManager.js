var fs = require('fs');
var dirManager = require('./dirManager');

module.exports = function (app, options){
    /*
     app이 지정된 위치를 기준으로 Fs
     */  
    app.get('/keyboard',function(req , res){
        dirManager.get('keyboard', function (param) {
            let temp = '';
            try {
                temp = param;
            } catch (Exception) {
                temp = 'There is no items!';
            }
            res.status(200).json(temp);
        });
    })

    app.post('/friend',function(req,res){
        dirManager.get('myFriends', function (data) {
            if (!dirManager.find(req.body["user_key"], data, "user_key")) {
                data.push(
                    { 
                        user_key: req.body["user_key"],
                        user_status : 0
                    }
                );
                dirManager.set("myFriends", data, function() {
                    res.status(200).json({ message: "정상 응답" });
                });
            } else {
              res.status(200).json({ message: "정상 응답" });
            }
        })
    });

    app.delete('/friend',function(req,res){
        dirManager.get('myFriends',function(data){
            if (dirManager.find(req.body["user_key"], data, "user_key")){
                let list = dirManager.remove(data, req.body["user_key"]);
                dirManager.set('myFriends',list, function(){
                    res.status(200).json({ message: "Found & Delete complete!" });
                });
            }else{
                res.status(200).json({ message: "Not Found" });
            }
        });
    });

    app.post('/message',function(req,res){
        dirManager.get('myFriends', function (data) {
            let user_key = req.body["user_key"];
            if (dirManager.find(user_key, data, "user_key")) {
                if(req.body.type == "buttons"){
                    if (req.body.content == "우리말 찾기") {
                        //status
                        let message = {
                            "keyboard": {
                                "type": "buttons",
                                "buttons": [
                                    "우리말 사전 찾기",
                                    "로마자 표기법 찾기",
                                    "외래어 표기법 찾기",
                                    "영어|중어|일어 번역하기",
                                    "이전으로"
                                ]
                            }
                        }
                        res.status(200).json(message);
                    } else if (req.body.content == "우리말 사전 찾기"){
                        dirManager.updateStatus("myFriends",user_key,1)
                        .then(()=>{
                            res.status(200).json({ "message" : "text" });
                        });                        
                    } else if (req.body.content == "로마자 표기법 찾기") {
                        dirManager.updateStatus("myFriends", user_key, 2)
                        .then(() => {
                            res.status(200).json({ "message": "text" });
                        });    
                    } else if (req.body.content == "외래어 표기법 찾기") {
                        dirManager.updateStatus("myFriends", user_key, 3)
                        .then(() => {
                            res.status(200).json({ "message": "text" });
                        }); 
                    } else if (req.body.content == "영어|중어|일어 번역하기") {
                        dirManager.updateStatus("myFriends", user_key, 4)
                        .then(() => {
                            res.status(200).json({ "message": "text" });
                        });
                    } else if (req.body.content == "이전으로") {
                        dirManager.updateStatus("myFriends", user_key, 0)
                        .then(() => {
                            res.redirect('/keyboard');
                        });
                    } else if (req.body.content == "우리말 도우미란?") {
                        let message = {
                            "message" : "우리말 도우미는 한글을 쓰면서 어려웠던 단어를 찾을 수 있는 국어사전 서비스와 \n 한글의 영문표기와 외래어 표기법 서비스 \n 영,중,일 한글 번역 서비스를 제공하는 챗봇 서비스입니다.",
                            "photo" : {
                                "url": "https://cdn2.iconfinder.com/data/icons/new-year-resolutions/64/resolutions-06-512.png",
                                "width": 640,
                                "height": 480
                            },
                            "message_button": {
                                "label": "홈페이지로",
                                "url": "https://www.naver.com"
                            },
                            "keyboard": {
                                "type": "buttons",
                                "buttons": [
                                    "이전으로"
                                ]
                            }
                        }
                        res.status(200).json(message);
                    } else if (req.body.type == "buttons" && req.body.content == "공식 홈페이지") {
                        res.redirect('https://www.naver.com'); //리디렉션
                    }
                } else if (req.body.type == "text"){
                    dirManager.getStatus("myFriends",user_key)
                    .then(user_status => {
                        if (user_status === 1){
                            options.korean.get('korean', 'GET', req.body.content)
                            .then(result => {
                                dirManager.updateStatus("myFriends", user_key, 0)
                                .then(status => {
                                    if(status === 'success'){
                                        res.status(200).json({ "message": result });
                                    }
                                })
                            });
                        }else if(user_status === 2){
                            //naver 
                            options.roman.get(req.body.content)
                            .then(answer => {
                                let result = "";
                                const map = answer.forEach(element => {
                                    result += '결과 : ' + element.name + '\n' + ' 정확도 : ' + element.score + '\n'
                                })
                                dirManager.updateStatus("myFriends", user_key, 0)
                                    .then(status => {
                                        if (status === 'success') {
                                            res.status(200).json({
                                                "text": result,
                                                "buttons": [
                                                    "우리말 사전 찾기",
                                                    "로마자 표기법 찾기",
                                                    "외래어 표기법 찾기",
                                                    "영어|중어|일어 번역하기",
                                                    "이전으로"
                                                ]
                                            });
                                        }
                                    });
                            },()=>{
                                dirManager.updateStatus("myFriends", user_key, 0)
                                    .then(status => {
                                    if (status === 'success') {
                                        res.status(200).json({
                                            "text": "찾으시는 내용이 발견 되지 않습니다.",
                                            "keyboard": {
                                                "type": "buttons",
                                                "buttons": [
                                                    "우리말 찾기",
                                                    "우리말 도우미란?",
                                                    "공식 홈페이지"
                                                ]
                                            }
                                        });
                                    }
                                })
                            });
                        }else if(user_status === 3){
                            options.ortho.get("loan", req.body.content)
                            .then(answer => {
                                console.log(answer);

                                },() => {
                                dirManager.updateStatus("myFriends", user_key, 0)
                                    .then(status => {
                                        if (status === 'success') {
                                            res.status(200).json({
                                                "message" : {
                                                    "text": "찾으시는 내용이 발견 되지 않습니다.",
                                                },
                                                "keyboard": {
                                                    "type": "buttons",
                                                    "buttons": [
                                                        "우리말 찾기",
                                                        "우리말 도우미란?",
                                                        "공식 홈페이지"
                                                    ]
                                                }
                                            });
                                        }
                                    })
                                });
                        }else if(user_status === 4){
                            let text_response = undefined;
                            options.papago.get(req.body.content)
                            .then(result => {
                                text_response = result;
                                return text_response;
                            },err =>{
                                text_response = err;
                                return text_response;
                            })
                            .then(text_response => {
                                dirManager.updateStatus("myFriends", user_key, 0)
                                .then(status => {
                                    if (status === 'success') {
                                        let message = { message: { text: text_response }, keyboard: { type: "buttons", buttons: ["우리말 사전 찾기", "로마자 표기법 찾기", "외래어 표기법 찾기", "영어|중어|일어 번역하기", "이전으로"] } };
                                        res.status(200).json(message);
                                    }
                                })
                            })
                        }else if(user_status == 0 && req.body.content != ""){
                            res.redirect('/keyboard');
                        }
                    });
                }
            }else {
                let message = {};
                message["message"] = { "text": 'User is not Found!! \n' };
                res.status(200).json(message);
            }
        });
    });
}
