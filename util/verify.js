
const jwt = require('jsonwebtoken'),
config = require('../config');

var UserModel = require('../models/user');


//This function will generate and return jwt web token. The token will be valid for 1 hour
exports.getToken = function(user){

	return jwt.sign(user, config.secret, {expiresIn:3600});

}

//this function will act as express middle ware to check if jwt token is provided or not. It will decode the token
//and append in request object as decoded
exports.verifyOrdinaryUser = function(req,res,next){

	// check for jwt token in header, query string or in body
	var token = req.body.token||req.query.token||req.headers['x-access-token'];

	if(token){

		jwt.verify(token, config.secret,  function(err,decoded){

			if(err){
				var err = new Error('You are not authenticated');
				err.status = 401;
				next(err);
			}else{
				UserModel.findById(decoded._doc._id, function(err,user){
					if(err) return next(err);

					if(user){
						if(user.localToken === token ){
							req.decoded = decoded;
							//console.log(decoded);
							next();
						}else{
							var err = new Error('This token has expired');
							err.status = 403;
							next(err);
						}
					}else{
						var err = new Error('Not a valid token');
						err.status = 404;
						next(err);
					}

				});

			}

		});


	}else{
		var err = new Error('No token provided');
		err.status = 403;
		next(err);
	}


}

//this function will act as express middle ware to check if the user admin flag is set to true or not.
//This method should be used after verifyOrdinaryUser function
exports.verifyAdmin = function(req,res,next){

	if(req.decoded._doc.admin){

		next()
	}else{
		err = new Error("You are not authorized to perform this operation!");
		err.status = 403;
		next(err);
	}

}