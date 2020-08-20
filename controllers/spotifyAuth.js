//  This router handles spotify authentication process and redirects to index

const express = require("express");
const request = require("request");
const querystring = require("querystring");

require('dotenv').config();

const router = express.Router();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// it's called when user is authenticating
// redirects to spotify oAuth
router.get('/', function(req, res) {
  
	// requests authorization
	var scope = 'user-read-private user-read-email user-top-read user-follow-read user-follow-modify user-library-read user-library-modify user-modify-playback-state streaming user-read-playback-state';
	res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
		response_type: 'code',
		client_id: spotify_client_id,
		scope: scope,
		redirect_uri: "http://localhost:3000/spotifyAuth/callback"	// where it will be redirected after
																	// spotify authentication
	}));
});

router.get('/callback', function(req, res) {

	// requests refresh and access tokens

	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			code: req.query.code,  // code received from spotify
			redirect_uri: "http://localhost:3000/spotifyAuth/callback", // has to be the same as before
			client_id: spotify_client_id,
			client_secret: spotify_client_secret,
			grant_type: 'authorization_code'
		},
		json:true
	}
  
	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
  
		  	var access_token = body.access_token;
			//refresh_token = body.refresh_token;
  
		  	// redirects to index and pass the token to the browser to make requests from there
		  	res.redirect('/?' +
			querystring.stringify({
			  	access_token: access_token,
			  	//refresh_token: refresh_token
			}));
			
		} else {
			  res.redirect('/');
		}
	});
});

module.exports = router;