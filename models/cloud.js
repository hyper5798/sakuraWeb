var request = require('request');
var settings = require('../settings');
var JsonFileTools =  require('./jsonFileTools.js');
var sessionPath = './public/data/session.json';
var devicePath = './public/data/device.json';
var deviceList = [];
var crypto = require('crypto');
var moment = require('moment-timezone');
var settings =  require('../settings.js');
var isS5 = true,isS5_2 = true;
var server = isS5 ? settings.s5_server : settings.service_server;
var server2 = settings.s5_server2;
var tmp = [{
            "length":6,
            "TYPE_ID":"10",
            "SERVICE_ID":"10",
            "DATA_0":"0",
            "DATA_1":"0",
            "time":"1502150400"
            }];
var servicePath = './public/data/service.json';
var serviceMap;
try {
        serviceMap = JsonFileTools.getJsonFromFile(servicePath);
    }
    catch (err) {
        console.log('get serviceMap :'+err);
        serviceMap = {};
    }

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
            if(response){
                console.log('Code : ' + response.statusCode);
                console.log('error : ' + error);
                console.log('body : ' + body);
            }
            
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
                    callback(null, false);
                }
                else {
                    callback(null,json);
                    JsonFileTools.saveJsonToFile(devicePath,json.device_list);
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

function DateTimezone(date,offset) {
    // 建立現在時間的物件
    // 取得 UTC time
    var d = new Date(date);
    utc = d.getTime() - (d.getTimezoneOffset() * 60000);
    console.log('d.getTimezoneOffset() : '+d.getTimezoneOffset());
    // 新增不同時區的日期資料
    if(d.getTimezoneOffset() >= 0)
        return new Date(utc - (3600000*offset));
    else
        return new Date(utc + (3600000*offset));
    }

function query( mac, from, to , index, limit, flag, callback) {
      
    //var mTo = moment(to,'YYYY/MM/DD HH:mm').tz(settings.timezone);
    //var mFrom = moment(from,'YYYY/MM/DD HH:mm').tz(settings.timezone);
    //var fromTime = mFrom.unix()*1000; 
    //var toTime = mTo.unix()*1000; 
    //var range2 = mTo.format('YYYYMMDDHHmm');
    //var range1 = mFrom.format('YYYYMMDDHHmm');
    //var testFrom = new Date(fromTime);
    //var testTo = new Date(toTime);
    var mToDate = DateTimezone(to,8);
    var mFromDate = DateTimezone(from,8);
    var fromTime = mFromDate.getTime(); 
    var toTime =mToDate.getTime(); 
    console.log('from :' + mFromDate.toString());
    console.log('to   :' + mToDate.toString());
    console.log('timestamp => from :' + fromTime );
    console.log('timestamp => to   :' + toTime );
    var range2 = moment(to,'YYYY-MM-DD HH:mm').format('YYYYMMDDHHmm');
    var range1 = moment(from,'YYYY-MM-DD HH:mm').format('YYYYMMDDHHmm');

    if(range1 === range2){
         var range = range1;
    }else{
         var range = range1 + '-' + range2;
    }
    console.log(new Date()+'Date range : '+range);
    if(isS5_2 !== true){
        var url =  server + settings.query; 
        var time = new Date().getTime().toString();
        var api_token = get_ApiToken(time);
        var form = { mac:mac,from:fromTime,to:toTime,index:index, 
                     limit:limit,api_token:api_token,api_key:settings.api_key,time:time};
    
        request.post(url,{form:form},
            function(err, result) {
                if(err) {
                    callback(err, null);
                }
                else {
                    //console.log('result : '+JSON.stringify(result));
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
                        
                    var json = {"data" : arr , "range":range};
    
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
    }else{
        var url = server2 + settings.query2+'/?macAddr='+mac+'&api_key='+settings.api_key
                  +'&from=' + fromTime + '&to=' +toTime +'&limit='+limit; 
        var options = {
            'url': url
        };
        
        request.get(options, function(error, response, body){
            if (!error && response.statusCode == 200){
                //console.log('body : ' + body+ ', type : '+typeof(body));
                var json = JSON.parse(body);
                var arrList = json.value;
                var total = json.total;
                console.log('total : '+total);
                
                if(total >0){
                    //console.log('arrList : '+arrList.length);
                    console.log('list 0 \n '+JSON.stringify(arrList[0]));
                    console.log('list '+(arrList.length-1)+' \n '+JSON.stringify(arrList[(arrList.length-1)]));
                }
                
                
                if(arrList.length>0){
                    var arr = getDataList(arrList);
                }else{
                    var arr = [];
                }
                    
                var json = {"data" : arr , "range":range};

                if(flag === "true"){
                    json.total = total;
                }

                if(arrList == undefined) {
                    return callback(null, false)
                }
                else {
                    return callback(null,json)
                }
            }
            else{
                if(response){
                    console.log('Code : ' + response.statusCode);
                    console.log('error : ' + error);
                    console.log('body : ' + body);
                }
                
                return callback(error, null);
            }
        });
    }
    
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

function getDateByTimestamp(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var year  = a.getFullYear();

  if( ( a.getMonth()+1 ) <10)
    var month  = '0'+ ( a.getMonth()+1 );
  else
    var month  = ''+ ( a.getMonth()+1 );

  if(a.getDate()<10)
    var date  = '0'+a.getDate();
  else
    var date  = ''+a.getDate();

  var date = year+'/'+month+'/'+date ;
  return date;
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
    var total = json.total;
    if(isS5_2 !== true){
        var arrData = json._source.data;
        var account = json._source.account;
        var mac = account.mac;
        var gid = account.gid; 
        var reportTime = moment(json._source.report_timestamp);
    }else{
        var arrData = json.data;
        var mac = json.macAddr;
        var gid = json.id;
        var reportTime = moment(json.created_at);
    }
    
    if( getType(arrData) === 'array' ){
        var data = arrData[0];
    }else if (getType(arrData) === 'object'){
        var data = arrData;
    }else{
        var data = tmp[0];
    }

    var myDate = reportTime.tz(settings.timezone).format('YYYY-MM-DD');
    var myTime = reportTime.tz(settings.timezone).format('HH:mm:ss');
    var SERVICE_ID = (Number(data.SERVICE_ID)).toString(16);

    arr.push(mac);
    arr.push(gid);
    arr.push(myDate);
    arr.push(myTime);
    arr.push(SERVICE_ID);

    var res = SERVICE_ID.toUpperCase();

    if(serviceMap[res]){
        arr.push(serviceMap[res]);
    }else{
        arr.push('未知');
    }
    arr.push(data.length);
    arr.push(data.DATA_0);
    arr.push(data.DATA_1);
    return arr;
}
