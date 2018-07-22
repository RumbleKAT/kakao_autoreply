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
                res.status(200).end('There is no items!');
            }
            res.status(200).json(temp);
        });
    })

    app.post('/friend',function(req,res){
        promise.resolve(true)
            .then(dirManager.get('myFriends', function (param) {
                if (dirManager.find(req.body['user_key'], param, 'user_key')) {
                    console.log('Found one!');
                    res.status(200).json({ 'message': '정상 응답' });
                } else {
                    temp.push({ user_key: req.body["user_key"] });
                    dirManager.set('myFriends', param, function (res) {
                        res.status(200).json({ 'message': '정상 응답' });
                    })
                }
            }))
    });

    app.delete('/friend',function(req,res){
        /*
        fs.readFile('./Forms/myFriends.json', 'utf8', function (err, data) {
            
            var findCheck = temp.some(element => {
                if (element['user_key'] == req.body['user_key']) {
                    return true;
                }
        
                if (findCheck) {
                    

                    res.status(200).json({ 'message': '정상 응답' });
                }
            });
        */
    });

    app.post('/message',function(req,res){
        console.log(req.body['user_key']);
        res.status(200).json({ message: 'ok' });
    });

}
