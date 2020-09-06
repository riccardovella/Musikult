const express = require("express");
const path = require('path');
const querystring = require("querystring");

const ws = require('../utilities/ws.js');
const spotify = require('../utilities/spotify');

const router = express.Router();

const projectPath = path.resolve('.');

router.get("/", function(req, res) {

	getData(req, res);

});

const getData = async function (req, res) {

	const access_token = req.query.access_token;
	const refresh_token = req.query.refresh_token;

	try {

		// user has not logged in, load basic home page
		if(!access_token) 
		res.render('home', { isLogged: false });

		//user has logged in, load personal home page
		else {

			const topArtistsPromise = spotify.getTopArtists(access_token);
			const topTracksPromise 	= spotify.getTopTracks(access_token);
			const userInfosPromise 	= spotify.getUserInformations(access_token);
			const releasesPromise 	= spotify.getNewReleases(access_token); 

			const [topArtists, topTracks, userInfos, releases] = await Promise.all([
				topArtistsPromise, topTracksPromise, userInfosPromise, releasesPromise
			])

			res.render('home', { 
				isLogged: true, 
				artist: topArtists,
				tracks: topTracks,
				inf : userInfos,
				newReleases: releases
			});
	
		}

	}

	catch(error) {

		// if the error is from spotify and the code is 401 it means that the access token is expired
        // in this case a new one is retrieved and the page is reloaded
        if(error.source == 'spotify' && error.statusCode == 401) {

            spotify.reAuthorize(refresh_token, (new_access_token) => {
                res.redirect('/?' +
                    querystring.stringify({
                        access_token: new_access_token,
                        refresh_token: refresh_token,
                    })
                )
            })

        }

        // the error can not be handled properly so its displayed and a 500: Server Internal Error is sent
        else {
            errorHandler.display(error);
            res.sendStatus(500);
        }

	}

	

}

router.use("/spotifyAuth", require("./spotifyAuth"));
router.use("/songs", require("./songs"));
router.use("/artists", require("./artists"));
router.use("/submit", require("./submit"));

router.use("/api", require("./api/api"));

module.exports = router;
