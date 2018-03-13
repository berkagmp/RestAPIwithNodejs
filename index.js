var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var config = require('./config.json')

var app = express();

console.log(config.mongodb_atlas);
// DB setting
mongoose.connect(config.mongodb_atlas, { useMongoClient: true });

var db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// DB schema
var flightSchema = mongoose.Schema({
	id:{type:String, required:true, unique:true},
	price:{type:String},
	company:{type:String},
	flight_type:{type:String},
	name:{type:String},
	seat_type:{type:String},
	status:{type:Boolean},
	origin_airport:{type:String},
	dest_airport:{type:String},
	departure_time:{type:String}, //yyyymmddhhMMdd
	arrival_time:{type:String}, //yyyymmddhhMMdd
	logo:{type:String}
});
var Flight = mongoose.model("flight", flightSchema);

// Routes
// Home
app.get("/", function(req, res){
  res.redirect("/flight/list");
});
app.get("/flight", function(req, res){
  res.redirect("/flight/list");
});
// flights - Index
app.get("/flight/list", function(req, res){
  Flight.find({}, function(err, flight){
    if(err) return res.json(err);
		res.send(flight);
  });
});
app.get("/flight/search", function(req, res){
	var p_origin_airport = req.query.origin;
	var p_dest_airport = req.query.destin;
	var p_departure_time = req.query.date;

	const query = new RegExp(p_departure_time + ".*");

	console.log(p_origin_airport);
	console.log(p_dest_airport);
	console.log(p_departure_time);

	Flight.find({"origin_airport":p_origin_airport, "dest_airport":p_dest_airport, "departure_time":query}, function(err, flight){
		if(err) return res.json(err);
		res.send(flight);
	}).sort({"id": -1});
	
});

app.get("/flight/book", function(req, res){
	var bookid = req.query.bookid;
	var p_id = req.query.id;

  Flight.create(req.body, function(err, contact){
    if(err) return res.json(err);
    res.redirect("/flight");
  });
});

app.get("/flight/:id", function(req, res){
	Flight.find({id:req.params.id}, function(err, flight){
		if(err) return res.json(err);
		res.send(flight);
	})
});

app.put("/flight/:id", function(req, res){
	console.log("put");
	console.log(req.params.id);
	console.log(req.body);
	console.log(req.body["price"]);
	console.log(req.body["company"]);

  Flight.findOneAndUpdate(
		{id:req.params.id}, // find
		req.body, // update
		{upsert: true, 'new': true},
		function(err, flight){
    if(err) return res.json(err);
    res.send(flight);
  });
});

// Port setting
app.listen(3000, function(){
  console.log("server on!");
});
