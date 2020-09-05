const express = require("express");
const path = require('path');

const ws = require('../utilities/ws.js');
const spotify = require('../utilities/spotify');

const router = express.Router();

const projectPath = path.resolve('.');

router.get("/", function(req,res) {

	var access_token = req.query.access_token;
	var refresh_token = req.query.refresh_token;

	// user has not logged in, load basic home page
	if(!access_token) 
		res.render('home', { isLogged: false });
	
	//user has logged in, load personal home page
	else {
		spotify.getTopArtists(access_token, refresh_token, function(topArtists) {
			spotify.getTopTracks(access_token, refresh_token, function(topTracks) {
				spotify.getUserInformations(access_token, refresh_token, function(userInfos) {
					spotify.getNewReleases(access_token, refresh_token, function(releases) {
						res.render('home', { 
							isLogged: true, 
							artist: topArtists,
							tracks: topTracks,
							inf : userInfos,
							newReleases: releases
						});
					});
				});
			});
		});
	}
});

router.use("/spotifyAuth", require("./spotifyAuth"));
router.use("/songs", require("./songs"));
router.use("/artists", require("./artists"));
router.use("/submit", require("./submit"));

router.use("/api", require("./api/api"));

module.exports = router;
