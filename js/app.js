/* Custom Javascript for this PhoneGap APP */

document.addEventListener("deviceready",onDeviceReady,false);

function onDeviceReady()
{
  //Phonegap is ready
  console.log("Phonegap is ready");
alert("binding events");
  //Binding Network Events on Phonegap DeviceReady
   document.addEventListener("online", onOnline, false);
   document.addEventListener("offline", onOffline, false);
}

function onOnline()
{
  alert("event fired online");
 $("#statusLight").css({"background-color":"green"});
}

function onOffline()
{
 $("#statusLight").css({"background-color":"red"});
}

$(document).on( "mobileinit", function() {
	console.log("Initialize jQuery Mobile Phonegap Enhancement Configurations")
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    $.mobile.buttonMarkup.hoverDelay = 0;
    $.mobile.pushStateEnabled = false;
    $.mobile.defaultPageTransition = "none";
});


function addContact_BtnClick()
{
  var fname = $("#fname").val();
  var lname = $("#lname").val();
  var number = $("#number").val();
  if(fname == "" || number == "")
  	alert("First Name & Number are required to add a Contact.");
  else
  {
  	appendContactRow({"id":"2334sds23","FirstName":fname,"LastName":lname,"Number":number});
  }

}

function appendContactRow(obj)
{
	console.log(obj);
	$("#contactList").prepend("<li id='"+obj.id+"'><h2 class='name'>"+obj.FirstName+" "+obj.LastName+"</h2><p class='number'>+91-"+obj.Number+"</p>	<div class='callIco'></div></li>")
	.listview("refresh");
  $("#addContact").popup("close");
	myScroll.refresh();
}


var myScroll,
  pullDownEl, pullDownOffset,
  pullUpEl, pullUpOffset,
  generatedCount = 0;

function pullDownAction () {
  setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
    appendContactRow({"id":"2334sds23","FirstName":"Generated","LastName":"1","Number":"9888877666"});
    myScroll.refresh();   // Remember to refresh when contents are loaded (ie: on ajax completion)
  }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
}

function loaded() {
  pullDownEl = document.getElementById('pullDown');
  pullDownOffset = pullDownEl.offsetHeight;

  
  myScroll = new iScroll('wrapper', {
    useTransition: true,
    topOffset: pullDownOffset,
    onRefresh: function () {
      if (pullDownEl.className.match('loading')) {
        pullDownEl.className = '';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
      } 
    },
    onScrollMove: function () {
      if (this.y > 5 && !pullDownEl.className.match('flip')) {
        pullDownEl.className = 'flip';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
        this.minScrollY = 0;
      } else if (this.y < 5 && pullDownEl.className.match('flip')) {
        pullDownEl.className = '';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
        this.minScrollY = -pullDownOffset;
      }
    },
    onScrollEnd: function () {
      if (pullDownEl.className.match('flip')) {
        pullDownEl.className = 'loading';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';        
        pullDownAction(); // Execute custom function (ajax call?)
      } 
    }
  });
  //setTimeout(function () { document.getElementById('wrapper').style.left = '0'; }, 800);
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);