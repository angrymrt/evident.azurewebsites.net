/// <reference path="lib/require.2.1.18.min.js" />

requirejs.config({
	"baseUrl": "includes/script/demo",
    "paths": {
    	"jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min",
    	"knockout": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-min"
    }
});

// Load the main app module to start the app
requirejs(["home"]);