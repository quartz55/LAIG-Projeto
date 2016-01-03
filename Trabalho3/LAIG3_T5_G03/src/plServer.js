var PLOG = {
    log: false,
    port: 8081,
    onLoad: function(data) {
        console.log("Reply: " + data.target.response);
    },
    onError: function() {
        console.log("Error waiting for response");
    }
};


PLOG.sendRequest = function(HttpRequest, success, error, port) {
    if (this.log)
        console.log("Sending HttpRequest '" + HttpRequest + "'");
    this._sendPrologRequest(HttpRequest, success, error, port);
};

PLOG.getRequestResponse = function(HttpRequest) {
    return HttpRequest.target.response;
};

PLOG.getIntResponse = function(HttpRequest) {
    return parseInt(HttpRequest.target.response);
};

PLOG.getArrayResponse = function(HttpRequest) {
    return JSON.parse(HttpRequest.target.response);
};

PLOG._sendPrologRequest = function(request, successHandler, errorHandler, port) {
    var HttpPort = port || this.port;
    var HttpRequest = new XMLHttpRequest();
    HttpRequest.open('GET', 'http://localhost:' + HttpPort + '/' + request, true);

    HttpRequest.onload = successHandler || this.onLoad;
    HttpRequest.onerror = errorHandler || this.onError;

    HttpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    HttpRequest.send();
};
