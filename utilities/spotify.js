
const request = require('request');
const querystring = require('querystring');

require('dotenv').config();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;


function getRelatedArtists(access_token, refresh_token, id, func) {

    var options = {
        url: "https://api.spotify.com/v1/artists/" + id + "/related-artists",
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            func(JSON.parse(body).artists);
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getRelatedArtists(new_access_token, refresh_token, id, func);
            })
        }

        else {
            printError(response);
            func(null);
        }
    });
}

function isInLibrary(access_token, refresh_token, id, func) {

    var options = {
        url: "https://api.spotify.com/v1/me/tracks/contains?ids=" + id,
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
        
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            func(JSON.parse(body));
        }
    
        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                isInLibrary(new_access_token, refresh_token, id, func);
            })
        }

        else {
            printError(response);
            func(null);
        }
    });

}

function getBestSong(access_token, refresh_token, id, func) {

    var options = {
        url: "https://api.spotify.com/v1/artists/" + id + "/top-tracks?country=US",
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {

            var tracks = JSON.parse(body).tracks;
            for(var i = 0; i < tracks.length; i++) {
                if(tracks[i].artists[0].id == id) {
                    func(tracks[i].name, tracks[i].artists[0].name);
                    break;
                }
            };
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getBestSong(new_access_token, refresh_token, id, func);
            })
        }

        else {
            printError(response);
            func(null);
        }
    });
    
}

function searchArtist(access_token, refresh_token, artist, func, song = null) {

    var options = {
        url: "https://api.spotify.com/v1/search?type=artist&q=" + artist,
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            if(JSON.parse(body).artists.items[0])
                func(JSON.parse(body).artists.items[0].id);
            else 
                func(null);
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                searchArtist(new_access_token, refresh_token, artist, func, song);
            })
        }

        else {
            printError(response);
            func(null);
        }
    });

}

function searchSong(access_token, refresh_token, song, func, artist = null) {

    var options = {
        url: "https://api.spotify.com/v1/search?type=track&" + querystring.stringify({ q: song + " " + artist }),
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body).tracks.items[0];
            if(info) {
                if(!artist || toString(artist).toLowerCase == toString(info.artists[0].name).toLowerCase)
                    func(info.id);
                else 
                    func(null);
            }
            else {
                func(null);
            }
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                searchSong(new_access_token, refresh_token, song, func, artist);
            })
        }

        else {
            printError(response);
            func(null);
        }
    });

}

// get user's top tracks
function getTopTracks(access_token, refresh_token, func){
    var options = {
        url: "https://api.spotify.com/v1/me/top/tracks",
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var b = JSON.parse(body);
            if(b.total !=0){
                var x = tracksFilter(JSON.parse(body));
                func(x);
            }
            else{
                func(null);
            }
            
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getTopTracks(new_access_token, refresh_token, func);
            })
        }

        else {
            printError(response);
            func(null);
        } 
    });
};

// Get user's top artists
function getTopArtists(access_token, refresh_token, func){
    var options = {
        url: "https://api.spotify.com/v1/me/top/artists",
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    request.get(options, function callback(error, response, body) {		

        if (!error && response.statusCode == 200) {
            var a = JSON.parse(body)
            if(a.total != 0) {              // if there are no artists it returns null
                var y = artistFilter(JSON.parse(body));
                func(y);
            }
            else {
                func(null);
            }
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getTopArtists(new_access_token, refresh_token, func);
            })
        }

        else {
            printError(response);
            func(null);
        } 
    });
};
    
function artistFilter(info) {
    var response;
    var x = {
        artisti : []
    }
    for(var i=0;i<6;i++) {
        response = info.items[i];

        x.artisti.push({
            id : response.id,
            name : response.name,
            genere : response.genres,
            image : response.images[1]

        });
    
    }
    return x;

}

function tracksFilter(info1){
    var response1 ;
    var y ={
        tracks : []
    }
    for(var j =0 ; j<6;j++){
        response1 = info1.items[j];

        y.tracks.push({
            id : response1.album.id,
            image : response1.album.images[1].url,
            name : response1.name,
            idartist : response1.artists[0].id,
            nameartist : response1.artists[0].name
        });
    }
    return y
}

// get user's account informations
// used to get user's profile image and name
function getUserInformations(access_token, refresh_token, func) {

    var options = {
        url: "https://api.spotify.com/v1/me",
        headers : {
            'Authorization': 'Bearer ' + access_token
        }
    };
    
    request.get(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var z = informationFilter(JSON.parse(body));
            func(z);
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getUserInformations(new_access_token, refresh_token, func);
            })
        }

        else {
            printError(response);
            func(null);
        }   
    });
}

function informationFilter(info2){ 
    var z ={
        information: []
    }

    var image = null;
    if(info2.images[0]) image = info2.images[0].url; 

    z.information.push({
        name : info2.display_name,
        image : image
    });
    return z;
    
}
function isFollowed(access_token, refresh_token, id, func) {

    var options = {
        url: "https://api.spotify.com/v1/me/following/contains?type=artist&ids=" + id,
        headers : {
            'Authorization': 'Bearer ' + access_token,
        }
    };
    request.get(options, function callback(error, response, body) {		
        if (!error && response.statusCode == 200) {
            func(JSON.parse(body));
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                isFollowed(new_access_token, refresh_token, id, func);
            })
        }

        else {
            printError(response);
            func(null);
        } 
    });
}

// get spotify's new releases (same for every account)
function getNewReleases(access_token, refresh_token, func) {

    var options = {
        url: "https://api.spotify.com/v1/browse/new-releases?country=US",
        headers : {
            'Authorization': 'Bearer ' + access_token,
        }
    };
    request.get(options, function callback(error, response, body) {	

        if (!error && response.statusCode == 200) {
            var singles = [];
            var items = JSON.parse(body).albums.items;
            for(var i = 0; i < items.length; i++) {
                if(items[i].album_type == 'single') {   // return only singles 
                    singles.push(items[i]);
                    if(singles.length >= 5) break; 
                }  
            }
            func(singles);
        }

        else if(response.statusCode == 401) {
            reAuthorize(refresh_token, (new_access_token) => {
                getNewReleases(new_access_token, refresh_token, func);
            })
        }

        else {
            printError(response);
            func(null);
        } 
    });    
}


// UTILITY FUNCTIONS

function reAuthorize(refresh_token, callback) {

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
		form: {
			client_id: spotify_client_id,
			client_secret: spotify_client_secret,
            grant_type: 'refresh_token',
            refresh_token: refresh_token
		},
		json:true
	}
  
	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
  
		  	var access_token = body.access_token;
		  	callback(access_token);
			
		} else {
			  printError(response);
		}
	});
}

function printError(response) {
    console.log("[SPOTIFY ERROR]: " + response.statusCode + " " + response.statusMessage 
    + "\nDate: " + response.headers.date + "\nhref: " + response.href + '\n');
}

// EXPORTS
exports.getRelatedArtists = getRelatedArtists;
exports.isInLibrary = isInLibrary;
exports.getBestSong = getBestSong;
exports.getTopTracks =  getTopTracks;
exports.getTopArtists = getTopArtists;
exports.searchArtist = searchArtist;
exports.searchSong = searchSong;
exports.getUserInformations = getUserInformations;
exports.isFollowed = isFollowed;
exports.getNewReleases = getNewReleases;