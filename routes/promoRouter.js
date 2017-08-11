const promoRouter = require('express').Router(),
PromotionModel = require('../models/promotion'),
mongoose = require('mongoose');

var verify = require('../util/verify');

//get all the promotions
promoRouter.get('/',verify.verifyOrdinaryUser,function(req,res,next){
	PromotionModel.find({},function(err,promotions){
		if(err){
			next(err);
		}else{
			if(promotions){
				res.status(200).json(promotions);
			}else{
				res.status(404).json({"message":"No promotions found"});
			}
		}
	});
});

//add a promotion to DB
promoRouter.post('/',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){

	newPromotion = new PromotionModel(req.body);
	newPromotion.save(function(err){
		if(err){
			if(err.code == "11000"){

				var error = new Error();
				error.status = 400;
				error.error = "promotion already exists with this name";
				return next(error);
			}
			next(err);
		}else{
			res.status(201).json(newPromotion);
		}
	});

});

//delete all promotions from DB
promoRouter.delete('/',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){

	PromotionModel.remove({},function(err){
		if(err){
			next(err);
		}else{
			res.status(200).json({message:"all promotions have been deleted"});
		}

	});

});

//get a promotion by ID
promoRouter.get('/:id',verify.verifyOrdinaryUser,function(req,res,next){

	PromotionModel.findById(mongoose.Types.ObjectId(req.params.id), function(err,promotion){

		if(err){
			next(err);
		}else{
			if(promotion){
				res.status(200).json(promotion);
			}else{
				res.status(404).json({"message":"No promotion found with id " + req.params.id} );
			}
		}
	});

});

//update promotion by ID
promoRouter.put('/:id',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){
	PromotionModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), 
			{$set:req.body},{new:true},function(err,promotion){
				
				if(err){
					next(err);
				}else{
					if(promotion){
						res.status(200).json(promotion);
					}else{
						res.status(404).json({message:"No promotion found with id " +  req.params.id});
					}
				}
			});
	
});

// Delete promotion with ID
promoRouter.delete('/:id',verify.verifyOrdinaryUser,verify.verifyAdmin,function(req,res,next){
	PromotionModel.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id),function(err,promotion){
		
		if(err){
			next(err)
		}else{
			if(promotion){
				res.status(200).json(promotion);
			}else{
				res.status(404).json({message:"No promotion found with id " +  req.params.id});
			}
		}
		
	});
	
});



module.exports = promoRouter;
