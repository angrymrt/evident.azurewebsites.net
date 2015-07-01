requirejs.config({
    baseUrl: "ncoi_files/require/lib",
    waitSeconds: 240,
    paths: {
        "ncoi": "../ncoi",
        "jquery": "jquery.1.11.3.min",
        "jquery.ui": "jquery.ui.1.11.4.min",
        "jquery.selectordie": "jquery.selectordie.0.1.8.min",
        "jquery.flexslider": "jquery.flexslider.2.2.0.min",
        "jquery.scrollto": "jquery.scrollto.1.4.6.min",
        "jquery.shorten": "jquery.shorten.min",
        "bootstrap.tab": "bootstrap.tab.3.3.2.min",
        "bloodhound": "typeahead.0.11.1.min",
        "hogan": "hogan.min",
        "knockout": "knockout.3.3.0.min",
        "knockout.mapping": "knockout.mapping.2.4.1.min",
        "knockout.validation": "knockout.validation.2.0.3.min",
        "knockout.jqautocomplete": "knockout.jqautocomplete.0.4.2.min",
        "moment": "moment-with-locales.2.10.3.min",
        "underscore": "underscore.1.8.3.min",
        "bedrijvenzoeker": "../shared/Bedrijvenzoeker",
        "postcodezoeker": "../shared/Postcodezoeker",
        "jquery.ncoiscrolltolink": "../shared/jquery.ncoiscrolltolink",
        "ncoi.elasticsearch": "../shared/ncoi.elasticsearch",
        "jquery.colormatrix": "../shared/jquery.colormatrix.min",
        "currentmedia": "../shared/currentmedia",
        "phswap": "../shared/phswap",
        "mmteaser": "../shared/mmteaser",
        "querystringgrabber": "../shared/querystringgrabber",
        "ncoiresponsivecoststable": "../shared/ncoiresponsivecoststable.min"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "currentmedia": {
            exports: "currentmedia"
        },
        "phswap": {
            exports: "phswap"
        },
        "mmteaser": {
            exports: "mmteaser"
        },
        "hogan": {
            exports: "Hogan"
        },
        "jquery.flexslider":{
            deps: ["jquery"]
        },
        "ncoi.elasticsearch":{
            deps: ["jquery"]
        },
        "bedrijvenzoeker":{
            deps: ["jquery"],
            exports: "Bedrijvenzoeker"
        },
        "postcodezoeker":{
            deps: ["jquery"],
            exports: "Postcodezoeker"
        }
    }
});

// Load the main app module to start the app
requirejs(["ncoi/main"]);