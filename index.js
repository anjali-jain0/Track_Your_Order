var express=require('express');

var request = require('request');

var Nexmo=require('nexmo');

const nexmo = new Nexmo({
  apiKey: '0aabd16f',
  apiSecret: 'sxBlxAb8zkpkxPSU'
},{debug:true});

var nodemailer = require('nodemailer');

var app=express();

var bodyParser=require('body-parser');

var urlencodedParser=bodyParser.urlencoded({extended: false});

app.set("view engine",'ejs');

app.use(express.static('./public'));

var mongoose=require('mongoose');

mongoose.connect('mongodb://track_it_down:tracking1@ds347665.mlab.com:47665/track_it_down');

var BookedSchema= new mongoose.Schema({
	itemid:Number,
	country:String,
	state:String,
	city:String,
	address:String,
	service:String,
	name:String,
	email:String,
	number:String,
	trackingpwd:Number,
	date:String,
	status:String
});

var ItemSchema= new mongoose.Schema({
	itemid:Number,
	country:String,
	state:String,
	city:String,
	price:String,
	type:String
});

var AdminUpdateSchema= new mongoose.Schema({
	trackingpwd:Number,
	itemid:String,
	currentloc:String,
	dist:String,
	days:String,
	sdate:String,
	dcharges:String,
	status:String,
	fromcountry:String,
	fromstate:String,
	fromcity:String,
	date:String
});

var WorkforceSchema= new mongoose.Schema({
	country:String,
	state:String,
	city:String,
	name:String,
	number:String,
	email:String,
	area:String,
	exp:String,
	avail:Boolean
});

var DeliveryChargesSchema = new mongoose.Schema({
	distance:Object,
	price:Number,
 	noofdays:String
});

var Booked= mongoose.model('Booked',BookedSchema); 
var Item= mongoose.model('Item',ItemSchema); 
var Workforce= mongoose.model('Workforce',WorkforceSchema);
var AdminUpdate = mongoose.model('AdminUpdate',AdminUpdateSchema);
var DeliveryCharges = mongoose.model('DeliveryCharges',DeliveryChargesSchema);

var dc1 = DeliveryCharges({distance:{start:0,end:200},price:10,noofdays:'7-10 days'});
var dc1 = DeliveryCharges({distance:{start:201,end:400},price:80,noofdays:'10-13 days'});

var item1=Item({itemid:1,country:'India',state:'Rajasthan',city:'Udaipur',price:'1000 rupees',type:'Clothing'})
	.save(function(err){
	if(err) throw err;
});
var item2=Item({itemid:2,country:'India',state:'Madhya Pradesh',city:'Gwalior',price:'2000 rupees',type:'Electrical'})
	.save(function(err){
	if(err) throw err;
});

var workman1=Workforce({country:'India',state:'Rajasthan',city:'Udaipur',name:'Raihal Mehta',number:'1234',
	email:'raihal23@gmail.com',area:'Vigyan Nagar office1',exp:'2 years',avail:true}).save(function(err){
		if(err) throw err;
});
var workman2=Workforce({country:'India',state:'Madhya Pradesh',city:'Gwalior',name:'Shibhor Sharma',number:'5678',
	email:'shibhorraj1@gmail.com',area:'Morena Link office4',exp:'3 years',avail:true}).save(function(err){
		if(err) throw err;
});

app.get('/book',function(req,res){
	res.render('bookingform');
});

app.post('/booked',urlencodedParser,function(req,res){
    
    var pwd=Math.floor(Math.random()*249) + 5637;
	var booked1=Booked({status:'Pending',itemid:Number(req.body.item),trackingpwd:pwd,date:new Date(),
		name:req.body.name,email:req.body.email,number:req.body.number,country:req.body.country,
		city:req.body.city,state:req.body.state,address:req.body.address,service:req.body.service})
	    .save(function(err){
			if(err) throw err;
		});

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		    auth: {
		        user: "jainanjali043@gmail.com",
		        pass: "anjali043"
		    }
        });

	var mailOptions = {
	  from: 'jainanjali043@gmail.com',
	  to: req.body.email,
	  subject: 'Customer Booking Details',
	  text: 'Congratulations.. Your parcel has been booked.Your tracking password is ' + pwd
	};

	transporter.sendMail(mailOptions, function(error, response){
	  if (error) {
	    console.log(error);
	  } 
	});
	res.redirect('/book');

});

app.get('/track',function(req,res){
 	
	res.render('track1');
});

app.post('/trackafterpwd',urlencodedParser,function(req,res){

	var query={trackingpwd:Number(req.body.trackno)};
	AdminUpdate.find(query,function(err,data){
		if(err) throw err;
		res.render('track2',{data:data});
	});
});

app.get('/price',function(req,res){

	res.render('pricing');
});

// app.post('/pricing',urlencodedParser,function(req,res){
    
//     if(req.body.service=='Normal')
//     	var charges=100*20;
//     else
//     	var charges=100*40;
// 	    res.render('pricecalculated',{scity:req.body.scity,dcity:req.body.dcity,scountry:req.body.scountry,
// 	    	sstate:req.body.sstate,dcountry:req.body.dcountry,dstate:req.body.dstate,dist:100,
// 	    	service:req.body.service,charges:charges});
// });

app.get('/orderdetails',function(req,res){

	Booked.find({},function(err,data){
		if(err) throw err;
		res.render('orderdetails',{data:data})
	});
});

app.get('/manage/:id/:oid',function(req,res){

    //what if multiple items??

    var query={itemid:req.params.id};
    var query2={_id:req.params.oid}
    Item.find(query,function(err,data){
    	if(err) throw err;
    	app.locals.item=data;
    });
    Booked.find(query2,function(err,data){
		if(err) throw err;
		app.locals.data=data;
		res.render('adminmanage',{distance:0,price:0,days:'0'});
	});
});

app.get('/getdistance/:place1/:place2' , function(req,res){

	console.log('came here');

	request('http://www.distance24.org/route.json?stops=' + req.params.place1 + '|' + req.params.place2 ,function(err,result){
		if(err) throw err;
		console.log('kya hua')
		var dis = result.distance;
		console.log(result);
		console.log(dis);
		DeliveryCharges.find({},function(err,data){
			if(err) throw err;
			for(var i=0;i<data.length;i++){
				var start=data[i].distance.start;
				var end=data[i].distance.end;
				if(dis>=start && dis<=end){
					res.render('adminmanage',{distance:result.distance,price:data[i].price,days:data[i].noofdays});
					break;
				}
			}
		});
	})
});

app.get('/remove/:id',function(req,res){
    
    var query={_id:req.params.id};
	Booked.remove(query,function(err){
		if(err) throw err;
	});
	res.redirect('/orderdetails');
});

app.post('/update/:id',urlencodedParser,function(req,res){
    
    var startplace=req.body.from;
    var array = startplace.split(',');
    var query={trackingpwd:Number(req.body.trackno)};

    AdminUpdate.update(query,{date:new Date(),trackingwd:req.body.trackno,itemid:req.body.itemid,
    			        currentloc:req.body.currentloc,dist:req.body.dist,days:req.body.days,dcharges:req.body.dcharges,
    			        status:req.body.status,sdate:req.body.sdate,fromstate:array[1],fromcountry:array[2],fromcity:array[0]},
    			        function(err){
						if(err) throw err;
		});

	res.redirect('/orderdetails');
});

app.get('/searchaddress/:country/:state/:address',function(req,res){

	res.render('searchmap');
});

app.get('/search',function(req,res){

	res.render('searchmap');
});

app.get('/workforce',function(req,res){

	Workforce.find({},function(err,data){
		if(err) throw err;
		res.render('workforce',{data:data});
	});
});

app.get('/filterworkforce',function(req,res){

	res.render('filterworkforce');
});

app.post('/filter',urlencodedParser,function(req,res){

	var query={country:req.body.country,state:req.body.state,city:req.body.city,area:req.body.area};
	Workforce.find(query,function(err,data){
		if(err) throw err;
		res.render('workforce',{data:data});
	});
});

app.get('/bookworkforce/:number',function(req,res){
		var number=req.params.number;
		var msg = "Delivery to be made at given address";
		nexmo.message.sendSms('Nexmo' , number , msg);
});

app.get('/bookworkforce/:number',function(req,res){
		var number=req.params.number;
		var msg = "Delivery to be made at given address";
		nexmo.message.sendSms('Nexmo' , number , msg);
});

app.get('/bookworkforce/:email',function(req,res){

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		    auth: {
		        user: "jainanjali043@gmail.com",
		        pass: "anjali043"
		    }
        });

	var mailOptions = {
	  from: 'jainanjali043@gmail.com',
	  to: req.params.email,
	  subject: 'Work Mail',
	  text: 'Delivery to be made at given address'
	};

	transporter.sendMail(mailOptions, function(error, response){
	  if (error) {
	    console.log(error);
	  } 
	});
});

app.get('/clientmail/:name/:number',function(req,res){

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		    auth: {
		        user: "jainanjali043@gmail.com",
		        pass: "anjali043"
		    }
        });

	var mailOptions = {
	  from: 'jainanjali043@gmail.com',
	  //to: email of client,
	  subject: 'Ordered Item details',
	  text: 'Congratulations! Your order has reached your area..It will be with you soon..'
	};

	transporter.sendMail(mailOptions, function(error, response){
	  if (error) {
	    console.log(error);
	  } 
	});
});

app.listen('8080');

//filter me uppercase lowercase input see
//forms ka front end
//maps, price and distance
//give address to workforce