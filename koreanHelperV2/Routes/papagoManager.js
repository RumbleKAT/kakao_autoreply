var langdetect = require("langdetect");

module.exports = function(request){
    this.client_id = 'LMBXnR_gI9Y0rT00oP1J';
    this.client_secret = 'XfZbFFsYOf';
    this.api_url = 'https://openapi.naver.com/v1/language/translate';
    this.langList = ['en', 'ja', 'zh-cn'];

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
        request.post(options, (err,response,body) => {
            if(!err && response.statusCode === 200){
                let result = JSON.parse(body);
                callback(result["message"]["result"]["translatedText"]);
            }else{
                //save err
                callback('err');
            }
        });
    }

    return {
        get: function(content) {
           return new Promise(function(resolve,reject){
            detect(content)
                .then(param => {
                    http_request(param,function(result){
                        if(result !== 'err') resolve(result);
                        else reject('Not Found!')
                    });
                },err => {
                    console.log('err',err);
                });
            });
        } 
    };
}