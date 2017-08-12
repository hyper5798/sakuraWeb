var request = require('request');
var settings = require('../settings');
var JsonFileTools =  require('./jsonFileTools.js');
var sessionPath = './public/data/session.json';
var crypto = require('crypto');
var moment = require('moment');
var settings =  require('../settings.js');
var isS5 = true;
var server = isS5 ? settings.s5_server : settings.service_server;
var tmp = [{
            "length":6,
            "TYPE_ID":"10",
            "SERVICE_ID":"10",
            "DATA_0":"0",
            "DATA_1":"0",
            "time":"1502150400"
            }];
var servicePath = './public/data/service.json';
var serviceMap = JsonFileTools.getJsonFromFile(servicePath);

function getToken(callback) {
    var name = settings.name;
    var pass = settings.pw;
    //var url = server + settings.login+'?device_id=863664029282422\&app_identifier=com.blackloud.ice';
    var url = server + settings.login+'?device_id=886912345678\&app_identifier=com.sakura';
    var options = {
        'url': url,
        'auth': {
            'user': name,
            'pass': pass,
            'sendImmediately': false
        }
    };

    request.get(options, function(error, response, body){
        if (!error && response.statusCode == 200){
            //console.log('body : ' + body+ ', type : '+typeof(body));
            var json = JSON.parse(body);
            var session = json.global_session;
            return callback(error, session);
        }
        else{
            console.log('Code : ' + response.statusCode)
            console.log('error : ' + error)
            console.log('body : ' + body)
            return callback(error, null);
        }
    });
}

function getDeviceList(callback) {
    var session = JsonFileTools.getJsonFromFile(sessionPath);
    var token = session.token;
    var url = server + settings.get_device_list,
        time = new Date().getTime().toString();

    var api_token = get_ApiToken(time);
    var form = { token:token,api_key:settings.api_key,
                       api_token:api_token, time:time, profile:false};

    request.post(url,{form:form},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                //console.log('flag : '+flag);
                //console.log('body type : '+typeof(result.body));
                var json= JSON.parse(result.body);
                if(json.device_list == undefined) {
                    callback(null, false)
                }
                else {
                    callback(null,json)
                }
            }
    });
}

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

function query(mac, startDate, endDate , index, limit, flag, callback) {
    var url = server + settings.query,
        time = new Date().getTime().toString();

    var api_token = get_ApiToken(time);
    var form = { index:index, limit:limit,api_key:settings.api_key,
                       api_token:api_token, time:time};

    if(mac && mac.length>8){
        form.mac = mac;
    }

    if(endDate || endDate.length<8){
        var now = new Date();
        endDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    }
    var toMoment = moment(endDate,"YYYY-MM-DD").add(1,'days');
    var to = moment(toMoment,"YYYY-MM-DD").toDate().getTime();
    form.to = to;
    //console.log('to : '+timeConverter(to));

    if(startDate || startDate.length<8){
        startDate =  moment(endDate,"YYYY-MM-DD").subtract(7,'days');
        //startDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    }
    var from = moment(startDate,"YYYY-MM-DD").toDate().getTime();
    form.from = from;
    //console.log('from : '+timeConverter(from));

    request.post(url,{form:form},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                //console.log('flag : '+flag);
                //console.log('body type : '+typeof(result.body));
                var body= JSON.parse(result.body);
                //console.log(JSON.stringify(body));
                var json = body.hits;
                //console.log('total : '+JSON.stringify(body));
                var total = json.total;
                console.log('total : '+total);
                var arrList = json.hits;
                //console.log('arrList : '+arrList.length);
                console.log('list 0 \n '+JSON.stringify(arrList[0]));
                console.log('list '+(arrList.length-1)+' \n '+JSON.stringify(arrList[(arrList.length-1)]));
                if(arrList.length>0){
                    var arr = getDataList(arrList);
                }else{
                    var arr = [];
                }
                    
                var json = {"data" : arr};

                if(flag === "true"){
                    json.total = total;
                }

                if(arrList == undefined) {
                    callback(null, false)
                }
                else {
                    callback(null,json)
                }
            }
    });
}

exports.store = store;
exports.query = query;
exports.getToken = getToken;
exports.getDeviceList = getDeviceList;


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

function dateConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp*1000);
  //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = a.getMonth()+1;
  var date = a.getDate();
  var date = year +'/'+month+'/'+date ;
  return date;
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp*1000);
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = hour + ':' + min + ':' + sec ;
  return time;
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function getDataList(list){
    var arr = [];
    for(var i = 0;i<list.length;i++){
        arr.push(getData(list[i]));
    }
    return arr;
}

function getData(json){
    var arr = [];
    var arrData = json._source.data;
    if( getType(arrData) !== 'array' ){
        arrData = tmp;
    }
    var data = arrData[0];
    var account = json._source.account;
    var reportTime = moment(json._source.report_timestamp, 'YYYY-MM-DD hh:mm:ss');
    var myDate = reportTime.format('YYYY-MM-DD');
    var myTime = reportTime.format('hh:mm:ss');
    //arr.push(timeConverter(data.time));

    arr.push(account.mac);
    arr.push(account.gid);
    //console.log(typeof(reportTime));
    //arr.push(dateConverter(data.time));
    //arr.push(timeConverter(data.time));
    arr.push(myDate);
    arr.push(myTime);
    arr.push(data.SERVICE_ID);
    arr.push(serviceMap[data.SERVICE_ID]);
    arr.push(data.length);
    arr.push(data.DATA_0);
    arr.push(data.DATA_1);
    return arr;
}