////////////////////////////////////////////////////////////////////////////
/********NAVBAR SCRIPT TO HANDLE WEB SOCKETS AND SEARCHING OF DATA*********/

if (!"WebSocket" in window) alert("WebSocket not supported by your browser");

var socket = new WebSocket('ws://localhost:4000/');

///////////////////////WEB SOCKET HANDLERS//////////////////////////////////

// When data is received
socket.onmessage = function(event) {
    show(JSON.parse(event.data));  
}

// A connection could not be made
socket.onerror = function(event) {
    console.log(event);
}

// Close the connection when the window is closed
window.addEventListener('beforeunload', function() {
    socket.close();
});

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////SEARCH FUNCTIONS/////////////////////////////////

var request_id = 0;
document.getElementById("search-field").addEventListener("input", searchEvent);
//
function searchEvent(id) {

    var id = ++request_id;

    if(document.getElementById("search-field").value == " ")   //does not allow to write spaces if
        document.getElementById("search-field").value = "";    //the form is empty

    var searchquery = document.getElementById("search-field").value;   

    if(searchquery == "") hideBox();
    else {
        if(!loading) {
            searchBox.empty();
            searchBox.append(spinner);
            loading = true;
        }
        showBox();

        setTimeout(() => {
            if(request_id == id) {
                socket.send(searchquery);  //send data to server only if no other researches are made
                                           //in 1 second
            }                                     
        }, 1000);                        
    }
}
// shows results of the search
function show(result) {

    loading = false;
    searchBox.empty();

    if(result.songs.length == 0) 
        searchBox.append("<p class='search-box-text' style='text-align: center; padding-top: 100px'> No results found </p>")

    for(i = 0; i < result.songs.length; i++) {

        var songName = result.songs[i].name;
        var artistName = result.songs[i].artist;
        if(songName.length > 38) songName = result.songs[i].name.substring(0, 35) + "...";
        if(artistName.length > 38) artistName = result.songs[i].artist.substring(0, 35) + "...";

        var search_element = $("<div class='row tab song result' type='song' id='" + result.songs[i].id + "'></div>"); 
        search_element.append("<img class='col-4 thumbnail' src=" + result.songs[i].photo + ">");
        search_element.append("<p class='search-box-text'>" + songName + "<br>" + artistName + "</p>");
        searchBox.append(search_element);
        searchBox.append("<hr>");
    }

    for(var i = 0; i < result.artists.length; i++) {

        var artistName = result.songs[i].artist;
        if(artistName.length > 40) artistName = result.songs[i].artist.substring(0, 37) + "...";

        var search_element = $("<div class='row tab result' type='artist' id='" + result.artists[i].id + "'></div>"); 
        search_element.append("<img class='col-4 thumbnail' src=" + result.artists[i].photo + ">");
        search_element.append("<p class='search-box-text'>" + artistName + "</p>");
        searchBox.append(search_element);
        searchBox.append("<hr>");
    }

    $(document).ready(function(){
        $(".tab").mouseenter(function(){
            $(this).css("background-color", "rgba(143, 143, 143, 0.199)");
        });
        $(".tab").mouseleave(function(){
            $(this).css("background-color", "white");
        });

        $(".tab").click(function() {
            if($(this).attr("type") == "song") {
                if(token) next_url = "http://localhost:3000/songs?access_token="+ token +"&id=" + $(this).attr("id");
                else next_url = "http://localhost:3000/songs?id=" + $(this).attr("id");
                window.location.href = next_url;
            }
            else if($(this).attr("type") == "artist") {
                if(token) next_url = "http://localhost:3000/artists?access_token="+ token +"&id=" + $(this).attr("id");
                else next_url = "http://localhost:3000/artists?id=" + $(this).attr("id");
                window.location.href = next_url;
            }
        });
    });
    
}

var url = new URL(window.location.href);
var token = url.searchParams.get("access_token");
var next_url = "";

var searchBox = $(".search-box");
var spinner = $("<div class='row justify-content-center' style='padding-top: 160px;'>" +
                "<div class='loading-spinner'><div class='ldio-q2cfxhasjgq'>" +
                "<div></div></div></div></div>");
var loading = false;

searchBox.hide();

function hideBox() {
    if(searchBox.is(":visible")) {
        loading = false;
        searchBox.empty();
        searchBox.css({top: '0px'});
        searchBox.animate({
            
            top: '-=400px'
            
        }, 400, function() {
            searchBox.hide();
        });
    }
}
function showBox() {
    if(!searchBox.is(":visible")) {
        searchBox.css({top: '-400px'});
        searchBox.show();
        searchBox.animate({
            
            top: '+=400px'

        }, 400);
    }
}

$(document).mouseup(function(e) {
    var container = $(".search-box");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0 && !($('#search-field').is(e.target))) 
    {
        hideBox();

    }
});



