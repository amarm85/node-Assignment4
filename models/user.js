var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose')

var Users = new mongoose.Schema({
	firstname:{
		type:String,
		default:" "
	},
	lastname:{
		type:String,
		default:" "
	},
	admin:{
		type:Boolean,
		default:false
	},
	localToken:{
		type:String,
	default:" "
	},
	OauthId:{
		type:String,
		default:" "
	},
	OauthToken:{
		type:String,
		default:" "
	}
});

Users.plugin(passportLocalMongoose);

Users.methods.getName = function(){
	return this.firstname + ' ' + this.lastname;
	
}

Users.set('toJSON',{
	transform:function(doc,ret,options){
		delete ret.localToken;
		delete ret.OauthId;
		delete ret.OauthToken;
		
	}
});

module.exports = mongoose.model('users',Users);