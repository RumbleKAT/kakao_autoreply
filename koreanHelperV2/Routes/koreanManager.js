module.exports = function(request, parseString){
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
        return new Promise(function(resolve,reject){
            if(method === 'GET'){
                request.get(url, function (err, response,body){
                    if (response.statusCode === 200){
                        var a = parser(body);
                        let result = [];
                        a.forEach(element => {
                            Object.keys(element['sense'][0]).forEach(function(key){
                                if (keys.includes(key)){
                                    result.push(Object.assign({}, { [key]: element["sense"][0][key][0] }));
                                }                       
                            });
                        })
                        resolve(result);
                    }
                });
            }
        });
    }

    return {
        get : (type, method, query) => {
            return http_request(method, bind(type, query));
        }
    }
};