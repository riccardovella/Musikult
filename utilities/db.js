// musikult database has one table which contains lyrics from songs
/*
   _____________________________________
  |                                     |
  |               lyrics                |
  |_____________________________________|
  |       |              |              |
  |  id   |    text      |  timestamps  |
  |_______|______________|______________|
                           
*/


const mysql = require("mysql");

const happi = require("./happi.js");

require('dotenv').config();

const password  = process.env.DB_PASSWORD;
const DBNAME    = "musikultrc"; 

// create connection with the database musikult
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: password,
});

// establish connection
con.connect(function(err) {

    if (err) throw err;
    log("Connected to MySQL!\n");

    // create database if not created
    con.query("CREATE DATABASE " + DBNAME, function(err, result) {
        if (err && err.errno == 1007) log("Database found");
        else if (err) throw err;
        else log("Database created");            
    });

    // open database
    con.query("USE " + DBNAME, function(err, result) {
        if(err) throw err;
    });

    // create table if not created
    con.query("CREATE TABLE lyrics (id int NOT NULL, text varchar(10000), timestamps varchar(1000), PRIMARY KEY (id))", function(err, result) {
        if (err && err.errno == 1050) log("Table found\n");
        else if (err) throw err;
        else log("Table created\n");         
    });
    
});


function insertLyrics(id,text) {

    var value = "";
    // this part swaps "'" with "§" to avoid errors and basic SQL injection
    for(var i = 0; i < text.length; i++) {    
        if(text[i] == "'") 
            value += '§';
        else 
            value += text[i];
    };

    var sql = "INSERT INTO lyrics (id, text) VALUES (" + id + ", '" + value + "')";
    con.query(sql, function (err, result) {
        if (err) {
            log(err.message);
            return err;
        }

        console.log("________________________________");
        log("Inserted 1 record");
        console.log("________________________________\n");

    });
    
}

exports.insertLyrics = function(id, text) { insertLyrics(id, text); }

exports.findLyrics = function(id, song_name, artist_name) {

    return new Promise((resolve, reject) => {

        //log("Requesting lyrics for the song " + song_name + " by " + artist_name + "; id: " + id + "\n");

        // get lyrics of the song with id :id
        var sql = "SELECT text, timestamps FROM lyrics WHERE id = " + id;
        con.query(sql, function (err, result) {
            if (err) 
            log(err.message);      

            //id is unique so there is a max of one result
            //if lyrics are in the database, retrieve them
            if(result[0]) {
                //log("Found a result in database\n");
                filterLyrics(result[0].text, function(lyrics) {
                    if(result[0].timestamps) {
                        filterTimestamps(result[0].timestamps, function(timestamps) {
                            resolve({ lyrics: lyrics, timestamps: timestamps });
                        })
                    }
                    else {
                        resolve({ lyrics: lyrics, timestamps: null });
                    }
                })
            }

            // if nothing is found
            else {
                //log("No result found in database");
                //log("Requesting lyrics to Happi\n");

                // makes a lyrics request to happi
                happi.getSongInfo(song_name, artist_name, function(lyrics) {

                    // if lyrics are found
                    if(lyrics) {

                        //log("Lyrics found");
                        //log("Inserting data in the database\n");

                        // inserts lyrics in the database to make minimum amount of api calls
                        insertLyrics(id, lyrics);
                        //log("Lyrics inserted in database\n");

                        filterLyrics(lyrics, function(filtered) {
                            resolve({ lyrics: filtered, timestmaps: null });
                        });
                    
                    }
                    else {
                        //log("Lyrics not found\n");
                        resolve({ lyrics: null, timestamps: null });
                    }   
                });
            }
        });

    })
}

exports.insertTimestamps = function(id, timestamps) {

    var sql = "UPDATE lyrics SET timestamps='" + timestamps + "' WHERE id=" + id;
    con.query(sql, function (err, result) {
        if (err) {
            log(err.message);
        }

        else {
            console.log("________________________________");
            log("Inserted timestamps");
            console.log("________________________________\n");
        }
    });

}

exports.insertLyricsAPI = function(id, text, callback) {

    var value = "";
    // this part swaps "'" with "§" to avoid errors and basic SQL injection
    for(var i = 0; i < text.length; i++) {    
        if(text[i] == "'") 
            value += '§';
        else 
            value += text[i];
    };

    var sql = "INSERT INTO lyrics (id, text) VALUES (" + id + ", '" + value + "')";
    con.query(sql, function (err, result) {

        if (err) {
            callback(err);
        }

        else {

            console.log("--------------------------------");
            log("Inserted record with ID: " + id);
            console.log("------------------------------\n");

            callback(null);

        }

    });
    
}

exports.deleteLyrics = function(id, callback) {

    // delete lyrics of the song with id :id
    var sql = "DELETE FROM lyrics WHERE id = " + id;
    con.query(sql, function (err, result) {

        if (err) {
            log(err.message);
        }

        else {

            console.log("--------------------------------")
            log("Deleted record with ID: " + id);
            console.log("------------------------------\n");

            callback(null);

        }

    });

}

exports.getLyrics = function(id, callback) {

    // get lyrics of the song with id :id
    var sql = "SELECT text, timestamps FROM lyrics WHERE id = " + id;
    con.query(sql, function (err, result) {
        if (err) {
            log(err.message);
        }

        // if found
        if(result[0]) {
            filterLyrics(result[0].text, function(lyrics) {
                if(result[0].timestamps) {
                    filterTimestamps(result[0].timestamps, function(timestamps) {
                        callback(lyrics, timestamps);
                    })
                }
                else {
                    callback(lyrics, null);
                }
            })
        }

        // if nothing is found
        else {
            callback(null, null);
        }
    });
}

// swaps again all the '§' symbols with "'"
function filterLyrics(string, func) {

    var filtered = [""];
    var index = 0;
    for(var i = 0; i < string.length; i++) {
        if(string[i] == '\n') filtered[++index] = "";
        else if(string[i] == '§') filtered[index] += "'";
        else filtered[index] += string[i];
    }

    func(filtered);
}

// puts all the timestamps inside an array
function filterTimestamps(string, func) {

    var timestamps = [""];
    var index = 0;
    for(var i = 0; i < string.length; i++) {
        if(string[i] == '\n') timestamps[++index] = "";
        else timestamps[index] += string[i];
    }

    func(timestamps);
}

function log(msg) {
    console.log("[DATABASE]: " + msg);
}