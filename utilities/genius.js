const querystring = require('querystring');
const request = require('request');
const spotify = require('./spotify');

require('dotenv').config();

const access_token = process.env.GENIUS_ACCESS_TOKEN;

const API = "https://api.genius.com";

// Genius getter for a specific song
exports.getSongInfo = function(id, func) {

	var options = {
		url: API + "/songs/" + id + "?text_format=plain",    /* https://api.genius.com/songs/:id */
		headers: {
			'Authorization' : 'Bearer ' + access_token
		}
	};

	// request to genius API
	request(options, function callback(error, response, body) {

		if (!error && response.statusCode == 200) {
			descriptionCleaning(JSON.parse(body).response.song, func);
		}

		else 
			console.log(error);
	});

};

// Genius getter for a specific artist
exports.getArtistInfo = function(id, func) {

	var options = {
		url: API + "/artists/" + id + "?text_format=plain",  /* https://api.genius.com/artists/:id */
		headers: {
			'Authorization' : 'Bearer ' + access_token
		}
	};

	//request to genius API to get artist informations
	request(options, function callback(error, response, body) {

		if (!error && response.statusCode == 200) {
			descriptionCleaning(JSON.parse(body).response.artist, function(artist_info) {
				getArtistSongs(id, function(songs_info) {
					func({ artist: artist_info, songs: songs_info });
				})
			});
		}

		else 
			console.log(error);
	});

}

// Genius getter for a specific artist's popular songs
getArtistSongs = function(id, func) {

	var options = {						// https://api.genius.com/songs/:id/songs 
		url: API + "/artists/" + id + "/songs?sort=popularity&per_page=50", 
		headers: {
			'Authorization' : 'Bearer ' + access_token
		}
	};

	// request to genius API
	request(options, function callback(error, response, body) {

		if (!error && response.statusCode == 200) {
			
			var new_songs = [];
			var index = 0;
			var songs = JSON.parse(body).response.songs;

			for(var i = 0; i < songs.length; i++) {
				if(songs[i].primary_artist.id == id) {
					new_songs.push(songs[i]);
					index++;
				}
				if(index == 10) {
					break;
				}
			}

			func(new_songs);

		}

		else 
			console.log(error);
	});
};

// This function cleans the result of the API call as Genius returns a description of the track
// that is not easy to use in our scope
function descriptionCleaning(info, func) {

	if(info.description.plain != '?') {
		info.description = filterDescription(info.description.plain);
	}

	else {
		info.description = ["No description available"]
	}

	func(info);
}

// Puts the cleaned description in a list to be used in a easier way
function filterDescription(string) {

    var filtered = [""];
    var index = 0;
    for(var i = 0; i < string.length; i++) {
        if(string[i] == '\n') filtered[++index] = "";
        else filtered[index] += string[i];
    }

    return filtered;
}

//Genius search
exports.geniusSearch = function(searchquery, func) {

    var options = {								/* https://api.genius.com/search?q=:query */
        url: API + "/search?" + querystring.stringify({ q: searchquery }), 
        headers: {
            'Authorization': 'Bearer ' + access_token
         }
	};

	//makes the request to Genius Api to obtain the research data
    request(options, function callback(error, response, body) {		

		if (!error && response.statusCode == 200) {
            var g = geniusFilter(JSON.parse(body));
            func(g);
        }
		
		else 
			console.log(error);

    });  
};

//This function filters data coming from Genius Api into a lighter JSON containing essential info
function geniusFilter(info) {					    //info is Genius JSON

	var x = {                               				//x is the result
		songs: [],
		artists: []
	}
	
	var hit;
	var ids = [];
	for(i = 0; i < info.response.hits.length; i++) {

		hit = info.response.hits[i];						

		x.songs.push({										
			name: hit.result.title,
			id: hit.result.id,
			artist: hit.result.primary_artist.name,
			photo: hit.result.song_art_image_thumbnail_url
		});

		var artist = {										//pushes artist only if it has not been 	
			name: hit.result.primary_artist.name,			//pushed yet
			id: hit.result.primary_artist.id,
			photo: hit.result.primary_artist.image_url
		};
		
		occ = false;
		if(!ids.includes(artist.id)) {
			x.artists.push(artist);
			ids.push(artist.id);
		}
	}
	return x;

}

/******************************************************************************/
/*                               ID CONVERTERS                                */
/******************************************************************************/

// To convert ids we have to search the best artist song in the genius search engine and 
// retrive the informations about the artist 
exports.spotifyToGeniusArtistId = function(token, id, func) {

	spotify.getBestSong(token, id, function(song_name, artist_name) {

		// removes everything that is after the '(' symbol in the song title
		// this is used to remove featurings and unnecessary parts to the title of the song
		// because those parts could cause the search to fail
		for(let i = 5; i < song_name.length; i++) {
			if(song_name[i] == "(" || song_name[i] == "-") {
				song_name = song_name.slice(0,i)
			}
		}
		
		var options = {								/* https://api.genius.com/search?q=:query */
			url: API + "/search?" + querystring.stringify({ q: song_name + " " + artist_name }), 
			headers: {
				'Authorization': 'Bearer ' + access_token
			 }
		};
	
		//makes the request to Genius Api to obtain the research data
		request(options, function callback(error, response, body) {
			
			if (!error && response.statusCode == 200) {
				var new_id = JSON.parse(body).response.hits[0].result.primary_artist.id;
				func(new_id);
			}
			
			else 
				console.log(error);
	
		});  
	});
}

// To convert artist ids from genius we just search for the artist in the spotify search engine
exports.geniusToSpotifyArtistId = function(token, id, func) {

	var options = {
		url: API + "/artists/" + id,  /* https://api.genius.com/artists/:id */
		headers: {
			'Authorization' : 'Bearer ' + access_token
		}
	};

	//request to genius API to get artist informations
	request(options, function callback(error, response, body) {

		if (!error && response.statusCode == 200) {
			
			spotify.searchArtist(token, JSON.parse(body).response.artist.name, function(ids) {
				func(ids);
			});

		}

		else 
			console.log(error);
	});
	
}

// to convert songs we search for the song with the spotify search and retrieve first result
exports.geniusToSpotifySongId = function(token, id, func) {

	var options = {
		url: API + "/songs/" + id,  /* https://api.genius.com/songs/:id */
		headers: {
			'Authorization' : 'Bearer ' + access_token
		}
	};

	//request to genius API to get song informations
	request(options, function callback(error, response, body) {

		if (!error && response.statusCode == 200) {
			
			spotify.searchSong(token, JSON.parse(body).response.song.title, function(ids) {
				func(ids);
			}, JSON.parse(body).response.song.primary_artist.name);

		}

		else 
			console.log(error);
	});
	
}
