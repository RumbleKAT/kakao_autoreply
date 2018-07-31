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

    function get(method , url , option){
        if(method === 'GET'){
            request.get(url,function(err,data,body){
                var a = parser(body);
                a.forEach(element => {
                    console.log(element);
                    console.log(element['sense'][0]);
                    console.log(Array.isArray(element['sense'][0]['definition'])); //Array 일 경우 예외처리
                })
                console.log(a[0]['sense'][0]['definition'][0]);
            });
        }
    }

    return {
        get : function (type, method, query){
            return get(method, bind(type, query));
        }
    }

};