const express = require('express'),
mongoose = require('mongoose'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
passport = require('passport');


var config = require('./config'),
promoRouter = require('./routes/promoRouter'),
userRouter = require('./routes/user'),
dishRouter = require('./routes/dishRouter'),
favoriteRouter = require('./routes/favoriteRouter');

var authenticate = require('./util/authenticate');

var User = require('./models/user');

//create express app from express 
var app = express();

//set host name and port variables
app.set('hostname',process.env.hostname || 'localhost');
app.set('port',process.env.port||3001);

//set the application environment 
app.set('env',process.env.environemt || 'development');


//use morgan middleware for logging
app.use(morgan('dev'));

//add body parser middleware 
app.use(bodyParser.json());

//connect to Mongo database
mongoose.connect(config.url);

var database = mongoose.connection;
//if connection failed log the error and exit
database.on('error',console.error.bind(console,'failed to connect to mongo database'));

//if connection is success then proceed with further steps
database.once('open',function(){

	// passport configurations	
	app.use(passport.initialize());

	// add the routes 
	app.use('/promotions',promoRouter);
	app.use('/users',userRouter);
	app.use('/dishes',dishRouter);

	app.use('/favorites',favoriteRouter);

	// catch 404 and forward to error handler middleware
	app.use(function(req,res,next){
		var err = new Error('requested API end point not found');
		err.status = 404;
		next(err);
	});

	// error handling middleware
	app.use(function(err,req,res,nex){
		if(app.get('env') === 'development'){
			res.status(err.status||500).json({message:err.message,error:err});
		}else{
			res.status(err.status||500).json({message:err.message});
		}
	});	


	// set the app to listen to a port

	app.listen(app.get('port'),app.get('hostname'),function(){

		console.log(`API server is running at http://${app.get('hostname')}:${app.get('port')}`);

	});
});





