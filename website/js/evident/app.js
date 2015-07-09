/// <reference path="../lib/require.2.1.18.min.js" />
/// <reference path="../lib/jquery.2.1.4.min.js" />

// app.js
define(["jquery"], function($) {
	
	$(function () {
		// attach event handlers..
    	$(".some-button").click(onSomeButtonClick);
	});

	function onSomeButtonClick(event) {
		// lazy load knockout framework..
		require(["knockout"], function () {
			// do some crazy knockout stuff!
		});
	}

});
