/****************************FOLLOW********************************/
//call for adding the current artist to Spotify favourite artists
function follow(id) {
    const ajaxUrl = "https://api.spotify.com/v1/me/following?type=artist&ids=" + id + "&access_token=" + access_token;

    sendAjaxRequest("PUT", ajaxUrl, handleResponseFollow);
   
};

function handleResponseFollow(e){

    if (e.target.readyState == 4 && (e.target.status == 200 || e.target.status == 204)){     
        $("#spotify-button").empty();
        $("#spotify-button").append('<button type="button" class="btn btn-secondary btn-lg rounded-pill" onclick="unfollow(artistid)">Unfollow</button>');
    }    
}


/***************************UNFOLLOW*******************************/
//call to delete from spotify favourite artists the current artist
function unfollow(id) {
    const ajaxUrl = "https://api.spotify.com/v1/me/following?type=artist&ids=" + id + "&access_token=" + access_token;

    sendAjaxRequest("DELETE", ajaxUrl, handleResponseUnfollow);

};

function handleResponseUnfollow(e){
    
    if (e.target.readyState == 4 && (e.target.status == 200 || e.target.status == 204)){
        $("#spotify-button").empty();
        $("#spotify-button").append('<button type="button" class="btn btn-success btn-lg rounded-pill" onclick="follow(artistid)">Follow</button>');
    }    
}

