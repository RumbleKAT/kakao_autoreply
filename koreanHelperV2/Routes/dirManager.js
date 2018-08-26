var fs = require('fs');

module.exports =  (function(){
    this.keyboard = './Forms/keyboard.json';
    this.myFriends = './Forms/myFriends.json';

    function remove(array, element) {
        let list = array.filter(obj => {
            return obj['user_key'] != element;
        });
        return list;
    }

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
                let temp = JSON.parse(data);
                callback(temp);
            }
        })
    }

    function updateDatas(type,user_key,status){
        return new Promise((resolve) => {
            fs.readFile(setPath(type), 'utf8', function(err, data){
                if(!err){
                    data = JSON.parse(data);
                    data.some(user => {
                        if(user['user_key'] == user_key){
                            user["user_status"] = status;
                        }
                    });
                    fs.writeFile(setPath(type),JSON.stringify(data),function(){
                        resolve('success');
                    });
                }
            });
        });
    };

    function getUserStatus(type, user_key){
        return new Promise((resolve) => {
            fs.readFile(setPath(type), 'utf8', function (err, data) {
                if (!err) {
                    data = JSON.parse(data);
                    data.some(user => {
                        if (user['user_key'] == user_key) {
                            resolve(user['user_status']);
                        }
                    });
                }
            });
        });
    }

    function setDatas(type, data, callback){
        data = JSON.stringify(data);
        fs.writeFile(setPath(type), data, function () {
            callback();
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
        },
        remove: function(array, element){
            return remove(array, element);
        },
        updateStatus : function(type,user_key,status){
            return updateDatas(type, user_key, status);            
        },
        getStatus: function (type, user_key){
            return getUserStatus(type,user_key);
        }
    }
})();
