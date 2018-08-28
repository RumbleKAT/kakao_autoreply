module.exports = function(request){
    this.client_id_2 = 'lnBtCKQwLBho8tDJi4yB';
    this.client_secret_2 = "KwMvjhMcev";
    this.api_url_2 = "https://openapi.naver.com/v1/krdict/romanization?query=";

    function http_request(query) {
        this.api_url_2 += encodeURI(query);
        let options = {
            url: this.api_url_2,
            headers: { 'X-Naver-Client-Id': this.client_id_2, 'X-Naver-Client-Secret': this.client_secret_2 }
        }
        console.log(this.api_url);
        return new Promise(function(resolve,reject){
            request.get(options, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    let result = JSON.parse(body);
                    resolve(result);
                } else {
                    this.saveError(err);
                    reject("err");
                }
            });
        });
    }

    return {
        get: function(query){
            return http_request(query)
            .then(result=>{
                return result.aResult[0].aItems;
            },err =>{
                this.saveError(err);
                return '해당 데이터를 찾을 수 없습니다.';
            })
        }
    }
}