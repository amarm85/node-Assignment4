// require the mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

// create a promotions schema
var promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
	image:{
		type: String,
        required: true
	},
	label:{
		type: String,
		default:" " 
	},
	price:{
		type:Currency,
		required: true
	},
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create a model using promotions schema
var Promotions = mongoose.model('Promotion', promotionSchema);

// make this available to our Node applications
module.exports = Promotions;