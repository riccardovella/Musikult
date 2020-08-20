const express = require("express");
const genius = require("../utilities/genius.js");
const spotify = require("../utilities/spotify.js");

var router = express.Router();

router.get('/', function(req, res) {

    var token = req.query.access_token;
    var id = req.query.id;

    // id could be either a genius id or a spotify id;
    // if is a spotify id its last character is an 's'
    // if it's so, it is removed 
    var ids = id.slice(0,id.length -1);

    if(id.charAt(id.length - 1) == 's') { //if id is from spotify converts it
        
        id = id.substring(0, id.length-1);
        
        genius.spotifyToGeniusArtistId(token, id, function(geniusId) {
            genius.getArtistInfo(geniusId, function(artistInfo) {
                if(token) {
                    spotify.isFollowed(token,ids,function(isFollowed) {
                        spotify.getRelatedArtists(token, id, function(relatedArtists) {
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
            if(token) {
                genius.geniusToSpotifyArtistId(token, id, function(spotifyId) {
                    spotify.getRelatedArtists(token, spotifyId, function(relatedArtists) {
                        spotify.isFollowed(token, spotifyId, function(obj3) {
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