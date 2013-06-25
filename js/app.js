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
        app.settings = '{"appName": "InsurancePro","lastSyncDate": "null"';
    app.storage.setItem("AppSettings", app.settings);
    app.settings = $.parseJSON(app.settings);
  }   
}
};

$(document).on( "mobileinit", function() {
  console.log("Initialize jQuery Mobile Phonegap Enhancement Configurations")
    // Make your jQuery Mobile framework configuration changes here!
    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    $.mobile.buttonMarkup.hoverDelay = 0;
    $.mobile.pushStateEnabled = false;
    $.mobile.defaultPageTransition = "none";
});

function onDeviceReady()
{

}

function showPageLoading(text)
{
    $.mobile.loading( "show", {
            text: text,
            textVisible: true,
            theme: 'a',
    });
}

function hidePageLoading()
{
  $.mobile.loading("hide");
}

function login()
{
  showPageLoading("Signing In");
      setTimeout(function(){ 
      var user = $("#username").val();
      var pass = $("#password").val();
      hidePageLoading();
      if(user == 'user' && pass == '123')
      {
         $.mobile.changePage("#clienthome");
      }else if(user == 'agent' && pass == '123')
      {
         $.mobile.changePage("#agenthome");
      }
      else
        alert("You have entered Invalid Login credentials");

    },1500);
}

function goToPage(text,pageid)
{
  showPageLoading(text);
  setTimeout(function(){
    $.mobile.changePage("#"+pageid);
    hidePageLoading();
  },1500);
}

function createAccount()
{
  showPageLoading("Creating");
    setTimeout(function() {
    $("#d_cname").html($("#cname").val());
    $("#d_amt").html($("#amt").val());
    $("#d_duration").html($("#duration").val());
    $("#d_pname").html($("#selectedPlan").val());
    hidePageLoading();
    $.mobile.changePage("#a_newaccount1")
  },2000);
}