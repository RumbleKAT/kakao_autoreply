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

    function get(url,type , callback){
        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            parseString(body, function (err, result) {
                if (err) return err;
                result['response']['body'][0]['items'].forEach(element => {
                    element['item'].forEach(obj => {
                        var answer = [];
                        answer.push(obj['title'][0]);
                        if (type === 'roman') {
                            answer.push(obj['roman'][0]);
                        } else if (type === 'loan') {
                            answer.push(obj['original'][0]);
                            answer.push(obj['veriety'][0]);
                        }
                        callback(answer);
                    });
                });
            });
        });
    }

    return{
        get : function (type, query,callback){
            return get(setUrl(type,query),type,callback);
        }
    }
}