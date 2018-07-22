var fs = require('fs');

module.exports =  (function(){
    this.keyboard = './Forms/keyboard.json';
    this.myFriends = './Forms/myFriends.json';

    function setPath(type){
        if (type == 'keyboard') {
            return this.keyboard;
        } else if (type == 'myFriends') {
            return this.myFriends;
        } else{
            return null;
        }
    }

    function getDatas(type,callback){
        fs.readFile(setPath(type),'utf8',function(err,data){
            if(err) return err;
            else{
                console.log(JSON.parse(data));
                let temp = JSON.parse(data);
                callback(temp);
            }
        })
    }

    function setDatas(type, data, callback){
        fs.writeFile(setPath(type), JSON.stringify(data),function(){
            if(err) return err;
            callback(param);
        });
    }

    function findDatas(compare , data, type){
        let findCheck = data.some(element => {
            if (element[type] == compare) {
                return true;
            }
        });
        return findCheck;
    }

    return {
        get : function(type,callback){
            return getDatas(type,callback);
        },
        set: function (type, data, callback){
            return setDatas(type, data, callback);
        },
        find: function (compare, data, type){
            return findDatas(compare, data, type);
        }
    }

})();
