var url = new URL(window.location.href);
var token = url.searchParams.get("access_token");
//animation on favourite artists card and redirect to the selected artist
$(document).ready(function(){
    $(".artist-card").mouseenter(function() {
        $(this).children(".card-img").css({
                filter: "brightness(50%)",
        });
        $(this).children(".card-title").show();
    });
    $(".artist-card").mouseleave(function() {
        $(this).children(".card-img").css({
                filter: "brightness(100%)",
        });
        $(this).children(".card-title").hide();
    });
    $(".artist-card").click(function() {
        window.location.href = "http://localhost:3000/artists" + "?access_token=" + token + "&" + "id=" + $(this).attr("artist-id") + "s";
    });

});
//animation on favourite songs cards and redirect to the selected song
$(document).ready(function(){
    $(".song-card").mouseenter(function() {
        $(this).children(".card-img").css({
                filter: "brightness(50%)",
        });
        $(this).children(".card-title").show();
        $(this).children(".card-subtitle").show();
    });
    $(".song-card").mouseleave(function() {
        $(this).children(".card-img").css({
                filter: "brightness(100%)",
        });
        $(this).children(".card-title").hide();
        $(this).children(".card-subtitle").hide();
    });
    $(".song-card").click(function() {
        var artist=$(this).attr("artist-name");
        var song=$(this).attr("song-name");
        geniusRef(artist,song)
        
    });
});
//animation on carousel and redirect to the selected song 
$(document).ready(function() {
    $(".carousel").mouseenter(function() {
        $(this).children(".carousel-inner").children().each(function() {
            $(this).children("img").css({
                filter: "brightness(50%)",
            })
        })
    })
    $(".carousel").mouseleave(function() {
        $(this).children(".carousel-inner").children().each(function() {
            $(this).children("img").css({
                filter: "brightness(100%)",
            })
        })
    })
    $(".carousel-item").click(function() {
        var artist=$(this).children("div").children("p").text();
        var song=$(this).children("div").children("h5").text();
        geniusRef(artist, song);
    })
})

const access_token = "kG91TrvmqYf06aeYAOpgxFTXcmUAJ0N0wRCtbn7m-tHXsfGVDWULJAGro3dbQWfS";
const API = "https://api.genius.com";
//call to get genius song id passing artist and song from spotify
function geniusRef(artist,song) {
    for(let i = 3; i < song.length; i++) {
        if(song[i] == "(" || song[i] == "-") {
            song = song.slice(0,i)
        }
    }
    artist = artist.replace(" ","%20");
    song = song.replace(" ","%20");

    var url = API + "/search?q=" + song + "%20" + artist + "&"+ "access_token=" + access_token;
    /* https://api.genius.com/search?q=:query */
       
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleResponse;
    httpRequest.open("GET",url,false);
    httpRequest.send();
   
};
//on call success redirect to the song page
function handleResponse(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        var id =JSON.parse(e.target.responseText)//.response.hits[0].result.id;
        
        id=id.response.hits[0].result.id;
        window.location.href = "http://localhost:3000/songs?id=" + id + "&" +"access_token=" + token;
    }
}


