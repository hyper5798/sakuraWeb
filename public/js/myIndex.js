console.log("message manager");
var now = new Date();
var date = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
var connected = false;
var initBtnStr ="#pir";
var type = document.getElementById("type").value;
var host = window.location.hostname;
var port = window.location.port;
var cal1,cal2;
var index = 0;limit = 10000;

var opt2={
   "order": [[ 2, "desc" ]],
   "iDisplayLength": 100,
    scrollY: 400,
 };

var table = $("#table1").dataTable(opt2);

var buttons = new $.fn.dataTable.Buttons(table, {
     buttons: [
       //'copyHtml5',
       //'excelHtml5',
       'csvHtml5',
       //'pdfHtml5'
    ]
}).container().appendTo($('#buttons'));
if(location.protocol=="https:"){
  var wsUri="wss://"+host+":"+port+"/ws/";
} else {
  var wsUri="ws://"+host+":"+port+"/ws/";
}
console.log("wsUri:"+wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    //console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m. data !== null){
      var msg =JSON.parse(m.data);
      console.log("from-node-red : id:"+msg.id);
      if(msg.id === 'change_table'){
          //Remove init button active
          console.log("initBtnStr:"+initBtnStr+"remove active");
          //$(initBtnStr).siblings().removeClass("active");
          $(initBtnStr).addClass().siblings().removeClass("active");
          //Reload table data
          console.log("v type:"+typeof(msg.v));

            table.fnClearTable();
            var data = JSON.parse(msg.v);
            if(data){
                  //console.log("addData type : "+ typeof(data)+" : "+data);
                  table.fnAddData(data);
                  table.$('tr').click(function() {
                  var row=table.fnGetData(this);
                  toSecondTable(row[1]);
              });
            }
      }else if(msg.id === 'init_btn'){
          //Set init button active
          console.log("highlight type:"+typeof(msg.v)+" = "+ msg.v);
          type = msg.v;
          initBtnStr  ='#'+msg.v;
      }
    }
  }

  ws.onopen = function() {

    connected = true;

    var obj = {"id":"init","v":type};
    var getRequest = JSON.stringify(obj);
    console.log("getRequest type : "+ typeof(getRequest)+" : "+getRequest);
    console.log("ws.onopen : "+ getRequest);
    ws.send(getRequest);      // Request ui status from NR
    console.log(getRequest);
  }
  ws.onclose   = function()  {
    console.log('Node-RED connection closed: '+new Date().toUTCString());
    connected = false;
    ws = null;
  }
  ws.onerror  = function(){
    console.log("connection error");
  }
}
wsConn();           // connect to Node-RED server


function myFunction(id){  // update device
  console.log(id);
  if(ws){
      console.log("ws.onopen OK ");
  }
  console.log("id type : "+ typeof(id)+" : "+id);
  type = id;
  initBtnStr = "#"+id;
  var obj = {"id":"change_type","v":id};
  var objString = JSON.stringify(obj);
  console.log("getRequest type : "+ typeof(objString)+" : "+objString);
  console.log("ws.onopen : "+ objString);
  ws.send(objString);     // Request ui status from NR
  console.log("sent change_type requeset");
}

function toSecondTable(mac){
    //alert("mac :"+mac);
    var startDate =document.getElementById("startDate").value;
    var endDate =document.getElementById("endDate").value;
    var option = '2';
    //alert("date :"+date);
    document.location.href="/devices?mac="+mac+"&type="+type+"&date="+date+"&option="+option;
}

function test(){
  $('#myModal').modal('show');
}

function refresh(){
  //alert('refresh');
  toQuery();
}

function disableBtn() {
    //document.getElementById("BTN").disabled = true;
    //document.getElementById("BTN2").disabled = true;
    $('#BTN').attr('disabled', true);
    $('#BTN2').attr('disabled', true);
    $('#startDate').attr('disabled', true);
    $('#endDate').attr('disabled', true);
    $('#startDate').val('');
    $('#endDate').val('');
}

function enableBtn() {
    //document.getElementById("BTN").disabled = false;
    //document.getElementById("BTN2").disabled = false;
    $('#BTN').attr('disabled', false);
    $('#BTN2').attr('disabled', false);
    $('#startDate').attr('disabled', false);
    $('#endDate').attr('disabled', false);
}

function disableMac() {
    //document.getElementById("mac").disabled = true;
    $('#mac').attr('disabled', true);
}

function enableMac() {
    //document.getElementById("mac").disabled = false;
    $('#mac').attr('disabled', false);
  }

function toQuery(){
  alert('toSubmit()');
  var mac = $('#mac').val();
  var from = $('#startDate').val();
  var to = $('#endDate').val();
  if(document.getElementById("startDate").value === ''){
      to = date;
  }
  var url = 'http://'+host+":"+port+'/todos/query?mac='+mac+'&from='+from+'&to='+to+'&index='+index+'&limit='+limit;
  alert(url);
  loadDoc(url);
}

function loadDoc(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("alert").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}


$(document).ready(function(){

    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);

    });

    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        toSecondTable(row[1]);

    });
    cal1 =new Calendar({
        inputField: "startDate",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });

    cal2 = new Calendar({
        inputField: "endDate",
        dateFormat: "%Y/%m/%d",
        trigger: "BTN2",
        bottomBar: true,
        weekNumbers: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });

   $('#input-1').iCheck({
    checkboxClass: 'icheckbox_flat-red',
    radioClass: 'iradio_flat-red'
  });
   $('#input-2').iCheck({
    checkboxClass: 'icheckbox_flat-red',
    radioClass: 'iradio_flat-red'
  });

  $('#input-1').on('ifToggled', function(event){

      if( $("#input-1").prop("checked") ) {
         //alert('input-1 ifToggled checked');
         enableBtn();
       } else {
         //alert('input-1 ifToggled unchecked');
         disableBtn();
       }
  });

  $('#input-2').on('ifToggled', function(event){

      if( $("#input-2").prop("checked") ) {
         //alert('input-2 ifToggled checked');
         enableMac();
       } else {
         //alert('input-2 ifToggled unchecked');
         disableMac();
       }

  });
  disableBtn();
  disableMac();
  var received = [1,2,3,4,5,6,7,8];
  var num = "/ &nbsp;&nbsp;"+ received.length;
  $("#lblTotalPage").html(num);

  $('#codici_transazioni').html("");
    for (var i=0; i< received.length ; i ++) {
    $('#codici_transazioni').append("<option value=" + received[i] + "> " + "<i>" + received[i]+ "</i></option>");
  }

  //toQuery();

});