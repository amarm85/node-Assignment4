//require needed modules
const favoriteRouter = require('express').Router(),
mongoose = require('mongoose'),
favoriteModel = require('../models/favorites');

//get auth modules
var verify = require('../util/verify');

//verify if the user is logged on or not for all routers
favoriteRouter.use(verify.verifyOrdinaryUser);

//get the favorite dishes of the user.
favoriteRouter.get('/',function(req,res,next){

	var userId = req.decoded._doc._id;

	// if user id is not in decoded object that means user is not authenticated 
	if(!userId) return next('User is not authenticated');

	favoriteModel.findOne({postedBy:mongoose.Types.ObjectId(userId)})
	.populate('postedBy dishes')
	.exec(function(err,favorite){

		if(err) return next(err);

		if(favorite){

			res.status(200).json(favorite);

		}else{
			var error = new Error('no favorite found for user id '+ userId );
			error.status = 404;
			next(error);
		}
	});

});

//add dish to favorite 
favoriteRouter.post('/',function(req,res,next){

	var userId = req.decoded._doc._id;

	// if user id is not in decoded object that means user is not authenticated 
	if(!userId) return next('User is not authenticated');

	//check if there is a entry of favorite for this user 
	favoriteModel.findOne({postedBy:mongoose.Types.ObjectId(userId)},function(err,favorite){

		if(err) return next(err);

		if(favorite){

			// check if the dish is already in the user's list of favorites 
			if( favorite.dishes.indexOf(req.body._id) == -1){

				favorite.dishes.push(req.body);
				favorite.save(function(err,newfavorite){
					if(err) return next(err);

					res.status(200).json(newfavorite);
				});


			}else{

				var error = new Error('This dish is aleady in favorite list of user id '+ userId );
				error.status = 404;
				next(error);

			}


		}else{
			// create a new favorite of the user
			var newfavorite = new favoriteModel({
				postedBy:mongoose.Types.ObjectId(userId),
			});

			newfavorite.save(function(err,newfav){
				if(err) return next(err);

				newfav.dishes.push(req.body);
				newfav.save(function(err,newfavorite){
					if(err) return next(err);

					res.status(200).json(newfavorite);
				});
			});
		}

	});

});


//the all the favorite of the user
favoriteRouter.delete('/',function(req,res,next){


	var userId = req.decoded._doc._id;

	// if user id is not in decoded object that means user is not authenticated 
	if(!userId) return next('User is not authenticated');

	//find the user id in favorite model and empty the dishes array
	favoriteModel.findOneAndUpdate({postedBy:mongoose.Types.ObjectId(userId)},
			{$set:{dishes:[]}},{new:true},
			function(err,favorite){

				if(err) return next(err);

				res.status(200).json(favorite);


			});

});


// delete a specific dish from user's favorite list
favoriteRouter.delete('/:dishObjectId',function(req,res,next){
	

	var userId = req.decoded._doc._id;

	// if user id is not in decoded object that means user is not authenticated 
	if(!userId) return next('User is not authenticated');
	
	
	//check if there is an entry of favorite for this user 
	favoriteModel.findOne({postedBy:mongoose.Types.ObjectId(userId)},function(err,favorite){

		if(err) return next(err);

		if(favorite){

			// check if the dish is in the user's list of favorites 
			if( favorite.dishes.indexOf(req.params.dishObjectId) == -1){
				
				var error = new Error('This dish is aleady deleted from favorite list of user id '+ userId );
				error.status = 404;
				next(error);

			}else{
				//find the dish id in favorite list of dishes array by index and remove it 
				favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishObjectId) ,1);
				favorite.save(function(err,newfavorite){
					if(err) return next(err);

					res.status(200).json(newfavorite);
				});

			}


		}else{
			var error = new Error('The favorite list of user id '+ userId + ' does not exist' );
			error.status = 404;
			next(error);
		}

	});
	
	
});


module.exports = favoriteRouter;
