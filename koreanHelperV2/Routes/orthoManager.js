module.exports = function(request, parseString){
    this.serviceKey = 'BkXR0KaNAVUUsLmj3L9fpgiE2kt8UI53d8FMJEab2MWUZTwEo3GFlss0mX0Wxrb%2FMD1mfljfPq6c%2FMAKnK23Yg%3D%3D';
    this.romanUrl = 'http://openapi.korean.go.kr/openapi/service/RomanizationService/getRomanizationList';
    this.loanUrl = 'http://openapi.korean.go.kr/openapi/service/LoanwordService/getLoanwordList';

    function setUrl(type,query){
        var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + 'mwqmHdyqQo5ani9pF4%2FD%2FCGPVS%2BmVuf0xxR6rEeDJhDH39HGTKCTRe%2FWANeu4WQMPNEDyPSlYEYWPaCtvC9trA%3D%3D';
        var url = '';
        if(type === 'roman'){
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10');
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
            queryParams += '&' + encodeURIComponent('startPage') + '=' + encodeURIComponent('1');
            queryParams += '&' + encodeURIComponent('title') + '=' + encodeURIComponent(query);
            url = this.romanUrl;
        }else if(type === 'loan'){
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10');
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
            queryParams += '&' + encodeURIComponent('title') + '=' + encodeURIComponent(query);
            url = this.loanUrl;
        }
        return url + queryParams;
    }

    function get(url,type){
        console.log(url);
        return new Promise(function(resolve,reject){
        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            if (response.statusCode === 200){
                parseString(body, function (err, result) {
                    if (err) return err;
                    console.log(result["response"]["body"][0]["items"].le);
                    result['response']['body'][0]['items'].forEach(element => {
                        if(Array.isArray(element['item'])){
                            var answer = [];
                            element['item'].forEach(obj => {
                                if (type === 'roman') {
                                    answer.push({
                                    "title": obj['title'][0],
                                    "roman": obj['roman'][0]
                                });
                                } else if (type === 'loan') {
                                    try{
                                        answer.push({
                                            "title": obj['title'][0],
                                            "country": obj['country'][0],
                                            "content": obj['content'][0],
                                            "veriety": obj['veriety'][0]
                                        });
                                    }catch(Exception){
                                        console.log(Exception);
                                    }
                                }
                            });
                            resolve(answer);
                        }else{
                            reject(true);
                        }
                    });
                })
            }else{
                console.log(body); //save log
                reject(true);
            }
        });
    });
    }

    return{
        get : function (type, query){
            return get(setUrl(type,query),type);
        }
    }
}