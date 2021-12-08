var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerMatchSchema = new Schema({
   name:{
       type:String
   }, 
   nomatch:{
       type:Number
   },
   user:{
       type:String
   },
   runs:{
       type:String
   },
   BF:{
       type:String
   },
   hundreds:{
       type:String
   },
   fiftys:{
       type:Number
   },
   fours:
   {
       type:String
   },
   sixs:{
     type:String 
   },
   team:{
     type:String
   },
   match:{
       type:String
   },
   date:{
       type:Date,
       default:Date.now()
   }
});


module.exports = mongoose.model("playermatchstat",playerMatchSchema);