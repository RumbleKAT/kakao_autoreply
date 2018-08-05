module.exports = function(mongoose){
    this.db = mongoose.connection;

    function dbSet(callback){
        this.db.on('error',console.error);
        this.db.once('open', function (){
            callback();
            console.log('Connected to mongod server!');
        });
        mongoose.connect( "mongodb://rumblekat:ruki9179@ds139242.mlab.com:39242/errorhandler", { useNewUrlParser: true } );
    }

    return{
        set : function(callback){
           return dbSet(callback);
        }
    }
}

