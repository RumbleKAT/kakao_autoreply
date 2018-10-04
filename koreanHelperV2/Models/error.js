var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
const connection = mongoose.createConnection(
  "mongodb://rumblekat:ruki9179@ds139242.mlab.com:39242/errorhandler",
  { useNewUrlParser: true }
);
autoIncrement.initialize(connection);

var errorSchema = new schema(
    {
        id : Number,
        content : String
    }
)

errorSchema.plugin(autoIncrement.plugin, "errors");
module.exports = mongoose.model("errors",errorSchema);