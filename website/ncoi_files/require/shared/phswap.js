/*!*
-------------------------------
NCOI placeholder swap
-------------------------------
version:     1.0
last update: December 17th, 2014
author:      Mathijs de Bruin
required:    NCOI Current Media
-------------------------------
**/
window.phswap = {
    placeholderSwap: function () {
        var placeholders = $('phswap');
        var media = "";

        if (placeholders.length) {

            var targetPlaceholders = null;

            // Check if media queries are supported
            if (Modernizr.mq('only all')) {
                // Set media string
                if (currentmedia.isMobile) { media = 'xs'; } else if (currentmedia.isTablet) { media = 'sm'; } else if (currentmedia.isDesktop) { media = 'md'; }    
            } else {
                media = 'md';
            }
            
            // Filter placeholders without current media
            targetPlaceholders = placeholders.filter(function () {
                return ($(this).data('media').indexOf(media) != -1);
            })

            if (targetPlaceholders.length) {

                // Swap dom location
                targetPlaceholders.each(function () {
                    var targetPlaceholder = $(this);
                    // Only swap if target is still empty
                    if (targetPlaceholder.is(':empty')) {
                        var targetclass = targetPlaceholder.data('class');
                        var source = $('*[data-phswap="' + targetclass + '"]');
                        
                        // check if other media formats are specified
                        var allMediaTypes = ["xs", "sm", "md"];
                        var swapMediaTypes = [];
                        var createMediaTypes = [];    

                        placeholders.each(function () {
                            var placeholder = $(this);
                            if (placeholder.data('class') == targetclass) {
                                var placeholderMediaTypes = placeholder.data('media').split(" ");
                                if (placeholderMediaTypes.length > 0) {
                                    swapMediaTypes = swapMediaTypes.concat(placeholderMediaTypes);
                                }
                            }
                        });

                        // Determine which items will be created

                        for (var i = 0; i < allMediaTypes.length; i++) {
                            if ($.inArray(allMediaTypes[i], swapMediaTypes) == -1) {
                                createMediaTypes.push(allMediaTypes[i]);
                            }
                        }

                        if (createMediaTypes.length > 0) {
                            // If no addition formats are specified. create placeholder.
                            source.after('<phswap data-media="' + createMediaTypes.join(" ") + '" data-class="' + targetclass + '"></phswap>');
                        }

                        targetPlaceholder.after(source)
                        targetPlaceholder.remove();
                    }
                });
            }
        }
    }
}
