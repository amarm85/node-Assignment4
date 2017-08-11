// require mongoose module
const mongoose = require('mongoose');

// load mogoose currency time in mongoose schema 
require('mongoose-currency').loadType(mongoose);

// get currency variable from mogoose type
var currency = mongoose.Types.Currency;

//create comment object schema which will be embedded in dishes schema.

var commentSchema = new mongoose.Schema({
	
	rating:{
		type:Number,
		required:true,
		min:1,
		max:5
	},
	comment:{
		type:String,
		required:true
	},
	postedBy:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'users'
	}
		
},{timestamps:true});


// create dishes schema
var dishSchema = new mongoose.Schema({
	
	name:{
		type:String,
		required:true,
		unique:true
	},
	image:{
		type:String,
		required:true
	},
	category:{
		type:String,
		required:true
	},
	label:{
		type:String,
		default:" "
	},
	price:{
		type:currency,
		required:true
	},
	description:{
		type:String,
		require:true
	},
	comments:[commentSchema]
	
},{timestamps:true});

//  create model out of schema and export 
module.exports = mongoose.model('Dishes',dishSchema);
