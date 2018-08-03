var langdetect = require("langdetect");

module.exports = function(request){
    this.client_id = 'LMBXnR_gI9Y0rT00oP1J';
    this.client_secret = 'XfZbFFsYOf';
    this.api_url = 'https://openapi.naver.com/v1/language/translate';
    this.langList = ['en', 'jp', 'zh-cn'];

    function detect(param, callback){
        let nation = langdetect.detectOne(param);
        var result = false;
        this.langList.forEach(function(element){
            if(element === nation){
                result = true;
                callback(nation);
            }
        })
        if(!result){
            callback('NaN');
        }
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
        request.post(options, function(err,response,body){
            if(!err && response.statusCode === 200){
                let result = JSON.parse(body);
                callback(result["message"]["result"]["translatedText"]);
            }else{
                //save err
                console.log(err);
            }
        });
    }

    return {
        get: function(content, callback) {
            detect(content,function(source){
                if(source !== 'NaN'){
                    return http_request(set_option(source, content), callback);
                }else{
                    console.log('error');
                    //save it 
                }
            });
        } 
    };
}