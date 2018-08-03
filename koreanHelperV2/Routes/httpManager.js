var request = require('request');
var parseString = require('xml2js').parseString;

module.exports = (function(){
    this.korean_search = 'http://opendict.korean.go.kr/api/search?key=${key}&q=${query}'
    this.korean_secret = '15A4C53F5510FE3CBAEE3C96291C2FEE';

    function parser(content){
        let data = ''
        parseString(content,function(err,result){
            if(err) return err;
            data = result['channel']['item'];
        });
        return data;
    }

    function bind(type, query){
        let url = null;
        if(type === 'korean'){
            url = korean_search;
            url = url.replace('${key}',this.korean_secret);
        }
        url = url.replace('${query}',encodeURIComponent(query));
        return url;
    }

    let keys = ['type', 'cat', 'definition', 'origin'];

    function http_request(method , url , option){
        if(method === 'GET'){
            request.get(url,function(err,data,body){
                var a = parser(body);
                a.forEach(element => {
                    let result = [];
                    Object.keys(element['sense'][0]).forEach(function(key){
                        if (keys.includes(key)){
                            result.push(Object.assign({}, { [key]: element["sense"][0][key][0] }));
                        }                       
                    });
                    return result;
                })
            });
        }else if(method === 'POST'){
            
        }
    }

    return {
        get : function (type, method, query){
            return http_request(method, bind(type, query));
        }
    }

})();