const passport = require('passport'),
localStrategy = require('passport-local').Strategy,
facebookStrategy = require('passport-facebook').Strategy;

var UserModel = require('../models/user'),
config = require('../config');

// new comment
// code for local strategy 
passport.use(new localStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// code for Facebook strategy
passport.use(new facebookStrategy(config.facebookOption,
		function(accessToken, refreshToken, profile, done){
		
		//console.log(profile);
		UserModel.findOne({OauthId:profile.id},function(err,user){
		
			if(err) return done(err,null);
			
			if(user){
				done(null,user);
			
				
			}else{
				var newUser = new UserModel({
					username:profile.displayName.split(" ")[0],
					OauthId:profile.id,
					OauthToken:accessToken,
					firstname:profile.displayName.split(" ")[0],
					lastname:profile.displayName.split(" ")[1]
				});
				
				newUser.save(function(err){
				
					console.log(err);
					if(err) return done(err,null);
					
					done(null,newUser);
				});
			}
			
		});
	
}		
));