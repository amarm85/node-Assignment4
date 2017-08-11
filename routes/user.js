const userRouter = require('express').Router(),
userModel = require('../models/user'),
mongoose = require('mongoose'),
verify = require('../util/verify'),
passport = require('passport');

var UserModel = require('../models/user');


//Get all user details. only the admin user can get end point.
userRouter.get('/',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){
	
	userModel.find({},function(err,users){
		if(err){
			next(err);
		}else{
			if(users){
				res.status(200).json(users);
				
			}else{
				var err = new Error('No user found in database');
				err.status = 404;
				next(err);
			}
		}
		
	});
	
	
});

userRouter.delete('/:id',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){
	
	userModel.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), function(err,user){
		
		if(err) return next(err);
		
		if(user){
			res.status(200).json({message:" user with ID " + req.params.id + " has been deleted"});
		}else{
			res.status(404).json({message:" user with ID " + req.params.id + " not found in database"});
		}
		
	} );
	
});

//Register user to Database
userRouter.post('/register',function(req,res,next){
	UserModel.register(new UserModel({username:req.body.username}),req.body.password,function(err,user){

		if(err){
			res.status(500).json({"err":err});
		}else{
			
			if(req.body.firstname){
				user.firstname = req.body.firstname;
			}
			

			if(req.body.lastname){
				user.lastname = req.body.lastname;
			}
			
			user.save(function(err,user){
				
				if(err) return next(err);
					
				passport.authenticate('local')(req,res,function(){
					res.status(200).json({status:"Registration Successful!"});
				});
			});
		
		}

	} );

});

//login user
userRouter.post('/login',function(req,res,next){

	passport.authenticate('local',function(err,user,info){
		if(err){
			res.status(401).json({err:info});
		}else{

			if(user){
				//console.log(user);
				var token = verify.getToken(user);
				//var token = verify.getToken({"id":user._id,"admin":user.admin});
				userModel.findByIdAndUpdate(user._id,{$set:{localToken:token}},{new:true}, function(err,user){
					if(err) return next(err);
					
					res.status(200).json({
						"status":"Login successfull",
						"success":true,
						"token":token
					});
				});
			
			
				// disable this code as does not work for API. I is intended for express session
		/*		req.login(user,function(err){					
					if(err){
						res.status(500).json({err:"Cannot login user",message:err});
					}else{
					}
				});
*/
			}else{
				res.status(401).json({err:info});
			}

		}

	})(req,res,next);
});

//log out the user
userRouter.get('/logout',function(req,res,next){

	req.logout();
	res.status(200).json({status:"Logged out !"});
});


// loggin using facebook .. redirect to FB
userRouter.get('/facebook/login',passport.authenticate('facebook'), function(req,res,next){
	
});
	

// logging using facebook call back

userRouter.get('/facebook/login/callback',function(req,res,next){
	

	passport.authenticate('facebook',function(err,user,info){
		
		
		if(err) return next(err);
	
		if(user){
		
			var token = verify.getToken(user);
			//var token = verify.getToken({"id":user._id,"admin":user.admin});
			res.status(200).json({
				"status":"Login successfull",
				"success":true,
				"token":token
			});
		
		}else{
			
			res.status(500).json({err:"could not login using Facebook"});
		}
		
		
	})(req,res,next);
});


module.exports = userRouter;