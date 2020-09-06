const express = require("express");
const genius = require("../utilities/genius.js");
const spotify = require("../utilities/spotify.js");
const errorHandler = require("../utilities/errorHandler.js");

var router = express.Router();

router.get('/', function(req, res) {

    getData(req, res);

});


const getData = async function (req, res) {

    const access_token  = req.query.access_token;
    const refresh_token = req.query.refresh_token;
    const id            = req.query.id;

    var geniusId;
    var spotifyId;

    try {

        if(access_token) {

            if(id.charAt(id.length - 1) == 's') { //if id is from spotify
            
                spotifyId = id.substring(0, id.length-1);
                geniusId = await genius.spotifyToGeniusArtistId(access_token, spotifyId);
        
            }
        
            else {
    
                geniusId = id;
                spotifyId = await genius.geniusToSpotifyArtistId(access_token, geniusId);
    
            }
    
            const artistInfoPromise        = genius.getArtistInfo(geniusId);
            const isFollowedPromise        = spotify.isFollowed(access_token, spotifyId);
            const relatedArtistsPromise    = spotify.getRelatedArtists(access_token, spotifyId);

            const [artistInfo, isFollowed, relatedArtists] = await Promise.all([
                artistInfoPromise, isFollowedPromise, relatedArtistsPromise
            ]);
    
            res.render('artist', {
                info:               artistInfo, 
                related_artists:    relatedArtists,
                follow:             isFollowed,
                spotifyId :         spotifyId,
                isLogged:           true
            });
    
        }
    
        else {                                    // if there is no access token the id CANNOT be a spotify id
    
            geniusId = id;
    
            const artistInfo        = await genius.getArtistInfo(geniusId);
    
            res.render('artist', {
                info:               artistInfo, 
                related_artists:    null,
                follow:             null,
                spotifyId :         null,
                isLogged:           false
            });
    
        }

    }

    catch(error) {

        // if the error is from spotify and the code is 401 it means that the access token is expired
        // in this case a new one is retrieved and the page is reloaded
        if(error.source == 'spotify' && error.statusCode == 401) {

            spotify.reAuthorize(refresh_token, (new_access_token) => {
                res.redirect('/artists' + '?' +
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