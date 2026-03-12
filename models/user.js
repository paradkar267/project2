const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const passportLocalPlugin = passportLocalMongoose.default || passportLocalMongoose;


const userSchema = new  Schema({
    email:{
        type: String,
        required:true,
    },
});

userSchema.plugin(passportLocalPlugin);

module.exports = mongoose.model("User",userSchema);
