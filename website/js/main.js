requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "evident": "../evident",
      "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min"
    }
});

// Load the main app module to start the app
requirejs(["evident/main"]);