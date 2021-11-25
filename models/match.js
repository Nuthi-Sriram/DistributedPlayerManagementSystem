var mongoose = require("mongoose");

var matchSchema = new mongoose.Schema({
   
   name:{
       type:String
   },
   image:{
       type:String
   },
   user:{
       type:String
   }
    
});

module.exports = mongoose.model("match",matchSchema);