var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var cloud =  require('../models/cloud.js');
var settings = require('../settings');
var JsonFileTools =  require('../models/jsonFileTools.js');
var sessionPath = './public/data/session.json';
var userPath =  './public/data/user.json';
var moment = require('moment');

function findUnitsAndShowSetting(req,res,isUpdate){
	UnitDbTools.findAllUnits(function(err,units){
		var successMessae,errorMessae;
		var macTypeMap = {};

		if(err){
			errorMessae = err;
		}else{
			if(+units.length>0){
				successMessae = '查詢到'+units.length+'筆資料';
			}
		}
		req.session.units = units;

		console.log( "successMessae:"+successMessae );
		res.render('setting', { title: 'Setting',
			units:req.session.units,
			user:req.session.user,
			success: successMessae,
			error: errorMessae
		});
	});
}

module.exports = function(app) {
  app.get('/', checkLogin);
  app.get('/', function (req, res) {
		res.render('index', { title: 'Index',
			user:req.session.user
		});
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
	req.session.user = null;
  	var name = req.flash('post_name').toString();
	var successMessae,errorMessae;
	console.log('Debug register get -> name:'+ name);

	if(name ==''){
		errorMessae = '';
		res.render('user/login', { title: 'Login',
			error: errorMessae
		});
	}else{
		var password = req.flash('post_password').toString();
		var md5 = crypto.createHash('md5');
        password = md5.update(password).digest('hex');

		console.log('Debug register get -> password:'+ password);

		try {
			var userObj = JsonFileTools.getJsonFromFile(userPath);
		}
		catch (event) {
			userObj = {};
		}
		//if(user == null ){
		if(userObj[name] === undefined){
			//login fail
			errorMessae = 'The account is invalid';
			res.render('user/login', { title: 'Login',
				error: errorMessae
			});
		}else{
			//login success
			//if(password == user.password){
			if(password == userObj[name]['password']){
				req.session.user = userObj[name];
				try {
					var sessionObj = JsonFileTools.getJsonFromFile(sessionPath);
				}
				catch (event) {
					sessionObj = {};
				}
				if(sessionObj.expiration){
					var expiration = new Date(sessionObj.expiration);
					var now = new Date();
					if(now.getTime() > expiration.getTime()){
						cloud.getToken(
							function(err,session){
								if(err){
									JsonFileTools.saveJsonToFile(sessionPath,{});
								}else{
									JsonFileTools.saveJsonToFile(sessionPath,session);
								}
							}
						);
					}
				}

				return res.redirect('/');
			}else{
				//login fail
				errorMessae = 'The password is invalid';
				res.render('user/login', { title: 'Login',
					error: errorMessae
				});
			}
		}
	}
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
  	var post_name = req.body.account;
  	var	post_password = req.body.password;
  	console.log('Debug login post -> name:'+post_name);
	console.log('Debug login post -> password:'+post_password);
	req.flash('post_name', post_name);
	req.flash('post_password', post_password);
	return res.redirect('/login');
  });

  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '');
    res.redirect('/login');
  });
  app.get('/account', checkLogin);
    app.get('/account', function (req, res) {

		console.log('render to account.ejs');
		var refresh = req.flash('refresh').toString();
		var myuser = req.session.user;
		var successMessae,errorMessae;
		var post_name = req.flash('name').toString();

		console.log('Debug account get -> refresh :'+refresh);

		try {
			var userObj = JsonFileTools.getJsonFromFile(userPath);
		}
		catch (event) {
			userObj = {};
		}
		if(refresh == 'delete'){
			successMessae = 'Delete account ['+post_name+'] is finished!';
		}else if(refresh == 'edit'){
			successMessae = 'Edit account ['+post_name+'] is finished!';
		}
		var newUsers = [];
		var keys = Object.keys(userObj);
		for(var i=0;i<  keys.length;i++){
			//console.log('name : '+users[i]['name']);
			if( keys[i] !== 'admin'){
				newUsers.push(userObj[keys[i]]);
			}
		}
		console.log('Debug account get -> users:'+newUsers.length+'\n'+newUsers);

		//console.log('Debug account get -> user:'+mUser.name);
		res.render('user/account', { title: 'Account', // user/account
			user:myuser,//current user : administrator
			users:newUsers,//All users
			error: errorMessae,
			success: successMessae
		});
    });

  	app.post('/account', checkLogin);
  	app.post('/account', function (req, res) {
  		var	post_name = req.body.postName;
		var postSelect = req.body.postSelect;
		console.log('post_name:'+post_name);
		console.log('postSelect:'+postSelect);
		var successMessae,errorMessae;
		req.flash('name',post_name);//For refresh users data
		try {
			var userObj = JsonFileTools.getJsonFromFile(userPath);
		}
		catch (event) {
			userObj = {};
		}

		if(postSelect == ""){//Delete mode

			delete userObj[post_name];

		}else if(postSelect == "new"){//New account

			var md5 = crypto.createHash('md5');
            var	password = md5.update(req.body.password).digest('hex');
            userObj[post_name] = {"name":post_name,"password":password,"level":1,"enable":true,"date":moment().format("YYYY/MM/DD hh:mm:ss")};
		
	    }else{//Edit modej

			console.log('postSelect :'+typeof(postSelect) );
			userObj[post_name]['enable'] = (postSelect==="false")?false:true ;
		}
		JsonFileTools.saveJsonToFile(userPath,userObj);
		setTimeout(function() {
			return res.redirect('/account');
		}, 500);

  	});
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'No Register!');
    res.redirect('/login');
  }else
  {
	  next();
  }
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Have login!');
    res.redirect('back');//返回之前的页面
  }else
  {
	  next();
  }
}