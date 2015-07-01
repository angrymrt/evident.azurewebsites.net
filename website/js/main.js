requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "evident": "../evident",
      "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    }
});

// Load the main app module to start the app
requirejs(["evident/main"]);