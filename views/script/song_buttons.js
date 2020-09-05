/******************************PLAY*********************************/
//call to play the current song on spotify players
function play_song(id) {
    
    var body = {
        "uris": [ "spotify:track:" + id ]
    }

    const ajaxUrl = "https://api.spotify.com/v1/me/player/play?access_token=" + access_token;

    sendAjaxRequest("PUT", ajaxUrl, () => {}, true, body);

}

/*****************************REMOVE********************************/
//call to remove current song from spotify favourite songs
function removetrack(id) {
    const ajaxUrl = "https://api.spotify.com/v1/me/tracks?ids=" + id + "&access_token=" + access_token;

    sendAjaxRequest("DELETE", ajaxUrl, handleResponseRemove);

}
//if call goes well changes the botton from remove to add
function handleResponseRemove(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        $("#add-to-library-button").empty();
        $("#add-to-library-button").append('<button type="button" class="btn btn-success btn-lg rounded-pill" onclick="addtrack(songid)">Add to library</button>');
    }    
}


/*******************************ADD*********************************/
//call for adding current song to spotify favourite songs
function addtrack(id) {
    const ajaxUrl = "https://api.spotify.com/v1/me/tracks?ids=" + id + "&access_token=" + access_token;

    sendAjaxRequest("PUT", ajaxUrl, handleResponseAdd);
   
}
//if call goes well changes the botton from add to remove
function handleResponseAdd(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        $("#add-to-library-button").empty();
        $("#add-to-library-button").append('<button type="button" class="btn btn-secondary btn-lg rounded-pill" onclick="removetrack(songid)">Remove from library</button>');
    }    
}
