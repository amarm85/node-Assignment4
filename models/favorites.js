//get the required modules
const mongoose = require('mongoose');

var favoriteSchema = new mongoose.Schema({

	postedBy:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'users',
		unique:true,
		required:true
	},
	dishes:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:'Dishes'
		}
		]

},{	timestamps:true});



//create model out of schema 
var favorites = mongoose.model('favorites',favoriteSchema);

//export the model.
module.exports= favorites;