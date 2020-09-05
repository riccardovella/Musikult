const express = require("express");
const genius = require("../utilities/genius.js");
const spotify = require("../utilities/spotify.js");

var router = express.Router();

router.get('/', function(req, res) {

    var access_token = req.query.access_token;
    var refresh_token = req.query.refresh_token;
    var id = req.query.id;

    // id could be either a genius id or a spotify id;
    // if is a spotify id its last character is an 's'
    // if it's so, it is removed 
    var ids = id.slice(0,id.length -1);

    if(id.charAt(id.length - 1) == 's') { //if id is from spotify converts it
        
        id = id.substring(0, id.length-1);
        
        genius.spotifyToGeniusArtistId(access_token, refresh_token, id, function(geniusId) {
            genius.getArtistInfo(geniusId, function(artistInfo) {
                if(access_token) {
                    spotify.isFollowed(access_token, refresh_token, ids, function(isFollowed) {
                        spotify.getRelatedArtists(access_token, refresh_token, id, function(relatedArtists) {
                            res.render('artist', {
                                info: artistInfo, 
                                related_artists: relatedArtists,
                                follow: isFollowed,
                                id : ids,
                                isLogged: true
                            });
                        });
                    });
                }
                else res.render('artist', {
                    info: artistInfo, 
                    related_artists: null,
                    isLogged: false
                });
            }); 
        });
    }

    else { //if id is from genius 

        genius.getArtistInfo(id, function(artistInfo) {
            if(access_token) {
                genius.geniusToSpotifyArtistId(access_token, refresh_token, id, function(spotifyId) {
                    spotify.getRelatedArtists(access_token, refresh_token, spotifyId, function(relatedArtists) {
                        spotify.isFollowed(access_token, refresh_token, spotifyId, function(obj3) {
                            res.render('artist', {
                                info: artistInfo, 
                                related_artists: relatedArtists, 
                                follow: obj3, 
                                id: spotifyId,
                                isLogged: true
                            });
                        });
                    });
                })
            }
            else res.render('artist', {
                info: artistInfo, 
                related_artists: null, 
                follow: null,
                isLogged: false
            });
        });
    }
});

module.exports = router;