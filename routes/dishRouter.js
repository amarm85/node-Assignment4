const Dishes = require('express').Router(),
mongoose = require('mongoose'),
DishModel = require('../models/dishes');

var verify = require('../util/verify');

// verify if user is logged on or not
Dishes.use(verify.verifyOrdinaryUser);

//get all dishes
Dishes.get('/',function(req,res,next){

	DishModel.find({})
	.populate('comments.postedBy')
	.exec(function(err,dishes){
		// if error than handle it
		if(err) return next(err);


		// if dishes are not found the return not found 
		if(dishes){
			res.status(200).json(dishes);

		}else{
			res.status(404).json({"message":"No dish found"});
		}
	});

});

Dishes.get('/:id',function(req,res,next){


	DishModel.findById(mongoose.Types.ObjectId(req.params.id))
			.populate('comments.postedBy')
			.exec(function(err,dish){

		if(err) return next(err);

		// if dishes are not found the return not found 
		if(dish){
			res.status(200).json(dish);

		}else{
			res.status(404).json({"message":"No dish found with id " + req.params.id});
		}


	});
});

Dishes.post('/',verify.verifyAdmin,function(req,res,next){
	newDish = new DishModel(req.body);

	newDish.save(function(err){
		if(err){
			if(err.code == "11000"){

				var error = new Error();
				error.status = 400;
				error.error = "Dish already exists with this name";
				return next(error);
			}
			return next(error);
		}

		res.status(201).json(newDish);
	});
});

Dishes.put('/:id',verify.verifyAdmin,function(req,res,next){

	DishModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),
			{$set:req.body},{new:true}, function(err,dish) {

				if(err){
					err.status = 400;
					return next(err);
				}else{

					// if dishes are not found the return not found 
					if(dish){
						res.status(200).json(dish);

					}else{
						res.status(404).json({"message":"No dish found with id " + req.params.id});
					}

				}
			});

});

Dishes.delete('/:id',verify.verifyAdmin,function(req,res,next){

	DishModel.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), function(err,dish) {
		if(err){
			err.status = 400;
			return next(err);
		}else{	
			// if dishes are not found the return not found 
			if(dish){
				res.status(202).json({"message":"Dish has been deleted"});

			}else{
				res.status(404).json({"message":"No dish found with id " + req.params.id});
			}


		}
	});

});


Dishes.get('/:id/comments',function(req,res,next){
	DishModel.findById(mongoose.Types.ObjectId(req.params.id))
			.populate('comments.postedBy')
			.exec(function(err,dish){
		if(err) return next(err);

		if(dish && dish.comments ){
			res.status(200).json(dish.comments );

		}else{
			res.status(404).json({"message":"No comment found for Dish " + req.params.id});
		}
	});
});



Dishes.get('/:id/comments/:commentId',function(req,res,next){

	
	DishModel.findById(mongoose.Types.ObjectId(req.params.id))
	.populate('comments.postedBy')
	.exec(function(err,dish){
		if(err) return next(err);

		if(dish){
			var comment = dish.comments.id(mongoose.Types.ObjectId(req.params.commentId));
			if(comment){
			
				res.status(200).json(comment);
			}else{
				var error = new Error('No comment found with id ' + req.params.commentId +  ' in Dish id ' + req.params.id );
				error.status = 404;
				next(error);
			}
		}else{
			var error = new Error('No dish found with id ' + req.params.id  );
			error.status = 404;
			next(error);
		}
	});


});

Dishes.put('/:id/comments/:commentId',function(req,res,next){

	DishModel.findById(mongoose.Types.ObjectId(req.params.id),function(err,dish){

		if(err) return next(err);

		if(dish){
			var comment = dish.comments.id(mongoose.Types.ObjectId(req.params.commentId));
			if(comment){
				
				if(comment.postedBy != req.decoded._doc._id){
					var error = new Error("You are not authozied to delete this comment");
					error.status = 403;
					return next(error);
				}
				dish.comments.id(mongoose.Types.ObjectId(req.params.commentId)).remove();
				
				req.body.postedBy = req.decoded._doc._id;
				
				dish.comments.push(req.body);
				dish.save(function(err,dish){
					if(err) return next(err);

					res.status(200).json(dish);

				});
			}else{
				var error = new Error('No comment found with id ' + req.params.commentId +  ' in Dish id ' + req.params.id );
				error.status = 404;
				next(error);
			}

		}else{
			var error = new Error('No dish found with id ' + req.params.id  );
			error.status = 404;
			next(error);
		}
	});

});

Dishes.post('/:id/comments',function(req,res,next){

	DishModel.findById(mongoose.Types.ObjectId(req.params.id),function(err,dish){

		if(err) return next(err);

		if(dish){
			req.body.postedBy = req.decoded._doc._id;
			
			dish.comments.push(req.body);
			dish.save(function(err,dish){
				if(err) return next(err);

				res.status(200).json(dish);
			});
		}else{
			var error = new Error('No dish found with id ' + req.params.id  );
			error.status = 404;
			next(error);
		}


	});
});

Dishes.delete('/:id/comments/:commentId',function(req,res,next){

	DishModel.findById(mongoose.Types.ObjectId(req.params.id),function(err,dish){

		if(err) return next(err);

		if(dish){
			var comment = dish.comments.id(mongoose.Types.ObjectId(req.params.commentId));
			if(comment){
				if(comment.postedBy != req.decoded._doc._id){
					var error = new Error("You are not authozied to delete this comment");
					error.status = 403;
					return next(error);
				}
				
				dish.comments.id(mongoose.Types.ObjectId(req.params.commentId)).remove();
				dish.save(function(err){
					if(err) return next(err);
					
					res.status(200).json('Comment with id '+ req.params.commentId +  ' in Dish id ' + req.params.id + ' has been deleted');
				});
				
			}else{
				var error = new Error('No comment found with id ' + req.params.commentId +  ' in Dish id ' + req.params.id );
				error.status = 404;
				next(error);
			}

		}else{
			var error = new Error('No dish found with id ' + req.params.id  );
			error.status = 404;
			next(error);
		}


	});

});

Dishes.delete('/:id/comments',verify.verifyAdmin,function(req,res,next){

	DishModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),
			{$set:{comments:[]}},{new:true}, function(err,dish){
				if(err) return next(err);

				if(dish){
					res.status(200).json(dish);
				}else{
					var error = new Error('No dish found with id ' + req.params.id  );
					error.status = 404;
					next(error);
				}

			});

});


module.exports = Dishes;