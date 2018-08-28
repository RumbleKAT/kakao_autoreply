module.exports = function(mongoose,Error){
    this.db = mongoose.connection;

    function dbSet(callback){
        this.db.on('error',console.error);
        this.db.once('open', function (){
            callback();
            console.log('Connected to mongod server!');
        });
        mongoose.connect( "mongodb://rumblekat:ruki9179@ds139242.mlab.com:39242/errorhandler", { useNewUrlParser: true } );
    }

    this.saveError = function(param){
        var error = new Error();
        error.content = param;

        error.save(function(err) {
          if (err){
              console.log(err);
              //send telegram
          }
          else {
            console.log("Error is saved!");
            //send telegram
          }
        });
    }

    return{
        set : function(callback){
           return dbSet(callback);
        }
    }
}

