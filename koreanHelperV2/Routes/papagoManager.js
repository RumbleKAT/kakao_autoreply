var langdetect = require("langdetect");
var dirManager = require('./dirManager');

module.exports = function(request){
    this.client_id = 'LMBXnR_gI9Y0rT00oP1J';
    this.client_secret = 'XfZbFFsYOf';
    this.api_url = 'https://openapi.naver.com/v1/language/translate';
    this.langList = ['en', 'ja', 'zh-cn'];
    
    function getClient(){
        return Object.assign({},{'clientId' : this.client_id, 'clientSecret' : this.client_secret})
    }

    function detect(param){
        return new Promise(function (resolve,reject) {
            let nation = langdetect.detectOne(param);
            var result = false;
            this.langList.some(function(element){
                if(element === nation){
                    result = true;
                }
            })
            if(result === true){
                resolve(set_option(nation, param));
            }else{
                reject(nation);
            }
        });
    }

    function set_option(source, content){
        let options = {
            url: this.api_url,
            form: { 'source': source, 'target': 'ko', 'text': content },
            headers: { 'X-Naver-Client-Id': this.client_id, 'X-Naver-Client-Secret': this.client_secret }
        }
        return options;
    }

    function http_request(options,callback){
        //console.log(options);
        request.post(options, (err,response,body) => {
            if(!err && response.statusCode === 200){
                let result = JSON.parse(body);
                callback(result["message"]["result"]["translatedText"]);
            }else{
                //save err
                callback('err');
                this.saveError(error);
            }
        });
    }

    return {
        get: function(content,res,user_key) {
           return new Promise(function(resolve,reject){
            detect(content)
                .then(param => {
                    http_request(param,function(result){
                        if(result !== 'err') resolve(result);
                        else{
                            this.saveError(param);
                            reject('Not Found!')
                        }
                    });
                },err => {
                    this.saveError(err);
                    dirManager.updateStatus("myFriends", user_key, 0)
                        .then(status => {
                            if (status === 'success') {
                                let message = { message: { text: '언어가 부합하지 않습니다...' }, keyboard: { type: "buttons", buttons: ["우리말 사전 찾기", "로마자 표기법 찾기", "외래어 표기법 찾기", "영어|중어|일어 번역하기", "이전으로"] } };
                                res.status(200).json(message);
                            }
                        });
                });
            });
        },
        getClient : function(){
            return getClient();
        }
    };
};