/* Custom Javascript for this PhoneGap APP */

document.addEventListener("deviceready",onDeviceReady,false);

// Global Application Object
var app = {
  db:null,
  storage:null,
  settings:null,
  syncInProgress:false,
  networkStatus:'offline',
  // Function to Initialize the App Settings
initializeApp:function() {
  app.storage = window.localStorage;
  app.settings = app.storage.getItem("AppSettings");
    
  if (app.settings != null) {
    app.settings = $.parseJSON(app.settings);
  }
  else {
    // Initialize App Settings in Local Storage -- By Default 
        app.settings = '{"appName": "ContactsPro","lastSyncDate": "null","totalContacts":0}';
    app.storage.setItem("AppSettings", app.settings);
    app.settings = $.parseJSON(app.settings);
  }   
}
};

// Defining the Objects to be Used for Data Synchronization with the Backend

function Contact()
{
  this.id = null;
  this.FirstName = null;
  this.LastName = null;
  this.Number = null;
  this.lastSyncDateTime = null;
}

// Phonegap Lifecycle Events

function onDeviceReady()
{
  //Phonegap is ready
  console.log("Phonegap is ready");
  
  // Initializing App Settings
  app.initializeApp();

// Creating a new DB to store Contacts
  app.db = window.openDatabase("contactdb", "1.0", "ContactsDB", 2000000);

  //Binding Network Events on Phonegap DeviceReady
   document.addEventListener("online", onOnline, false);
   document.addEventListener("offline", onOffline, false);

  
  // Populating the DB Structure & Dummy Data - if Any
  app.db.transaction(populateDB, errorCB, successCB);

  if (app.settings.lastSyncDate != "null")
    app.db.transaction(getContactsFromDb,errorCB); // Fetching the Offline Objects Stored in the Database

  updateConnectionStatus();

  $(document).on("click",".callIco",function(event){
   var number = $(event.target).parent().children('p').html();
   window.location.href = "tel:"+number;
  });

}

function onOnline()
{
 $("#statusLight").css({"background-color":"green"});
 $("#statusTxt").html("ONLINE");
 app.networkStatus = 'online';
// Initializing Parse Backend
Parse.initialize("vGMwigvggiUA5EHyPAT3jdkFZEuqzQSZOC2LMp2G", "9ERhaGJXC8SMzrR55DON6utEOXxdF3CvdoXqgaXi");
 startSync();
}

function onOffline()
{
 $("#statusLight").css({"background-color":"red"});
 $("#statusTxt").html("OFFLINE");
 app.networkStatus = 'offline';
}

function updateConnectionStatus() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if(networkState == Connection.NONE)
       onOffline();
    else
       onOnline();
}

// Initialization of jQuery Mobile

$(document).on( "mobileinit", function() {
	console.log("Initialize jQuery Mobile Phonegap Enhancement Configurations")
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    $.mobile.buttonMarkup.hoverDelay = 0;
    $.mobile.pushStateEnabled = false;
    $.mobile.defaultPageTransition = "none";
});

/* Custom Code */

function addContact_BtnClick()
{
  var fname = $("#fname").val();
  var lname = $("#lname").val();
  var number = $("#number").val();
  if(fname == "" || number == "")
  	alert("First Name & Number are required to add a Contact.");
  else if(!isNumber(number) || number.length != 10)
    alert("Please enter a 10 digit valid number.")
  else
  {
  	var contactList = Array({id:'ps'+(++app.settings.totalContacts),"FirstName":fname,"LastName":lname,"Number":number,lastSyncDateTime:null});
    appendContactRow(contactList[0]);
    app.db.transaction(function(tx) { insertIntoContacts(tx,contactList)},errorCB,successContactListEntry);

  }

}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function appendContactRow(obj)
{
	$("#contactList").prepend("<li id='"+obj.id+"'><h2 class='name'>"+obj.FirstName+" "+obj.LastName+"</h2><p class='number'>+91-"+obj.Number+"</p><div class='callIco'></div><div class='syncStatus'>PENDING SYNC</div></li>")
	.listview("refresh");
  $("#addContact").popup("close");
	myScroll.refresh();
}

function appendMultipleContacts(contactList)
{
   for (var i in contactList)
    { 
      var obj = contactList[i];
      if(obj.lastSyncDateTime != 'null')
        $("#contactList").prepend("<li id='"+obj.id+"'><h2 class='name'>"+obj.FirstName+" "+obj.LastName+"</h2><p class='number'>+91-"+obj.Number+"</p> <div class='callIco'></div></li>");
      else
        $("#contactList").prepend("<li id='"+obj.id+"'><h2 class='name'>"+obj.FirstName+" "+obj.LastName+"</h2><p class='number'>+91-"+obj.Number+"</p> <div class='callIco'></div><div class='syncStatus'>PENDING SYNC</div></li>");
    }
    $("#contactList").listview("refresh");
}

function updateSyncStatus(id,status,color)
{

  if(status == 'SYNCING')
   status = "<img src='images/sync.gif' height='10px'> "+status;

 $("#"+id).children(".syncStatus").html("").html(status);
 
  if(color != '')
    $("#"+id).children(".syncStatus").css({"background-color":color});
}

/* FUNCTIONS FOR OFFLINE DATABASE SUPPORT AND MANAGEMENT */

function populateDB(tx) {
     //tx.executeSql('DROP TABLE IF EXISTS CONTACTS');
     tx.executeSql('CREATE TABLE IF NOT EXISTS CONTACTS (id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT,backendId,fname,lname,number,lastSyncDateTime)');
}

function errorCB(err) {
  //console.log(err);
    alert("Error processing SQL: "+err.message);
}

function successCB() {

}

function successContactListEntry()
{
  //app.settings.lastSyncDate = new Date();
  updateSettings();
}

function insertIntoContacts(tx,contactList)
{
  for (var i in contactList)
    { 
      var obj = contactList[i];
      tx.executeSql("INSERT INTO contacts(backendId,fname,lname,number,lastSyncDateTime) VALUES('"+obj.id+"','"+obj.FirstName+"','"+obj.LastName+"','"+obj.Number+"','"+obj.lastSyncDateTime+"')"); 
    }
}

function updateSyncedContact(tx,id,backendId,createdAt)
{
  tx.executeSql("UPDATE CONTACTS SET backendId = '"+backendId+"',lastSyncDateTime='"+createdAt+"' WHERE backendId = '"+id+"'");
}

function getContactsFromDb(tx)
{
  tx.executeSql('SELECT * FROM CONTACTS', [], displaySelectedContacts, errorCB);
}

function displaySelectedContacts(tx,results)
{
  var contactList = Array();
  for(var i=0;i<results.rows.length;i++)
  {
    var contactObj = new Contact();
    contactObj.id = results.rows.item(i).backendId;
    contactObj.FirstName = results.rows.item(i).fname;
    contactObj.LastName = results.rows.item(i).lname;
    contactObj.Number = results.rows.item(i).number;
    contactObj.lastSyncDateTime = results.rows.item(i).lastSyncDateTime;
    contactList.push(contactObj);
  }
  appendMultipleContacts(contactList);
}

function selectSyncPendingContacts(tx)
{
  tx.executeSql("Select * from Contacts where lastSyncDateTime = 'null'", [], identifiedSyncPendingObjects, errorCB);
}

function identifiedSyncPendingObjects(tx,results)
{
   var contactList = Array();
  for(var i=0;i<results.rows.length;i++)
  {
    var contactObj = new Contact();
    contactObj.id = results.rows.item(i).backendId;
    contactObj.FirstName = results.rows.item(i).fname;
    contactObj.LastName = results.rows.item(i).lname;
    contactObj.Number = results.rows.item(i).number;
    contactObj.lastSyncDateTime = results.rows.item(i).lastSyncDateTime;
    contactList.push(contactObj);
  }
  uploadOfflineObjects(contactList);
}


/* 
    Functions & APIs for Offline Sync Component
      It comprises of 3 major functionalities :
      1. Download New Objects
      2. Store & Forward Objects from Client
      3. Update Objects on Server which were modified on Clients
*/

function startSync()
{
  if(!app.syncInProgress && app.networkStatus == 'online') {
    app.syncInProgress = true;
    // No.1 Section Executed
    downloadNewObjects();
    // No.2 Section Executed
    app.db.transaction(selectSyncPendingContacts,errorCB); // Fetching the Offline Objects Stored in the Database
  }else
  {
    myScroll.refresh();
  }
}

function updateSettings()
{
     app.storage.setItem("AppSettings", JSON.stringify(app.settings));
}

function downloadNewObjects()
{  
  var contact = Parse.Object.extend("contact");
    //var category = Parse.Object.extend("Category");
  var query = new Parse.Query(contact);
  if (app.settings.lastSyncDate != "null")
    query.greaterThan("createdAt", new Date(app.settings.lastSyncDate));
    query.ascending("createdAt");
    $("#footerTxt").html("<img src='images/loader.gif'> &nbsp;&nbsp;&nbsp;SYNC IN PROGRESS")
  query.find({
    success: function(results) {
            var updatesList = new Array();
            if(results.length != 0)
            {   
              var contactList = Array();
              for(var i in results) 
              {
                var contactObj = new Contact();
                contactObj.id = results[i].id;
                contactObj.FirstName = results[i].get("firstName");
                contactObj.LastName = results[i].get("lastName");
                contactObj.Number = results[i].get("number");
                contactObj.lastSyncDateTime = results[i].createdAt;

                 if(!contactExists(contactObj.Number))
                    contactList.push(contactObj);
                app.settings.lastSyncDate = results[i].createdAt;
              }
              app.db.transaction(function(tx) { insertIntoContacts(tx,contactList)},errorCB,successContactListEntry);
              appendMultipleContacts(contactList);
              myScroll.refresh();
              $("#footerTxt").html(contactList.length+"&nbsp;New Contacts Added");
              app.settings.totalContacts += contactList.length; 
          }else
            {
              $("#footerTxt").html("Sync Done : No New Contacts Available");
              myScroll.refresh();
            }
       app.syncInProgress = false;
    },
    error: function(error) {
      if(error.code == -1)
        $("#footerTxt").html("Internet Not Available");
      else
        alert("Error: " + error.code + " " + error.message);
    }
  });
}

function contactExists(number)
{
 var div =  $("#contactList:contains('"+number+"')");
 if(div.length != 0)
  return true;
 else
  return false;
}

function uploadOfflineObjects(objectList)
{
  var newContactsList = Array();
  for(var i in objectList) {
    var currObj = objectList[i];
    updateSyncStatus(currObj.id,"SYNCING","");
    var ContactClass = Parse.Object.extend("contact");
    var contactObj = new ContactClass();
    contactObj.set("firstName",currObj.FirstName);
    contactObj.set("lastName",currObj.LastName);
    contactObj.set("number",currObj.Number);

        contactObj.save(null, {
      success: function(contact) {
        console.log(contact);
        app.db.transaction(function(tx) { updateSyncedContact(tx,currObj.id,contact.id,contact.createdAt)},errorCB,successCB);
        updateSyncStatus(currObj.id,"SYNCED","green");
      },
      error: function(contact, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and description.
        alert('Failed to create new object, with error code: ' + error.description);
      }
    });
  }
}

/* FUNCTIONS TO SUPPORT PULL DOWN FUNCTIONALITY */

var myScroll,
  pullDownEl, pullDownOffset,
  generatedCount = 0;

function pullDownAction () {
  startSync();
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