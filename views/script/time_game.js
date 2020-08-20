
var device;
var player;
// create player to listen to the
window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: 'Time Game Musikult Player',
        getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
    
    // Playback status updates
    player.addListener('player_state_changed', state => { checkChanges(state) });
    
    // Ready
    player.addListener('ready', ({ device_id }) => {
        device = device_id;
    });
    
    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        
    });
    
}

var lyrics;
var timestamps;

var animate_text;

var active_line;
var second_line;
var third_line;
var fourth_line;
var lyrics_count;

var lyrics_skips;

var time_game_started = false;
var time_lyrics_is_open = false;

var song_paused;
var first_change;
var game_finished;

var time_game = $("#time-game");
var time_game_text = $("#time-game-text");


function timeLyrics() {

    // initialize all state variables
    if(time_lyrics_is_open) return;
    time_lyrics_is_open = true;

    animate_text = true;

    song_paused = true;

    lyrics_count = 0;
    lyrics_skips = 0;

    song_paused = true;
    first_change = false;
    game_finished = false;

    player.connect();

    timestamps = [];
    lyrics = [""]
    var string = $(".ll").attr("content");
    var index = 0;
    for(var i = 0; i < string.length; i++) {
        if(string[i] == '\n') lyrics[++index] = "";                            
        else lyrics[index] += string[i];
    }    

    time_game.show();
    time_game.css("height", "100vh");
    time_game.animate({ top: "0vh", "background-color": "rgb(0, 0, 0, 0.95)"}, 1000);

    if(lyrics.length < 3) {
        time_game_text.append("<p class='display-3 time-game-start-text'> Sorry these lyrics can't be timed. <br> Press Enter to exit. </p>");
        window.addEventListener("keypress", (e) => {
            if(e.keyCode == 13) exit_time_game();
        });
    }

    time_game_text.append("<p class='display-3 time-game-start-text'> Press Enter to start </p>");

    animate_start_text();

    $("body").css({"overflow-y": "hidden"});
    document.getElementById("time-game-link").blur();
    document.getElementById("player").blur();
    window.addEventListener("keypress", (e) => {
        if(e.keyCode == 13) start_time_game();
    });

    time_game_text.append("<p class='display-3 active-line'></p>");
    time_game_text.append("<p class='display-4 second-line'>" + lyrics[0] + "</p>");
    time_game_text.append("<p class='display-4 third-line'>" + lyrics[1] + "</p>");
    time_game_text.append("<p class='display-4 fourth-line'>" + lyrics[2] + "</p>");

    active_line = $(".active-line");
    second_line = $(".second-line");
    third_line = $(".third-line");
    fourth_line = $(".fourth-line");

    lyrics_count = 3;
}

function animate_start_text() {
    if(!animate_text) return;
    $(".time-game-start-text").animate({ "font-size": "4.2rem"}, 300, () => {
        $(".time-game-start-text").animate({ "font-size": "4.5rem"}, 400, () => {
            animate_start_text();
        });
    });
}

function clear_animation_start_text() {

    $(".time-game-start-text").remove();
    animate_text = false;

}

function start_time_game() {

    if(time_game_started) return;
    time_game_started = true;

    clear_animation_start_text();

    // show instructions for 3 seconds
    time_game_text.before("<p class='display-3 time-game-start-text' style='top:10%'> Press Space to select the next line </p>");
    $(".time-game-start-text").hide();
    $(".time-game-start-text").fadeIn();

    setTimeout(() => {
        $(".time-game-start-text").fadeOut(() => {
            $(".time-game-start-text").remove();
        });
    }, 3000);

    // play song
    setPause();
    changeDevice(device);
    play_song(songid, token);
    
    
}

function storeTime() {

    if(timestamps.length == lyrics.length - lyrics_skips) return;

    // first line animation
    active_line.animate({ top: "0" }, 1000);
    active_line.fadeOut();
    active_line.remove();

    // second line animation
    second_line.animate({top: "30%", "color": "rgb(255, 255, 255, 0.8"}, 1000);
    second_line.removeClass("second-line");
    second_line.addClass("active-line");
    active_line = second_line;

    // third line animation
    third_line.animate({top: "60%", color: "rgb(255, 255, 255, 0.45)"}, 1000);
    third_line.removeClass("third-line");
    third_line.addClass("second-line");
    second_line = third_line;

    // fourth line animation
    fourth_line.animate({top: "80%"}, 1000);
    fourth_line.removeClass("fourth-line");
    fourth_line.addClass("third-line");
    third_line = fourth_line;

    // new line creation
    while(true) {

        if(lyrics.length > lyrics_count) {
            if(lyrics[lyrics_count] == "") {
                lyrics_count++;
                lyrics_skips++;
                continue;
            }
            time_game_text.append("<p class='display-4 fourth-line'>" + lyrics[lyrics_count++] + "</p>");
        }

        else 
            time_game_text.append("<p class='display-4 fourth-line'></p>");

        break;
    }
    
           
    fourth_line = $(".fourth-line");

    player.getCurrentState().then((state) => {

        if(state.position < parseInt(timestamps[timestamps.length - 1])) {
            exit_time_game();
        }

        timestamps.push("" + state.position);
    });   

}

function gameFinished() {
    
    if(timestamps.length != lyrics.length - lyrics_skips) {

        time_game_text.empty();

        time_game_text.before("<p class='display-3 time-game-start-text' style='top:10%'> There are still lyrics but the song is over, you failed :( </p>");
        $(".time-game-start-text").hide();
        $(".time-game-start-text").fadeIn();

    }

    else {

        time_game_text.empty();

        time_game_text.before("<p class='display-3 time-game-start-text' style='top:10%'> Thanks for contributing to Musikult :) </p>");
        $(".time-game-start-text").hide();
        $(".time-game-start-text").fadeIn();

        // create a string with all the timestamps
        var timestamps_string = "";
        for(let i = 0; i < timestamps.length; i++) {
            timestamps_string += "" + timestamps[i];
            if(i != timestamps.length - 1) timestamps_string += "\n";
        };

        // store data 
        /*var body = {
            "timestamps": timestamps_string,
        }
    
        var url = "http://localhost:3000/submit" + window.location.search + "&type=timestamps";
    
        var httpRequest = new XMLHttpRequest();
        httpRequest.open("POST", url, true);
        httpRequest.send(JSON.stringify(body));*/

        $.ajax({
            url: 'http://localhost:3000/submit' + window.location.search + '&type=timestamps',
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: {timestamps: timestamps_string},
        });

        setTimeout(() => { window.location.reload(); }, 5000);

    }

    $(".time-game-start-text").fadeOut(5000, exit_time_game);
        

}

function exit_time_game() {

    player.disconnect();

    $("body").css({"overflow-y": "scroll"});

    time_game.animate({ top: "100vh", "background-color": "rgb(0, 0, 0, 0.25)"}, 1000, () => {
        time_game.css("height", "0");
        time_game.hide();
        time_game_text.empty();
    });

    window.removeEventListener("keypress", keyPress, true);

    time_game_started = false;
    time_lyrics_is_open = false;

    pause();
}

function checkChanges(state) {

    if(game_finished) return;

    if(state.track_window.current_track.id == songid && state.position == 0) {
        first_change = true;
    }

    if((state.position + 1500 >= state.duration) && first_change) {
        gameFinished();
        game_finished = true;
        return;
    }

    // if song has been changed
    if(state.track_window.current_track.id != songid) {

        if(!first_change) return;
        exit_time_game();

    }

    // if song has been paused
    else if(state.paused && !song_paused) {
        
        song_paused = true;

        window.removeEventListener("keypress", keyPress, true);

        time_game_text.before("<p class='display-3 time-game-start-text' style='top:10%'> The song has been paused, play it to continue </p>");
        $(".time-game-start-text").hide();
        $(".time-game-start-text").fadeIn();

    }

    // if song has been played
    else if(!state.paused && song_paused) {
       
        song_paused = false;

        $(".time-game-start-text").fadeOut(() => {
            $(".time-game-start-text").remove();
        });

        window.addEventListener("keypress", keyPress, true);
        
    }

}

function keyPress(e) {
    if(e.keyCode == 32) storeTime();
}

// exit button 
var exit_button = $("#exit-button");

$(document).ready(function() {

    exit_button.on("mouseenter", () => {
        exit_button.animate({ top: "82%", color: "rgb(255, 255, 255, 0.5)" });
    })
    exit_button.on("mouseleave", () => {
        exit_button.animate({ top: "83%", color: "rgb(255, 255, 255, 0.25)" });
    })

    exit_button.on("click", () => {
        exit_time_game();
    })
})