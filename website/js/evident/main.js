define(["jquery"], function($) {
	
	
    $(function() {
        // doc load..
		sleep(500);
		$("p").css("color", "red");
    });
	
	// Basic sleep function based on ms.
	// DO NOT USE ON PUBLIC FACING WEBSITES.
	function sleep(ms) {
	    var unixtime_ms = new Date().getTime();
	    while(new Date().getTime() < unixtime_ms + ms) {}
	}

});
