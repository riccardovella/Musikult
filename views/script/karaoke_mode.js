var karaoke_active = false;

var karaoke = $("#karaoke");
var karaoke_container = $("#karaoke-container");
var karaoke_text_container = $("#karaoke-text-container");
var karaoke_exit_button = $("#karaoke-exit-button");
var karaoke_mode_button = $("#karaoke-mode-button");

var karaoke_lyrics;
var karaoke_timestamps;
var karaoke_lines;

var karaoke_mode_lyrics;

var karaoke_mode_active = false;

var active_song_id;

var active_index;

var time_lyrics_is_open = false;

function showKaraokeMode() {

    if(time_lyrics_is_open) return;
    if(karaoke_active) return;
    karaoke_active = true;

    $("#karaoke-button").hide();

    karaoke_text_container.hide();

    karaoke.show();
    karaoke.css("height", "100vh");
    karaoke.animate({ top: "0vh", "background-color": "rgb(0, 0, 0, 0.95)"}, 1000);

    document.getElementById("karaoke-thumbnail").src = document.getElementById("thumbnail").src;

    getKaraokeLyrics( showKaraokeLyrics );



}

function hideKaraokeMode() {

    if(!karaoke_active) return;
    karaoke_active = false;

    $("#karaoke-button").show();

    karaoke.animate({ top: "100vh", "background-color": "rgb(0, 0, 0, 0.25)"}, 1000, () => {
        karaoke.css("height", "0vh");
    karaoke.hide();
    });   

}

function karaokeUpdateSong() {

    if(!karaoke_active) return;

    karaoke_text_container.empty();
    document.getElementById("karaoke-thumbnail").style.filter = "brightness(100%)";
    document.getElementById("karaoke-thumbnail").src = document.getElementById("thumbnail").src;

    getKaraokeLyrics();

}

function getKaraokeLyrics() {

    var url = "http://localhost:3000/api/tracks?track=" + document.getElementById("title").innerHTML + "&artist=" + document.getElementById("artist").innerHTML;
    sendAjaxRequest("GET", url, (e) => {
        if(e.target.readyState == 4 && e.target.status == 200) {
            active_song_id = (JSON.parse(e.target.responseText)).id;
            
            url = "http://localhost:3000/api/lyrics?id=" + active_song_id;
            sendAjaxRequest("GET", url, (e) => {
                if(e.target.readyState == 4 && e.target.status == 200) {
                    var response = JSON.parse(e.target.responseText);
                    karaoke_lyrics = response.lyrics;
                    karaoke_timestamps = response.timestamps;
                }
                else if(e.target.readyState == 4) {
                    karaoke_lyrics = null;
                    karaoke_timestamps = null;
                }
                showKaraokeLyrics();
            });
        }

        else if(e.target.readyState == 4) {
            showKaraokeLyrics();
        }
    });

}

function showKaraokeLyrics() {

    active_index = 0;

    karaoke_text_container.empty();
    karaoke_mode_button.hide();
    $(".karaoke-advice-text").remove();

    if(karaoke_lyrics == null) {
        karaoke_text_container.hide();
        karaoke_container.append(`<p class='karaoke-advice-text'> This song has no lyrics, write them in the<a class='karaoke-advice-link' href='javascript:karaokeGoToSongPage()'> song page </a></p>`);
        document.getElementById("karaoke-thumbnail").style.filter = "brightness(100%)";
        return;
    }

    karaoke_mode_lyrics = [];
    for(let i = 0; i < karaoke_lyrics.length; i++) { 
        var string = "";
        if(karaoke_lyrics[i].indexOf('[') != -1 && karaoke_lyrics[i].indexOf(']') != -1) 
            string = karaoke_lyrics[i].slice(0, karaoke_lyrics[i].indexOf('[')) + karaoke_lyrics[i].slice(karaoke_lyrics[i].indexOf(']') + 1);
        else string = karaoke_lyrics[i];

        karaoke_mode_lyrics.push(string);
    }

    document.getElementById("karaoke-thumbnail").style.filter = "brightness(50%)";
    karaoke_text_container.show();

    karaoke_lines = [];
    for(let i = 0; i < karaoke_mode_lyrics.length; i++) {
        var line = $("<p class='karaoke-text'>" + karaoke_mode_lyrics[i] + "</p> <br>");
        karaoke_text_container.append(line);
        if(karaoke_mode_lyrics[i] != "" && karaoke_mode_lyrics[i] != '\r') {
            karaoke_lines.push(line);
        }    
    }
    
    karaoke_text_container.css({ "overflow-y": "scroll" });

    if(karaoke_timestamps != null && karaoke_mode_active) {

        $(".karaoke-text").css({ "font-size": "40px", "color": "rgb(255, 255, 255, 0.5)" });
        karaoke_text_container.css({ "overflow-y": "hidden" });

        karaokeFindActiveLine();

    }

    if(karaoke_timestamps == null) return;
    karaoke_mode_button.show();

}

function karaokeGoToSongPage() {
    redirect('/songs', 'id=' + active_song_id);
}

function karaokeFindActiveLine() {

    var pre_active_index = active_index;
    active_index = 0;
    for(let i = 0; i < karaoke_timestamps.length; i++) {
        if(parseInt(karaoke_timestamps[i]) > progress) {
            active_index = i-1;
            break;
        }
    }
    if(progress > karaoke_timestamps[karaoke_timestamps.length - 1]) active_index = karaoke_timestamps.length - 1;
    if(pre_active_index == active_index) return;
    if(pre_active_index >= 0) 
        karaoke_lines[pre_active_index].css({ "font-size": "40px", "color": "rgb(255, 255, 255, 0.5)" });
    karaokeGoTo(active_index);

}

function karaokeGoTo(index) {

    if(active_index == -1) {
        karaoke_text_container.animate({ scrollTop: 0 }, 1000);
        return;
    }

    karaoke_lines[index].css({ "font-size": "100px", "color": "color: rgb(255, 255, 255, 0.9);" });

    var scrollTop = karaoke_text_container.scrollTop();
    scrollTop += karaoke_lines[index].position().top;

    karaoke_text_container.animate({
        scrollTop: scrollTop
    }, 1000, function() {});

} 

function karaokeUpdate() {

    if(!karaoke_mode_active) return;

    karaokeFindActiveLine();

}


// BUTTONS //
$(document).ready(function() {

// karaoke mode button
karaoke_mode_button.mouseenter(function() {
    karaoke_mode_button.css({ color: "rgb(255, 255, 255, 0.6)"});
})

karaoke_mode_button.mouseleave(function() {
    if(karaoke_mode_active)
        karaoke_mode_button.css({ color: "rgb(255, 255, 255, 0.9)"});
    else
        karaoke_mode_button.css({ color: "rgb(255, 255, 255, 0.3)"});
})

karaoke_mode_button.click(function() {
    karaoke_mode_active = !karaoke_mode_active;
    if(karaoke_mode_active)
        karaoke_mode_button.css({ color: "rgb(255, 255, 255, 0.9)"});
    else
        karaoke_mode_button.css({ color: "rgb(255, 255, 255, 0.3)"});
    showKaraokeLyrics();
})

// karaoke exit button
karaoke_exit_button.on("mouseenter", () => {
    karaoke_exit_button.animate({ "margin-top": "-133px", color: "rgb(255, 255, 255, 0.5)" });
})
karaoke_exit_button.on("mouseleave", () => {
    karaoke_exit_button.animate({ "margin-top": "-140px", color: "rgb(255, 255, 255, 0.25)" });
})

})

$(karaoke).mouseup(function(e) {

    // if the target of the click isn't the container nor a descendant of the container
    if (!karaoke_text_container.is(e.target) && karaoke_text_container.has(e.target).length === 0 && !(karaoke_mode_button.is(e.target))) 
    {
        hideKaraokeMode();

    }
});

