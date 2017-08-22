console.log("message manager");
var now = new Date();
var date = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
var connected = false;
var initBtnStr ="#pir";
var host = window.location.hostname;
var port = window.location.port;
var cal1,cal2;
var index = 0;limit = 1000;
var isNeedTotal = true;
var now = new Date();
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

var date2 =  now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate(),
    date1 =  yesterday.getFullYear() + '/' + (yesterday.getMonth() + 1) + '/' + yesterday.getDate() ;
console.log('date1 :' + date1);
console.log('date2 :' + date2);
$('#startDate').val(date1);
$('#endDate').val(date2);
var range, deviceList;

var opt2={
   dom: 'lrtip',
   //"order": [[ 2, "desc" ]],
   "iDisplayLength": 100,
    scrollY: 400
 };

var table = $("#table1").dataTable(opt2);

var buttons = new $.fn.dataTable.Buttons(table, {
     buttons: [
       //'copyHtml5',
       //'excelHtml5',
       {
          extend: 'csvHtml5',
          text: 'CSV',
          //title: $("#startDate").val()+'-'+$("#endDate").val(),
          filename: function(){
                /*var d = $("#startDate").val();
                var n = $("#endDate").val();
                return 'file-'+d+'-' + n;*/
                return range;
            },
          footer: true,
          bom : true
        },
       //'pdfHtml5'
    ]
}).container().appendTo($('#buttons'));

function search(){

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

function hidePaging(){
  $('#codici_transazioni').hide();
  $("#lblTotalPage").hide();
}

function showPage(total){
  console.log('showPage()');
  $('#codici_transazioni').show();
  $("#lblTotalPage").show();
  $('#codici_transazioni').html("");
  var page = Math.ceil( total/limit );
  for (var i=0; i< page ; i ++) {
      $('#codici_transazioni').append("<option value=" + i + "> " + "<i>" + ((i+1)*limit)+ "</i></option>");
  }
  var num = total + "&nbsp;&nbsp; / &nbsp;&nbsp;"
  $("#lblTotalPage").html(num);
}

function find() {

    var page = $('#codici_transazioni').val();
    index = page*limit;
    //alert('index : '+index);
    toQuery();
}

function btn2(){
    //alert('btn2()');
    //cal2.moveTo(new Date(),true);
    cal1.hide();
}

function btn(){
    //alert('btn()');
    //cal1.moveTo(new Date(),true);
    cal2.hide();
}

function hideCal(){
  cal1.hide();
  cal2.hide();
}

function closeDialog(){
   hideCal();
   $('#myModal').modal('hide');
}

function firstQuery(){
  closeDialog();
  index = 0;
  isNeedTotal = true;
  hidePaging();
  toQuery();
}

function toQuery(){
  //alert($("#startDate").val());
  console.log('toQuery()');
  $.LoadingOverlay("show");
  table.fnClearTable();
  var mac = $('#mac').val();
  var from = $('#startDate').val()+' '+$('#time1').val();
  var to = $('#endDate').val()+' '+$('#time2').val();
  var d1 = new Date( from );
  var d2 = new Date( to );
  //alert('from ='+from+' =>'+ d1.getTime() );
  //alert('to ='+to+'=>'+ d2.getTime() );
  if(d1.getTime() > d2.getTime()){
      $.LoadingOverlay("hide");
      alert('Start time is greater than end time  !\nPlease select date again.');
      return;
  }
  $("#macText").html('<strong>MAC : '+mac+'</strong>');
  var url = 'http://'+host+":"+port+'/todos/query?mac='+mac+'&from='+from+'&to='+to+'&index='+index+'&limit='+limit+'&total='+isNeedTotal;
  //alert(url);

  if(isNeedTotal){
    isNeedTotal = !isNeedTotal;
  }
  loadDoc("query",url);
}

function loadDoc(queryType,url) {
  console.log('loadDoc()');
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       //document.getElementById("alert").innerHTML = this.responseText;
       $.LoadingOverlay("hide");

       var type = this.getResponseHeader("Content-Type");   // 取得回應類型
       console.log('type  : '+type);

        // 判斷回應類型，這裡使用 JSON
        if (type.indexOf("application/json") === 0) {
            var json = JSON.parse(this.responseText);
            //console.log('json  : '+JSON.stringify(json));
            if(queryType === 'query'){
                console.log('Show query list');
                if(json.data && json.data.length>0){
                    //console.log('type.indexOf(data) data : '+json.data.length);
                    table.fnAddData(json.data);
                }

                console.log('total  : '+ json.total );


                if( json.total && json.total > limit){
                  showPage(json.total);
                }
                if(json.range){

                  if( $('#codici_transazioni') ){
                    var select = $('#codici_transazioni').val();
                    //alert(select);
                    range = $('#mac').val()+'_'+json.range +'-'+ ( Number(select) +1 );
                  }else{
                    range = $('#mac').val()+'_'+json.range +'-1';
                  }
                }
            }else if(queryType === "device_list"){
                //Show device list
                if(json.device_list){
                    toShowDevice(json.device_list);
                }else{
                    //Show alert
                    alert('Unable get device list!');
                }
            }
        }
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function toShowDevice(list){
  //console.log('Show device list :\n'+JSON.stringify(list));
  $('#mac').html("");
  for (var i = 0;i<list.length;i++) {
      $('#mac').append("<option value=" + list[i]['mac'] + "> " + "<i>" + getMac(list[i])+ "</i></option>");
  }
}

function getMac(item){
  //console.log('getMac :\n'+JSON.stringify(item));
  var tmp = item.mac +' - '+item.name;
  return tmp;
}

$(document).ready(function(){
    setTimeout(function(){
        //do what you need here
        var mUrl = 'http://'+host+":"+port+'/todos/device_list';
        loadDoc("device_list",mUrl)
    }, 1000);

    cal1 =new Calendar({
        inputField: "startDate",
        dateFormat: "%Y-%m-%d",
        trigger: "startDate",
        bottomBar: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });

    cal2 = new Calendar({
        inputField: "endDate",
        dateFormat: "%Y-%m-%d",
        trigger: "endDate",
        bottomBar: true,
        showTime: false,
        onSelect: function() {this.hide();}
    });
    $('#time1').timepicker({ 'timeFormat': 'H:i:s' });
    $('#time2').timepicker({ 'timeFormat': 'H:i:s' });
  hidePaging();
});


