const express = require("express");
const path = require('path');

const ws = require('../utilities/ws.js');
const spotify = require('../utilities/spotify');

const router = express.Router();

const projectPath = path.resolve('.');

router.get("/", function(req,res) {

	var token = req.query.access_token;

	// user has not logged in, load basic home page
	if(!token) 
		res.render('home', { isLogged: false });
	
	//user has logged in, load personal home page
	else {
		spotify.getTopArtists(token,function(topArtists) {
			spotify.getTopTracks(token,function(topTracks) {
				spotify.getUserInformations(token, function(userInfos) {
					spotify.getNewReleases(token, function(releases) {
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
