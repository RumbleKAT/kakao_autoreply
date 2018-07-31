var fs = require('fs');
var mongoose = require('mongoose');
var dirManager = require('./dirManager');
var promise = require('promise');


module.exports = function(app){
    /*
     app이 지정된 위치를 기준으로 Fs
    */
    app.get('/keyboard',function(req , res){
        dirManager.get('keyboard', function (param) {
            let temp = '';
            try {
                temp = JSON.parse(param);
            } catch (Exception) {
                temp = 'There is no items!';
            }
            res.status(200).json(temp);
        });
    })

    app.post('/friend',function(req,res){
        dirManager.get('myFriends', function (data) {
            if (!dirManager.find(req.body["user_key"], data, "user_key")) {
                data.push({ user_key: req.body["user_key"] });
                dirManager.set("myFriends", data, function(res) {
                    res.status(200).json({ message: "정상 응답" });
                });
            } else {
              res.status(200).json({ message: "정상 응답" });
            }
        })
    });

    app.delete('/friend',function(req,res){
        dirManager.get('myFriends',function(data){
            if (dirManager.find(req.body["user_key"], data, "user_key")){
                let list = dirManager.remove(data, req.body["user_key"]);
                dirManager.set('myFriends',list, function(){
                    res.status(200).json({ message: "Found & Delete complete!" });
                });
            }else{
                res.status(200).json({ message: "Not Found" });
            }
        });
    });

    app.post('/message',function(req,res){
        console.log(req.body['user_key']);
        res.status(200).json({ message: 'ok' });
    });

}
