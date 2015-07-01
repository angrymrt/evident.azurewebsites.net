/*!*
-------------------------------
NCOI Current Media
-------------------------------
version:     1.0
last update: December 17th, 2014
author:      Mathijs de Bruin
required:    Modernizr.js
-------------------------------
**/
window.currentmedia = {
    mobileWidth: '0',
    tabletWidth: '660',
    desktopWidth: '1050',
    name: "undefined",
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    setMedia: function () {
        // switch flags depending on the format
      if (Modernizr.mq('(min-width: ' + currentmedia.mobileWidth + 'px)') && Modernizr.mq('(max-width: ' + currentmedia.tabletWidth + 'px)')) {
        currentmedia.isMobile = true;
        currentmedia.isTablet = false;
        currentmedia.isDesktop = false;
        currentmedia.name = "mobile";
      }
      if (Modernizr.mq('(min-width: ' + currentmedia.tabletWidth + 'px)') && Modernizr.mq('(max-width: ' + currentmedia.desktopWidth + 'px)')) {
        currentmedia.isMobile = false;
        currentmedia.isTablet = true;
        currentmedia.isDesktop = false;
        currentmedia.name = "tablet";
      }
      if (Modernizr.mq('(min-width: ' + currentmedia.desktopWidth + 'px)')) {
        currentmedia.isMobile = false;
        currentmedia.isTablet = false;
        currentmedia.isDesktop = true;
        currentmedia.name = "desktop";
      }
    }
}