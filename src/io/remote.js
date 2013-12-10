$(document).ready(function(){
    var query = $("#search_field").val();

    $.ajax({
        type: 'GET',
        url: 'http://macrocro.com:8181/search/index.json?type=series',
        dataType: 'jsonp',
        crossDomain: true,
        cache: false,
        success: function(json){
            console.log(json);

            var remote_list = $("#remote_list");

            for (var i in json ) {
                remote_list.append("<option>"+json[i].series_description+"</option>");
            }
        }
    });

    $(document).on('click', '#submit_btn', function(){
        var val = $('#remote_list option:selected').text();
        alert(val);
        $.ajax({
            type: 'GET',
            url: 'http://macrocro.com:8181/search/getZip',
            data: "series="+val,
            dataType: 'jsonp',
            crossDomain: true,
            cache: false,
            success: function(json){
                console.log(json);
            }
        });
    });
});
