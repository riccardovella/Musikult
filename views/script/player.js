

var playhead = document.getElementById('playhead'); // playhead
var timeline = document.getElementById('timeline'); // timeline
var audioplayer = document.getElementById('audioplayer');
var progress = 0;
var duration = 0;

var volume_bar = document.getElementById('volume');
var volume_progress = document.getElementById('volume-progress');

// timeline width adjusted for playhead
function getTimelineWidth() { return timeline.offsetWidth - playhead.offsetWidth; }

// status
var active = true;
var playing = false;

var shuffle = true;

var volume = 0;

var playing_track_id = 0;
var playing_artist_id = 0;


// TIMELINE FUNCTIONS //

// makes timeline clickable
audioplayer.addEventListener("click", function (event) {
  moveplayhead(event);
  progress = duration * clickPercent(event);
}, false);

audioplayer.addEventListener("mousedown", mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
  return (event.clientX - getPosition(timeline)) / getTimelineWidth();
}

// makes playhead draggable
playhead.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown() {
  onplayhead = true;
  window.addEventListener('mousemove', moveplayhead, true);
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp(event) {

  if (onplayhead == true) {
    // change current time
    moveplayhead(event);
    window.removeEventListener('mousemove', moveplayhead, true);
    progress = duration * clickPercent(event);
    seekPosition(progress);
  }
  onplayhead = false;
}

// Moves playhead as user drags
function moveplayhead(event) {
  var newMargLeft = event.clientX - getPosition(timeline);

  if (newMargLeft >= 0 && newMargLeft <= getTimelineWidth()) {
      playhead.style.marginLeft = newMargLeft + "px";
  }
  if (newMargLeft < 0) {
      playhead.style.marginLeft = "0px";
  }
  if (newMargLeft > getTimelineWidth()) {
      playhead.style.marginLeft = getTimelineWidth() + "px";
  }

}

function getPosition(el) {
  return el.getBoundingClientRect().left;
}

// sets the playerhead position to the updated progress // 
function setPosition() {

  playhead.style.marginLeft = ( progress / duration ) * getTimelineWidth() + "px";

}


// VOLUME //

volume_bar.addEventListener("click", function (event) {
  setVolume((event.clientX - getPosition(volume_bar)) * 100 / volume_bar.offsetWidth);
}, false);

function setVolume(vol) {
  
  volume = parseInt(vol);
  seekVolume(volume);
  updateVolumeProgress();

}

function updateVolumeProgress() {
  volume_progress.style.width = volume + "%";

  if(volume == 0) 
    $("#volume-button").attr("class","fas fa-volume-off fa-lg");
  else if(volume < 50)
    $("#volume-button").attr("class","fas fa-volume-down fa-lg");
  else
    $("#volume-button").attr("class","fas fa-volume-up fa-lg");
    
}


// AUDIOPLAYER FUNCTIONS //

function play() {

  if(playing) return;
  playing = true;

  $("#play-button").toggleClass("fa-play fa-pause");

}

function pause() {

  if(!playing) return;
  playing = false;

  $("#play-button").toggleClass("fa-pause fa-play");

}

function setShuffle(b) {
  if(shuffle == b) return;
  shuffle = b;

  if(shuffle)
    $("#shuffle-button").css({ color: "rgb(215, 215, 215)" }, 50);
  else
    $("#shuffle-button").css({ color: "rgb(100, 100, 100)" }, 50);
 
}


// POLLING //

function run() {

  if(!active) return;

  getCurrentState();

  setPosition();

  setTimeout(run, 1000);   

}


// REQUESTS TO THE API //

function getCurrentState() {

  var url = "https://api.spotify.com/v1/me/player?access_token=" + access_token;
  
  sendAjaxRequest("GET", url, handleResponseCurrentState);

}

function handleResponseCurrentState(e) {
  
  if (e.target.readyState == 4 && e.target.status == 200) {

    var response = JSON.parse(e.target.responseText);

    if(!response) return;
    if(response.currently_playing_type != "track") return;

    if(!playing && response.is_playing) play();
    else if(playing && !response.is_playing) pause();

    progress = response.progress_ms;

    if(volume != response.device.volume_percent) {
      volume = response.device.volume_percent;
      updateVolumeProgress();
    }

    setShuffle(response.shuffle_state);
  
    if(playing_track_id != response.item.id) {

      playing_track_id = response.item.id;
      document.getElementById("title").innerHTML = response.item.name;

      playing_artist_id = response.item.artists[0].id;
      document.getElementById("artist").innerHTML = response.item.artists[0].name;

      document.getElementById("thumbnail").src = response.item.album.images[0].url;
      document.getElementById("thumbnail").style.visibility = "visible";

      document.getElementById("karaoke-button").style.visibility = "visible";

      duration = response.item.duration_ms;

      // advise karaoke
      karaokeUpdateSong();

    }

    //update karaoke
    karaokeUpdate();
  }
}

function setPlay() {

  var url = "https://api.spotify.com/v1/me/player/play?access_token=" + access_token;  
  sendAjaxRequest("PUT", url);

}

function setPause() {

  var url = "https://api.spotify.com/v1/me/player/pause?access_token=" + access_token;  
  sendAjaxRequest("PUT", url);

}

function setPrevious() {

  var url = "https://api.spotify.com/v1/me/player/previous?access_token=" + access_token; 
  sendAjaxRequest("POST", url);
  
}

function setNext() {

  var url = "https://api.spotify.com/v1/me/player/next?access_token=" + access_token;  
  sendAjaxRequest("POST", url);
  
}

function seekPosition(position) {

  position = parseInt(position);

  var url = "https://api.spotify.com/v1/me/player/seek?position_ms=" + position + "&access_token=" + access_token;
  sendAjaxRequest("PUT", url);

}

function getVolume() {

  var url = "https://api.spotify.com/v1/me/player/devices?access_token=" + access_token;  
  sendAjaxRequest("GET", url, handleResponseVolume);

}

function handleResponseVolume(e) {

  if(e.target.readyState == 4 && e.target.status == 200) {

    var devices = JSON.parse(e.target.responseText).devices;

    devices.forEach(device => {
      if(device.is_active)
        if(volume != device.volume_percent) {
          volume = device.volume_percent;
          updateVolumeProgress();
        }
    });
  }
}

function seekVolume(vol) {

  var url = "https://api.spotify.com/v1/me/player/volume?volume_percent=" + vol + "&access_token=" + access_token;  
  sendAjaxRequest("PUT", url);

}

function toggleShuffle() {

  shuffle = !shuffle;

  const ajaxUrl = "https://api.spotify.com/v1/me/player/shuffle?state=" + shuffle + "&access_token=" + access_token;  
  sendAjaxRequest("PUT", ajaxUrl);

}

function changeDevice(device_id) {
  
  var body = {
    "device_ids": [ device_id ]
  }

  const ajaxUrl = "https://api.spotify.com/v1/me/player?access_token=" + access_token;

  sendAjaxRequest("PUT", ajaxUrl, () => {}, false, body);

}


//ANIMATIONS AND CLICKS//

$(document).ready(function() {

  // play button
$("#play-button").mouseenter(function() {
  $(this).animate({ color: "rgb(110, 110, 110)" }, 110);
})

$("#play-button").mouseleave(function() {
  $(this).animate({ color: "rgb(224, 224, 224)" }, 110);
})

$("#play-button").on("click", function() {
  if(playing)
    setPause();
  else 
    setPlay();
})

  // backward button
$("#backward-button").mouseenter(function() {
  $(this).animate({ color: "rgb(110, 110, 110)" }, 110);
})

$("#backward-button").mouseleave(function() {
  $(this).animate({ color: "rgb(224, 224, 224)" }, 110);
})

$("#backward-button").on("click", function() {
  setPrevious();
})

  // forward button
$("#forward-button").mouseenter(function() {
  $(this).animate({ color: "rgb(110, 110, 110)" }, 110);
})

$("#forward-button").mouseleave(function() {
  $(this).animate({ color: "rgb(224, 224, 224)" }, 110);
})

$("#forward-button").on("click", function() {
  setNext();
})

  // shuffle button
$("#shuffle-button").mouseenter(function() {
  $(this).animate({ color: "rgb(150, 150, 150)" }, 50);
})

$("#shuffle-button").mouseleave(function() {
  if(shuffle)
    $(this).animate({ color: "rgb(215, 215, 215)" }, 50);
  else
    $(this).animate({ color: "rgb(100, 100, 100)" }, 50);
})

$("#shuffle-button").on("click", function() {
  if(!shuffle)
    $(this).animate({ color: "rgb(215, 215, 215)" }, 50);
  else
    $(this).animate({ color: "rgb(100, 100, 100)" }, 50);
  
  toggleShuffle();
})

  // title
$("#title").mouseenter(function() {
  $(this).css({ "text-decoration": "underline" });
})

$("#title").mouseleave(function() {
  $(this).css({ "text-decoration": "none" });
})

$("#title").click(function() {
  //redirect('/songs', 'id=' + playing_track_id + "s");
})

  // artist
$("#artist").mouseenter(function() {
  $(this).css({ "text-decoration": "underline" });
  $(this).css({ "color": "rgb(255, 255, 255, 0.8);" });
})

$("#artist").mouseleave(function() {
  $(this).css({ "text-decoration": "none" });
  $(this).css({ "color": "rgb(255, 255, 255, 0.6);" });
})

$("#artist").click(function() {
  redirect('/artists', 'id=' + playing_artist_id + "s");
})

 // volume 
 $("#volume-button").on("click", function() {
  if(volume != 0) setVolume(0);
  else setVolume(100);
})

  // karaoke button
$("#thumbnail").mouseenter(function() {
  $("#karaoke-button").css({color: "rgb(180, 180, 180, 0.9)"});
  animate_karaoke_button = true;
  animateKaraokeButton();
})

$("#thumbnail").mouseleave(function() {  
  animate_karaoke_button = false;
  $("#karaoke-button").stop();
  $("#karaoke-button").animate({top: "14px"}, 200);
  $("#karaoke-button").css({color: "rgb(255, 255, 255, 0.6)"});
})

$("#thumbnail").click(function() {
  if(karaoke_active) {
    hideKaraokeMode()
  }
  else {
    showKaraokeMode()
  }
})

});

var animate_karaoke_button = false;
function animateKaraokeButton() {
  if(!animate_karaoke_button) return;
  $("#karaoke-button").animate({top: "-30px"}, 500, () => {
    $("#karaoke-button").animate({top: "-20px"}, 500, () => {
      animateKaraokeButton();
    });
  }); 
}


// STARTS THE CYCLE //

$(document).ready(function() {

  run();

});