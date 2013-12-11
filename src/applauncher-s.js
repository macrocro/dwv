function toggle(dialogId)
{
    if( $(dialogId).dialog('isOpen') ) $(dialogId).dialog('close');
    else $(dialogId).dialog('open');
}

// check browser support
dwv.html.browser.check();
// main application
var app = new dwv.App();

// jquery
$(document).ready(function(){
    // initialise buttons
    $("button").button();
    $("#toggleInfoLayer").button({ icons:
        { primary: "ui-icon-comment" }, text: false });
    // create dialogs
    $("#openData").dialog({ position:
        {my: "left top", at: "left top", of: "#pageMain"} });
    $("#toolbox").dialog({ position:
        {my: "left top+200", at: "left top", of: "#pageMain"} });
    $("#history").dialog({ position:
        {my: "left top+370", at: "left top", of: "#pageMain"}});
    $("#tags").dialog({ position:
        {my: "right top", at: "right top", of: "#pageMain"},
        width: 500, height: 590 });
    $("#help").dialog({ position:
        {my: "right top", at: "right top", of: "#pageMain"},
        width: 500, height: 590 });

    // image dialog
    $("#layerDialog").dialog({ position:
        {my: "left+320 top", at: "left top", of: "#pageMain"}});
    // default size
    $("#layerDialog").dialog({ width: "auto", resizable: false });
    // Resizable but keep aspect ratio
    // TODO it seems to add a border that bothers getting the cursor position...
    //$("#layerContainer").resizable({ aspectRatio: true });

    // button listeners
    var button = null;
    // open
    button = document.getElementById("open-btn");
    if( button ) button.onclick = function() { toggle("#openData"); };
    // toolbox
    button = document.getElementById("toolbox-btn");
    if( button ) button.onclick = function() { toggle("#toolbox"); };
    // history
    button = document.getElementById("history-btn");
    if( button ) button.onclick = function() { toggle("#history"); };
    // tags
    button = document.getElementById("tags-btn");
    if( button ) button.onclick = function() { toggle("#tags"); };
    // layerDialog
    button = document.getElementById("layerDialog-btn");
    if( button ) button.onclick = function() { toggle("#layerDialog"); };
    // info
    button = document.getElementById("info-btn");
    if( button ) button.onclick = function() { app.toggleInfoLayerDisplay(); };
    // help
    button = document.getElementById("help-btn");
    if( button ) button.onclick = function() { toggle("#help"); };

    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    var inputUrls = dwv.html.getUriParam();
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);

    // help
    // TODO Seems accordion only works when at end...
    $("#accordion").accordion({ collapsible: "true", active: "false", heightStyle: "content" });

    $(document).on('click', '#submit_btn', function(){
        var val = $('#remote_list option:selected').text();
        url = Array("http://macrocro.com:8181/search/getZip?series="+val);
        app.loadURL(url);
    });

});
