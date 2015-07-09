/// <reference path="lib/require.2.1.18.min.js" />

requirejs.config({
    "baseUrl": "js",
    "paths": {
      "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min"
    }
});

// Load the main app module to start the app
requirejs(["evident/app"]);