// This code loads the IFrame Player API code asynchronously.

var video = $('#player').attr("video"); //video url taken from genius call
if(video) {

    var id = filterVideoId();
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";//script element and gives source 
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // This function creates an <iframe> (and YouTube player)
    // after the API code downloads.
    var player;
    function onYouTubeIframeAPIReady() {//load the youtube player
        player = new YT.Player('player', {
            width: '100%',
            videoId: id,
            
        });
    }
    
    // This function filters the youtube video ID from the URL
    function filterVideoId() {
        
        var copy = false;
        var id = "";
        for(var i = 0; i < video.length; i++) {
            if(copy) id += video[i];
            if(video[i] == '=') copy = true;
        };
        
        return id;
    }
}

