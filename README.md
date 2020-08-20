# Musikult
Progetto per il corso Reti di Calcolatori - Sapienza (2019-2020)

<br>
<p align="center">
  <img src="views/img/icon.png" width="200" />
</p>
<br>

## **Indice dei Contenuti**

- [**Descrizione**](#descrizione)
- [**Installazione e Avvio**](#installazione-e-avvio)
- [**Test**](#test)
- [**Tecnologie Utilizzate e Protocolli**](#tecnologie-utilizzate-e-protocolli)
- [**API Utilizzate**](#api-utilizzate)
- [**API Fornite**](#api-fornite)
- [**Struttura del Progetto**](#struttura-del-progetto)

<br>

## **Descrizione**

Musikult è un sito nel quale l'utente può navigare tra i suoi brani e i suoi aritsti preferiti, ascoltare musica e contribuire al nostro database di testi musicali.

Nella pagina principale l'utente può cercare brani e artisti oppure fare log-in con il suo account di Spotify. Il log-in di Spotify offre all'utente opzioni aggiuntive per la navigazione, come la possibilità di visualizzare i propri artisti preferiti o di ascoltare su un player di Spotify la musica trovata.


## **Installazione e Avvio**

- Per installare le dipendenze eseguire `npm install`

- Installare MySQL, impostare la password dell'utente root nel file .env

- Per avviare il server eseguire `node app`

- Se all'avvio il database MySQL restituisce l'errore ER_NOT_SUPPORTED_AUTH_MODE, eseguire nella shell di MySQL il comando `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';`


## **Test**

Il programma di test esegue delle prove di utilizzo delle API e del database, durante la sua esecuzione un log sul terminale mostrerà l'andamento del test.
Per avviare il programma di test eseguire `test app`, il server deve essere in esecuzione.

## **Tecnologie Utilizzate e Protocolli**

#### **Back-end**

- NodeJS

- WebSockets

- MySQL

- REST

- oAuth

#### **Front-end**

- JQuery

- AJAX


## **API Utilizzate**

- Spotify (OAuth)

- Genius

- Happi

- Youtube (Front-End)

## **API Fornite**

- searchTrack → ritorna la traccia cercata con il relativo id

- getLyrics → ritorna il testo della canzone con id inserito nella query della richiesta

- postLyrics → permette di inserire nel database un testo di una canzone

- deleteLyrics → cancella il testo della canzone con id inserito nella query della richiesta

La [documentazione](controllers/api/api.html) delle API più dettagliata viene acceduta dal link http://localhost:3000/api.


## **Struttura del Progetto**

* Views (cartella)  -  Front-end

  * home.ejs → è la pagina principale
  * artist.ejs e song.ejs → sono le pagine di artisti e canzoni 
  * thankPage.ejs → è la pagina visualizzata dopo l’inserimento di un testo musicale

  * partials (cartella)
    * head.ejs → contiene le istruzioni del tag head comuni a tutte le pagine
    * homeContainer.ejs → parte della homepage caricata nel caso dell’effettuato log-in
    * navbar.ejs → navbar del sito

  * script (cartella)
    * artist_buttons.js → logica del bottone Follow/Unfollow presente nella pagina artista (AJAX)
    * artist_script.js → logica della pagina artista (perlopiù JQuery)
    * home_script.js → logica della home page (JQuery e AJAX per la conversione da id di Spotify a id di Genius)
    * navbar_script.js → web sockets lato front-end + logica per la gestione della barra di ricerca (JQuery)
    * player.js → player di youtube nella pagina della canzone
    * song_buttons.js → analogo a artist_buttons.js ma per la pagina della canzone

  * style (cartella) 
    * style.css → importato in head.ejs, quindi comune a tutte le pagine
    * altri file → fogli di stile relativi all’omonima pagina

  * img (cartella) → contiene il logo

* controllers (cartella)  -  Back-end
  * api (cartella)
    * api.html → documentazione delle api di Musikult
    * api.js → router per le chiamate ad API
  * artist.js → router pagina artista
  * index.js → router principale (home page)
  * songs.js → router pagina canzone
  * spotifyAuth.js → router per l’autenticazione su Spotify
  * submit.js → router per la ricezione dei testi dagli utenti (raccoglie i testi e   mostra la thankPage)
  
* utilities (cartella)  -  Back-end
  * db.js → modulo che gestisce il database e i suoi servizi
  * genius.js → modulo che comunica con Genius, contiene anche funzioni di conversione tra id di Genius e id di Spotify e viceversa
  * happi.js → comunica con i servizi di happi, offre funzioni per ottenere i testi delle canzoni
  * spotify.js → modulo che comunica con i servizi di Spotify
  * ws.js → web sockets lato server
  
* app.js → modulo di avvio del server
* test.js → modulo di avvio del programma di test
* .env → contiene le variabili globali e le chiavi per accedere ai servizi
  
