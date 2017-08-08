var request = require('request')
var settings = require('../settings');
var crypto = require('crypto');
var moment = require('moment');
var settings =  require('../settings.js');

function store(title, content, city,area,town,callback) {

    var url = "https://api.dropap.com/tracker/v1/store_bulletin_board";
    var api_key = 'BLAZING-r99Xpaoqm';
    var time = new Date().getTime().toString();
    var api_token = get_ApiToken(time);
    var form = {form:{title:title, content:content,city:city,area:area,town:town,
                             api_key:api_key,api_token:api_token, time:time }};

    console.log('form : \n'+JSON.stringify(form));

    request.post(url,{form:{title:title, content:content,city:city,area:area,town:town,
                             api_key:api_key,api_token:api_token, time:time }},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                var value = JSON.parse(result.body).value
                if(value == undefined) {
                    callback(null, false)
                }
                else {
                    callback(null, value)
                }
            }
    });
}

function query(mac, startDate, endDate , index, limit, callback) {
    var url = settings.S5_query_url,
        time = new Date().getTime().toString();
    var to = moment(endDate,"YYYY-MM-DD").toDate().getTime();
    var api_token = get_ApiToken(time);
    var form = {to:to, index:index, limit:limit,api_key:settings.api_key,
                       api_token:api_token, time:time, count:true};
    
    if(mac && mac.length>8){
        form.mac = mac;
    }
    form.mac = ['001cdfee77fa'];

    if(startDate && startDate.length>8){
        var from = moment(startDate,"YYYY-MM-DD").toDate().getTime();
        form.from = from;
    }
    
    request.post(url,{form:form},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                var value = JSON.parse(result.body).value
                if(value == undefined) {
                    callback(null, false)
                }
                else {
                    callback(null, value)
                }
            }
    });
}

exports.store = store;
exports.query = query;


function get_ApiToken(time) {
    var api_secret = settings.api_secret;
    var shasum = crypto.createHash('sha1');
        // secret
        shasum.update(api_secret);
        // time
        shasum.update(time);

    var digest = shasum.digest('hex');
    return digest;
}