/*!*
-------------------------------
NCOI multimedia teaser
-------------------------------
version:     1.0
last update: December 18th, 2014
author:      Mathijs de Bruin
required:    NCOI Current Media
-------------------------------
**/
window.mmteaser = {

    previousmedia: "undefined",
    mmSwitch: function () {

        var mmteasers = $('.multimediateaser-container, .lasteventteaser-container');

        if (mmteasers.length) {

            var media = "";
            if (currentmedia.isMobile) { media = "mobile"; }
            else if (currentmedia.isTablet) { media = "tablet"; }
            else if (currentmedia.isDesktop) { media = "desktop"; }
            else { media = "desktop"; }

            if (mmteaser.previousmedia != media) {

                mmteaser.previousmedia = media;

                mmteasers.each(function () {
                    var mmteaser = $(this);

                    

                    var values = {
                        title: mmteaser.data('title-' + media + ''),
                        titletag: mmteaser.data('title-tag'),
                        content: mmteaser.data('content-' + media + ''),
                        buttontext: mmteaser.data('buttontext-' + media + ''),
                        imageurl: mmteaser.data('imageurl-' + media + ''),
                        isbackground: mmteaser.data('image-background')
                    }

                    var title = mmteaser.find(values.titletag);
                    var content = mmteaser.find('.content');
                    var buttonlink = mmteaser.find('.btn');
                    var image = mmteaser.find('img');

                    title.text(values.title);
                    buttonlink.html(values.buttontext);
                    var decoded = $('<div/>').html(values.content).text();
                    content.html(decoded);

                    if (values.isbackground) {
                        mmteaser.css('background-image', 'url(' + values.imageurl + ')');
                    } else {
                        image.attr('src', values.imageurl);
                    }

                });
            }

        }
    }

}