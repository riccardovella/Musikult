const request = require('request');
const querystring = require('querystring');
const happi = require('./utilities/happi');
const readline = require('readline-sync');

require('dotenv').config();

const API = "http://localhost:" + process.env.SERVER_PORT + "/api";

var testID;
var testLyrics;
var testArtist;
var testTrack;

function insert() {

    return new Promise((resolve, reject) => {
    
        console.log("Inserting lyrics with ID: " + testID) ;
    
        var formData = {
            url: API + '/lyrics',
            form: {
                id: testID,
                lyrics: testLyrics
            }
        }
        
        request.post(formData, function callback(error, response, body) {
        
            if (!error && response.statusCode == 201) {
                resolve();
            }
        
            else {
                console.log("Error: " + response.statusCode + " " + response.statusMessage);
                reject();
            }
        
        });
    
    });

} 

function remove() { 

    return new Promise((resolve, reject) => {

        console.log("Deleting lyrics with ID: " + testID) ;
    
        var formData = {
            url: API + '/lyrics?id=' + testID,
        }
    
        request.delete(formData, function callback(error, response, body) {
    
            if (!error && response.statusCode == 200) {
                resolve();
            } 
    
            else {
                console.log("Error: " + response.statusCode + " " + response.statusMessage);
                reject();
            }
    
        });
    
    });

}

function find() {

    return new Promise( (resolve, reject) => {

        console.log("Finding the track '" + testTrack + "' by " + testArtist);

        var formData = {
            url: API + '/tracks?track=' + testTrack + "&artist=" + testArtist,
        }
    
        request.get(formData, function callback(error, response, body) {
    
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } 
    
            else {
                console.log("Error: " + response.statusCode + " " + response.statusMessage);
                reject();
            }
    
        });

    });

}

function findLyrics() { 

    return new Promise((resolve, reject) => {

        happi.getSongInfo(testTrack, testArtist, function(lyrics) {

            if(lyrics) {
                resolve(lyrics);
            }

            else {
                console.log("No lyrics where found");
                reject();
            }
        });

    });

}

function getLyrics() {

    return new Promise((resolve, reject) => {

        console.log("Getting lyrics of the track with ID: " + testID);

        var formData = {
            url: API + '/lyrics?id=' + testID,
        }
    
        request.get(formData, function callback(error, response, body) {
    
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body).lyrics);
            } 
    
            else {
                console.log("Error: " + response.statusCode + " " + response.statusMessage);
                reject();
            }
    
        });

    });
}

/***********************************************************************************/


request.get({url: API}, function callback(error, response, body) {
    
    if (error) {
        console.log("SERVER IS NOT RUNNING. USE THE COMMAND 'node app' TO RUN THE SERVER");
        process.exit();
    } 

    else {
        test();       
    }

});

function test() {

    console.log("********************");
    console.log("*       TEST       *");
    console.log("********************");

    /*-------------------------------------------*/  // TEST1

    testID = 1;
    testLyrics = "This is a test lyrics";

    console.log("\nTEST 1:\n");

    insert().then( () => {   

        return remove();

    }).then( () => {

        console.log("\nSUCCESS\n");

    }).catch( () => {

        console.log("\nFAILURE\n");

    }).then( () => {

    /*-------------------------------------------*/   // TEST2
    console.log("--------------------------------------------");

        testTrack = "Bohemian Rhapsody";
        testArtist = "Queen";

        console.log("\nTEST 2:\n");

        return find();
    }).then( (response) => {

        testID = response.id;
        cleanDB(testID);
        console.log("Found track with ID: " + testID);

        return findLyrics();

    }).then( (lyrics) => {

        testLyrics = lyrics;
    
        return insert();

    }).then( () => {

        return getLyrics();

    }).then( (lyrics) => {

        console.log("Database responded with these lyrics: \n");
        console.log(lyrics);

        console.log("\nSUCCESS\n");

        populateDB();

    }).catch( () => {

        console.log("\nFAILURE\n");
    });

    /*-------------------------------------------*/ 

}

function cleanDB(id) {

    var formData = {
        url: API + '/lyrics?id=' + id,
    }

    request.delete(formData, function callback(error, response, body) {} );
    
}

var list = [
    ["God's Plan", "Drake"],
    ["In My Life", "The Beatles"],
    ["Can't feel my face", "The Weeknd"],
    ["Africa", "Toto"],
    ["Pink+White", "Frank Ocean"],
    ["Time", "Pink Floyd"],
    ["Chandelier", "Sia"],
    ["September", "Earth, Wind & Fire"],
    ["Get Lucky", "Daft Punk"],
    ["Beat it", "Michael Jackson"],
]

function populateDB() {

    var ans = readline.question("Do you want to populate the database with a list of " +
                                 list.length + " entries? [Y/n] ");
    if(ans == 'Y' || ans == 'y') {
        populate(0);
    }

}

function populate(i) {

    if(i < list.length) {

        testTrack = list[i][0];
        testArtist = list[i][1];

        find().then( (response) => {

            testID = response.id;
            cleanDB(testID);
        
            return findLyrics();
        
        }).then( (lyrics) => {
        
            testLyrics = lyrics;

            return insert();
        
        }).then( () => {

            console.log("")
            populate(i + 1);

        }).catch(() => {

            console.log("ERROR");

        });

    } 
}



