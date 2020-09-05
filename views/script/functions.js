var url = new URL(window.location.href);
var access_token = url.searchParams.get("access_token");
var refresh_token = url.searchParams.get("refresh_token");

// redirects to the router with the params and the tokens
function redirect(router = '', queryParams = '') {

    if(queryParams != '') queryParams = '&' + queryParams;


    if(access_token) {

        window.location.href = "http://localhost:3000" + router + "?access_token=" + access_token + "&refresh_token=" + refresh_token + queryParams;

    }

    else { 

        window.location.href = "http://localhost:3000" + router + queryParams;

    }

}

// sends an ajax request
function sendAjaxRequest(type, url, handler = () => {}, mode = true, body = null) {
  
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handler;
    httpRequest.open(type, url, mode);
    if(body == null) httpRequest.send();
    else httpRequest.send(JSON.stringify(body));
  
  }