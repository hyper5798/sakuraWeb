var express = require('express');
var router = express.Router();
var JsonFileTools =  require('../models/jsonFileTools.js');
var moment = require('moment');
var cloud = require('../models/cloud.js');

router.route('/query')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var mac     = req.query.mac;
		var endDate  = req.query.to;
		var startDate= req.query.from;
		var index    = req.query.index;
		var limit    = req.query.limit;
		var total    = req.query.total;
		cloud.query(mac, startDate, endDate, index, limit, total,function(err,results){
              if (err)
				return res.send(err);
			  return res.json(results);
		});
	});

router.route('/device_list')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		cloud.getDeviceList(function(err,results){
              if (err)
				return res.send(err);
			  return res.json(results);
		});
	});

module.exports = router;

