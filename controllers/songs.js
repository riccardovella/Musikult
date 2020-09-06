const express = require("express");
const querystring = require("querystring");

const genius = require("../utilities/genius.js");
const spotify = require("../utilities/spotify.js");
const db = require("../utilities/db.js");
const errorHandler = require("../utilities/errorHandler.js");

const router = express.Router();

router.get('/', function(req, res) {

    getData(req, res);
 
});


const getData = async function (req, res) {

    const access_token  = req.query.access_token;
    const refresh_token = req.query.refresh_token;
    const id            = req.query.id;             // this is the song id

    try {

        // Genius and database data will be used anyway
        const songInfo      = await genius.getSongInfo(id);
        const lyricsObj     = await db.findLyrics(id, songInfo.title, songInfo.primary_artist.name);

        // if the user is logged spotify data is retrieved
        if(access_token) {

            // spotify data
            const spotifyId     = await genius.geniusToSpotifySongId(access_token, id);
            const isInLibrary   = await spotify.isInLibrary(access_token, spotifyId);

            res.render('song', {
                info: songInfo,
                lyrics: lyricsObj.lyrics,
                timestamps: lyricsObj.timestamps,
                addToLibrary: isInLibrary,
                spotifyId: spotifyId,
                isLogged: true
            })

        }

        // if the user is not logged no other data is retrieved
        else {

            res.render('song', {
                info: songInfo,
                lyrics: lyricsObj.lyrics,
                timestamps: lyricsObj.timestamps,
                addToLibrary: null,
                spotifyId: null,
                isLogged: false
            })

        }
    }

    catch(error) {

        // if the error is from spotify and the code is 401 it means that the access token is expired
        // in this case a new one is retrieved and the page is reloaded
        if(error.source == 'spotify' && error.statusCode == 401) {

            spotify.reAuthorize(refresh_token, (new_access_token) => {
                res.redirect('/songs' + '?' +
                    querystring.stringify({
                        access_token: new_access_token,
                        refresh_token: refresh_token,
                        id: id
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

module.exports = router;