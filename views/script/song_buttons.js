/******************************PLAY*********************************/
//call to play the current song on spotify players
function play_song(id, token) {
    
    var body = {
        "uris": [ "spotify:track:" + id ]
    }

    var url = "https://api.spotify.com/v1/me/player/play?access_token=" + token;

    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponsePlaySong;
    httpRequest.open("PUT", url, true);
    httpRequest.send(JSON.stringify(body));

}

function handleResponsePlaySong(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        console.log("play");
    }        
}


/*****************************REMOVE********************************/
//call to remove current song from spotify favourite songs
function removetrack(id,token) {
    var url = "https://api.spotify.com/v1/me/tracks?ids=" + id + "&"+ "access_token=" + token;

    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponseRemove;
    httpRequest.open("DELETE", url, true);
    httpRequest.send();

}
//if call goes well changes the botton from remove to add
function handleResponseRemove(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        $("#add-to-library-button").empty();
        $("#add-to-library-button").append('<button type="button" class="btn btn-success btn-lg rounded-pill" onclick="addtrack(songid,token)">Add to library</button>');
    }    
}


/*******************************ADD*********************************/
//call for adding current song to spotify favourite songs
function addtrack(id,token) {
    var url = "https://api.spotify.com/v1/me/tracks?ids=" + id + "&"+ "access_token=" + token;

    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponseAdd;
    httpRequest.open("PUT", url, true);
    httpRequest.send();
   
}
//if call goes well changes the botton from add to remove
function handleResponseAdd(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        $("#add-to-library-button").empty();
        $("#add-to-library-button").append('<button type="button" class="btn btn-secondary btn-lg rounded-pill" onclick="removetrack(songid,token)">Remove from library</button>');
    }    
}
