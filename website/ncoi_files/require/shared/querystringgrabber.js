
/*!*
-------------------------------
Querystringgrabber
-------------------------------
version:     1.0
last update: Januari 23th, 2015
author:      jolly.exe
link:        http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
-------------------------------
**/
define([], function () {

    return {

        getParameterByName: function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

    };
});