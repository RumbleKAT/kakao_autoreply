module.exports = function(request){
    this.client_id = 'lnBtCKQwLBho8tDJi4yB';
    this.client_secret = "KwMvjhMcev";
    this.api_url = "https://openapi.naver.com/v1/krdict/romanization?query=";

    function http_request(query) {
        this.api_url += encodeURI(query);
        let options = {
            url: this.api_url,
            headers: { 'X-Naver-Client-Id': this.client_id, 'X-Naver-Client-Secret': this.client_secret }
        }
        return new Promise(function(resolve,reject){
            request.get(options, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    let result = JSON.parse(body);
                    resolve(result);
                } else {
                    reject("err");
                }
            });
        });
    }
    /*
    [ { name: 'Song Myungjin', score: '99' },
    { name: 'Song Myoungjin', score: '88' },
    { name: 'Song Myeongjin', score: '64' } ]
    */

    return {
        get: function(query){
            return http_request(query)
            .then(result=>{
                return result.aResult[0].aItems;
            },err =>{
                return '해당 데이터를 찾을 수 없습니다.';
            })
        }
    }
}