define(["jquery",
    "jquery.ui", "moment", "jquery.selectordie", "underscore", "bloodhound",
    "bedrijvenzoeker", "postcodezoeker", "jquery.flexslider",
    "jquery.scrollto", "jquery.ncoiscrolltolink", "ncoi.elasticsearch",
    "hogan", "jquery.colormatrix", "ncoiresponsivecoststable",
    "currentmedia", "phswap", "mmteaser", "querystringgrabber",
    "jquery.shorten", "bootstrap.tab"]
    , function ($, jqui, moment, sod, _,
        Bloodhound, Bedrijvenzoeker, Postcodezoeker,
        jqflexslider, jqscrollto, jqncoiscrollto,
        ncoielasticsearch, Hogan, jquerycolormatrix,
        ncoiresponsivecoststable, currentmedia, phswap,
        mmteaser, queryStringGrabber, jqshorten, bootstraptab) {

        var jQuery = $;

        $(function () {
            // doc load..
            console.log("document load..");

        });

        $(function () {

            /*
             * Use this to trigger functions between modules
             */
            var $broker = $({});


            /* Nav Item Models
             * For each nav item, a unique model is created to save and consist the properties from the JSON that comes from the server.
             * If something on the server changes, then we can persist the data here in the model
             * 
             * Each model is represented by an <li> view
             */

            var NavItemModel = function (navItem, depth) {

                var active = false;

                this.depth = depth;
                this.name = navItem.name;
                this.url = navItem.url ? navItem.url : null;

                this.toggleActive = function () {
                    active = active ? false : true;
                    $broker.trigger('tab:toggle', { name: this.name, active: active });
                }

                if (navItem.sub) {
                    this.subItems = new NavCollection(this.name, navItem.sub, this.depth);
                }
            }

            /* Nav Collections 
             * For each navigation list that comes from the server, we create a new collection (array of objects). This is where you will do the sorting logic if needed.
             * Also the count of how many objects you have and other great stuff!
             * 
             * Each collection is represented by a <ul> view.
             */

            var NavCollection = function (name, navItems, depth) {

                var map = {
                    navItems: {},
                    name: name,
                    depth: depth += 1
                };

                for (var i = 0; i < navItems.length; i++) {
                    var model = new NavItemModel(navItems[i], map.depth);
                    map.navItems[navItems[i].name] = model;
                }

                return map;
            };

            /*
             * The li is where all the individual show and hide logic for each nav item will be. This simply creates a jqueyr template and returns the final
             * $el element.
             */

            var NavItemView = function (model) {

                var $li = $('<li />'),
                    $a = $('<a />');

                $li.html($a);
                $a.html(model.name);
                $a.attr('href', model.url || "#");

                $li.addClass('depth-' + model.depth);

                $broker.on('tab:toggle', function (event, options) {
                    toggleClass(options);
                });

                $a.on('click', function (e) {
                    if (model.subItems) {
                        e.preventDefault();
                        model.toggleActive();
                    }
                });

                if (model.subItems) {
                    $li.addClass('subs');
                    new NavigationListParent({
                        $el: $li,
                        collection: model.subItems,
                        sub: true
                    });
                }

                function toggleClass(options) {
                    if (model.name === options.name) {
                        return $li[options.active ? 'addClass' : 'removeClass']('active');
                    }
                    $li.removeClass('active');
                }

                return $li[0];
            }

            /*
             * Primary nav view is the containing ul for each of the nav items. Each nav item is appended to the ul via a doc frag (performant)
             * the the frag is attached to the ul full of all the li's :S
             */

            var NavigationListParent = function (options) {

                var $el = options.$el,
                    el = $el[0],
                    $ul = $('<ul />');

                var navItems = options.collection.navItems;

                if (options.sub) {
                    $ul.addClass('subList');
                }

                $el.append($ul);
                var frag = document.createDocumentFragment();
                for (var key in navItems) {
                    frag.appendChild(new NavItemView(navItems[key]));
                }
                $ul.html(frag);
            }

            // It's on the window! :D

            /*
             * First thing we do is make a nice representation of our data. This doens't affect the DOM in any way.
             */
            var collections = [];
            for (var key in window.nav) {
                var navCollection = new NavCollection(key, window.nav[key], 0);
                collections.push(navCollection);
            }

            /*
             * Then we make views up based on the data we have represented. lol We can of course just do this in the previous loop but for implicity ; )
             */
            for (var i = 0; i < collections.length; i++) {
                new NavigationListParent({
                    $el: $('.primary-navigation-' + collections[i].name),
                    collection: collections[i]
                });
            }

        });


        (function ($, window) {

            var $broker = $({});

            // site-wide
            checkForCookies();
            searchSuggest();
            toggleSearch();
            stickyNav();
            techniekNav();
            manageSubNav();
            backToTop();
            activateTabs();
            prettyForms();
            addOddSelector();

            //  responsive stuff
            initphswap();
            resizeEvents($broker);
            mobileDoormat();
            mobileCourseIntro();
            transformCostTable();
            tweakHeaderString();
            allowAccreditationTooltip();

            //specific items/pages
            doLoadYouTubeApi();
            doSlideshow();
            collapseContent();
            opleidingspaginaLightBoxes();
            brochureRequest();
            planningLightBox();
            seizoenSwitchLightbox();
            doWizard();
            doVCAFilters();
            doPlanning();
            headerMenuControls($broker);
            sideBarController($broker);
    
            // legacy support
            doPlaceholder();
            fixRadioCheckInput();
            nthChild();
            // crossbrowser grayscale images
            $(window).load(imgGrayscale);

        } (jQuery, window));



        /* -------------------------- global functions ------------------------- */

        function setCookie(key, value, numberofdays) {
            if (numberofdays) {
                var expires = new Date();
                expires.setTime(expires.getTime() + (numberofdays * 24 * 60 * 60 * 1000));
                document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
            }
            else {
                //Set session cookie
                document.cookie = key + '=' + value;
            }
        }

        function getCookie(key) {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        }

        function checkForCookies() {
            if ($('.cookies').length < 1) return;

            // check if cookie has been set and if so hide the cookie floater
            if (getCookie('cookiefloater')) $('.cookies').remove();

            // COOKIE FLOATER
            $('.cookies .accept').on('click', function (e) {
                e.preventDefault();
                $('.cookies').fadeOut('fast', function (e) {
                    $(this).remove();
                    setCookie('cookiefloater', true, 180);
                });
            });
        }

        function openLightbox(isIframe, contentToLoad) {
            var htmlToAppend = $('<div class="lightbox"><span class="bg" /><div><div class="content"><span class="close" /></div></div></div>');
            $('body').append(htmlToAppend);

            if (isIframe) {
                $('.lightbox .content').append('<iframe frameborder="0" src="' + contentToLoad + '">');
            } else {
                // add a class name which can be styled separately because we don't have to take the height of iframes into account
                $('.lightbox .content').append(contentToLoad).addClass('nested-content');
            }
    
            // if iframe is loaded in, show it and add a css class so we can toggle the visibilty of stuff inside it
            $('.lightbox iframe').load(function () {
                var iframe = $(this);
                iframe.addClass('loaded').contents().find('html').addClass('in-lightbox').find('body').addClass('in-lightbox');

                // it ain't pretty but it works - check to see if form has been successfully submitted within the iframe
                var submitBtn = iframe.contents().find('.brochure-request input[type="submit"]');
                submitBtn.click(function (e) {
                    // use a small timeout to see if the server returns errors after submit
                    setTimeout(function () {
                        // if no errors are displayed
                        var required = iframe.contents().find('.EditingFormErrorLabel').filter(function () {
                            return $(this).css('visibility') == 'visible';
                        });
                        if (required.length == 0) {
                            // hide lightbox and load new page
                            iframe.removeClass('loaded');
                        }
                    }, 150)
                });

                if (!(Modernizr.mq('only all'))) {
		
                    // for some strange reason the radio inputs don't update their new state after being clicked. 
                    // forcing the iframe to reload directly after the initial load seems to fix this
                    if (!iframe.hasClass('reloaded')) {
                        iframe.get(0).contentWindow.location.reload(true);
                        iframe.addClass('reloaded');
                    }
                }
            });

            activateCloseBtn();

            function activateCloseBtn() {
                $('.lightbox span.close, .lightbox>div').off('click').on('click', function () {
                    $('body>.lightbox').remove();
                });

                // prevent lightbox remove function from firing when clicking inside the lightbox
                $('.lightbox div.content').click(function (e) { e.stopPropagation(); });
            }
        }

        function openLightbox(isIframe, contentToLoad) {
            var htmlToAppend = $('<div class="lightbox"><span class="bg" /><div><div class="content"><span class="close" /></div></div></div>');
            $('body').append(htmlToAppend);

            if (isIframe) {
                $('.lightbox .content').append('<iframe frameborder="0" src="' + contentToLoad + '">');
            } else {
                // add a class name which can be styled separately because we don't have to take the height of iframes into account
                $('.lightbox .content').append(contentToLoad).addClass('nested-content');
            }
    
            // if iframe is loaded in, show it and add a css class so we can toggle the visibilty of stuff inside it
            $('.lightbox iframe').load(function () {
                iframe = $(this);

                iframe.addClass('loaded').contents().find('html').addClass('in-lightbox').find('body').addClass('in-lightbox');
       
                // it ain't pretty but it works - check to see if form has been successfully submitted within the iframe
                var submitBtn = iframe.contents().find('.brochure-request input[type="submit"]');
                submitBtn.click(function (e) {
                    // use a small timeout to see if the server returns errors after submit
                    setTimeout(function () {
                        // if no errors are displayed
                        var required = iframe.contents().find('.EditingFormErrorLabel').filter(function () {
                            return $(this).css('visibility') == 'visible';
                        });
                        if (required.length == 0) {
                            // hide lightbox and load new page
                            iframe.removeClass('loaded');
                        }
                    }, 150)
                });

            });

            activateCloseBtn();

            function activateCloseBtn() {
                $('.lightbox span.close, .lightbox>div').off('click').on('click', function () {
                    $('body>.lightbox').remove();
                });

                // prevent lightbox remove function from firing when clicking inside the lightbox
                $('.lightbox div.content').click(function (e) { e.stopPropagation(); });
            }
        }

        function addOddSelector() {
            $('.faq:even').addClass('odd');
        }


        /* -------------------------- responisve stuff ------------------------- */

        function initphswap() {

            if (Modernizr.mq('only all') ? true : false) {
                window.currentmedia.setMedia();
                mmteaser.mmSwitch();
            }

            phswap.placeholderSwap();

        }

        function resizeEvents($broker) {

            var throttled = _.throttle(resizeFunctions, 120);
            $(window).resize(throttled);

            var currentScreenSize = currentmedia.name,
                onlyAllSupport;

            function resizeFunctions() {

                onlyAllSupport = Modernizr.mq('only all') ? true : false;
                if (onlyAllSupport) {
                    window.currentmedia.setMedia();
                    mmteaser.mmSwitch();
                }
                phswap.placeholderSwap();

                var previous;
                if (currentScreenSize !== currentmedia.name) {
                    previous = currentScreenSize;
                    currentScreenSize = currentmedia.name;
                    $broker.trigger('currentmedia:change', {
                        from: previous,
                        to: currentmedia.name
                    })
                }
            }
        }

        function mobileDoormat() {
            if ($('.doormat').length < 1) return;

            var contactContainer = $('.doormat .contact-footer'),
                contactHeader = $('>h4', contactContainer),
                telNumber = $('span.tel', contactContainer).text(),
                emailLink = '/contact.html';
            telNumberClean = telNumber.replace('-', '').replace(/\s+/g, '');
            var btns = $("<a href='tel:" + telNumberClean + "' class='btn border1 contact'><span>Bel ons:</span> " + telNumber + "</a><a class='btn border1 tel' href='" + emailLink + "'>Mail ons</a>");

            btns.insertAfter(contactHeader);
        }

        function mobileCourseIntro() {
            if ($('.course-info').length < 1) return;
    
            // the telephone btn
            var telAnchor = $('.call-to-action a[href*=tel]'),
                telHref = telAnchor.attr('href');

            btn = $('<a href="' + telHref + '" class="call-us mobile">Bel ons nu!</a>');
            btn.insertAfter('.course-info.top');

            // the CTA buttons
            $('.course-info div.info').clone().addClass('mobile').insertAfter('.call-us.mobile');
            $('div.info.mobile a').removeAttr('id');

        }

        function transformCostTable() {
            if ($('#kostenspecificatie table').length < 1) return;
            // transform table 'kostenspecificatie'
            if (currentmedia.isMobile) { $('#kostenspecificatie table').ncoiResponsiveCostsTable().hide(); }
        }

        function tweakHeaderString() {
            if ($('.page.informative-meeting').length < 1) return;

            $('h1:contains("bijeenkomsten"), h2:contains("bijeenkomsten"), h3:contains("bijeenkomsten")').addClass('mobile-fix').html(function (_, html) {
                return html.split('bijeenkomsten').join('<span>bijeenkomsten</span>');
            });
        }

        function allowAccreditationTooltip() {
            $(document).on("click", "div[class$='searchresultitems'] a", function (e) {
                if ($(e.target).is(".nvao")) {
                    e.preventDefault();
                }
            });
        }

        /* -------------------------- site wide ------------------------- */

        function checkForCookies() {
            if ($('.cookies').length < 1) return;

            // check if cookie has been set and if so hide the cookie floater
            if (getCookie('cookiefloater')) $('.cookies').remove();

            // COOKIE FLOATER
            $('.cookies .accept').on('click', function (e) {
                e.preventDefault();
                $('.cookies').fadeOut('fast', function (e) {
                    $(this).remove();
                    setCookie('cookiefloater', true, 180);
                });
            });
        }


        function setNCOITechniekSessionCookie(value) {
            setCookie('doncoitechnieksubnavanimation', value);
        }

        function getNCOITechniekSessionCookie() {
            return getCookie('doncoitechnieksubnavanimation');
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!!! Dit is de oude versie van de autosuggest, !!!!
        // !!!! die tijdelijk weer gebruikt moet worden.  !!!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        function searchSuggest() {
            if ($('.search-results').length < 1) return;

            var delay = (function () {
                var timer = 0;
                return function (callback, ms) {
                    window.clearTimeout(timer);
                    timer = window.setTimeout(callback, ms);
                };
            } ());

            // append the view all button
            $('<a class="view-all">Bekijk alle <span></span> resultaten</a>').insertAfter('#synoniemenlijst');
            $('a.view-all').click(function (e)
            { $('header .search input[type="submit"]').trigger('click'); });

            var controlkeys = [16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145];

            var currentSearchField = null;

            var search_success = function (data) {
                results = currentSearchField.closest("div").siblings(".search-results");

                var synonyms = results.find("#synoniemenlijst"),
                    elsToToggle = $('.search-results, #synoniemenlijst, a.view-all');
                synonyms.empty().removeAttr('style');

                if (data && data.Hits.length > 0) {
                    $($.map(data.Hits, function (el) {
                        return $('<a />', { href: el.Url[0].replace(/~/g, '') + '?bron=autosuggest&searchtext=' + $('.searchinput').val(), text: el.Fields.Title }).get(0);
                    })).appendTo(synonyms);
                    elsToToggle.show();

                    // hide the mega drop down menu
                    $('ul.courses').removeClass('toggled');

                    // update total count in the btn
                    $('a.view-all span').html(data.Total);

                    // enable navigation by keyboard
                    var numLinks = $('#synoniemenlijst a').length,
                        curLink = -1;

                    $(document).keydown(function (e) {
                        // arrow down
                        if (e.keyCode == 40) {
                            e.preventDefault();
                            curLink++;
                            if (curLink == numLinks) curLink = 0;
                            $('#synoniemenlijst a').eq(curLink).focus();

                        }
                        // arrow up
                        if (e.keyCode == 38) {
                            e.preventDefault();
                            if (curLink == 0) curLink = numLinks;
                            curLink--;
                            $('#synoniemenlijst a').eq(curLink).focus();

                        }
                    });
                }
                else {
                    elsToToggle.hide();
                }
            };

            var search_fail = function (error) {
                if (console && console.error) {
                    console.error(error.get_message());
                }
            };

            $(".searchinput, .elasticSearchInput").keyup(function (e) {
                currentSearchField = $(this);
                var input = this;
                if (e.keyCode === 13) {
                    //execute search
                }
                else if (input.value && $.inArray(e.keyCode, controlkeys) === -1) {
                    delay(function () {
                        WebService.ElasticSearch(input.value, 1, '', 5, 'NCOI', 'opleidingen', search_success, search_fail);
                    }, 0);
                }
            });

            // if user clicks within search suggestions, prevent close function from being triggered
            $('.search-results').click(function (e) { e.stopPropagation(); })
            // user has pressed escape
            $(document).keydown(function (e) { if (e.keyCode == 27) $('.search-results').fadeOut('fast'); });
            // user has clicked outside of search suggestions or on close btn
            $('.search-results a.close, body').click(function (e) { $('.search-results').fadeOut('fast'); });
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!!! Dit is de nieuwe versie van de autosuggest, !!!!
        // !!!! die tijdelijk NIET gebruikt moet worden.    !!!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        function searchSuggestNIEUW() {
            if ($('.search-results').length < 1) return;

            var delay = (function () {
                var timer = 0;
                return function (callback, ms) {
                    window.clearTimeout(timer);
                    timer = window.setTimeout(callback, ms);
                };
            } ());

            // append the view all button
            $('<div class="search-results-all"><a class="view-all btn v3 color2">Bekijk alle <span></span> resultaten</a></div>').insertAfter('#opleidingen');
            $('a.view-all').click(function (e)
            { $('header .search input[type="submit"]').trigger('click'); });

            var controlkeys = [16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145];

            var currentSearchField = null;

            var search_success = function (data) {
                results = currentSearchField.closest("div").siblings(".search-results");
                elsToToggle = $('.search-results, #suggesties, #opleidingen, a.view-all');

                var searchBox = results.closest("div").siblings(".searchBox");
                var searchResultUrl = searchBox.attr("data-search-result-page");

                if (data && data.Suggestions.length == 0 && data.Hits.length == 0) {
                    elsToToggle.hide();
                }
                else {
                    elsToToggle.show();

                    var suggesties = results.find("#suggesties");
                    suggesties.empty().removeAttr('style');

                    if (data && data.Suggestions.length > 0) {
                        $($.map(data.Suggestions, function (el) {
                            var searchText = el.Text.replace("<b>", '').replace("</b>", "");
                            return $('<a />', { href: searchResultUrl + "?searchtext=" + searchText, html: el.Text }).get(0);
                        })).appendTo(suggesties);
                    }

                    var opleidingen = results.find("#opleidingen");
                    opleidingen.empty().removeAttr('style');

                    if (data && data.Hits.length > 0) {
                        $($.map(data.Hits, function (el) {
                            return $('<a />', { href: el.Url.replace(/~/g, '') + '?bron=autosuggest&searchtext=' + $('.searchinput').val(), html: el.Title }).get(0);
                        })).appendTo(opleidingen);

                        // update total count in the btn
                        $('a.view-all span').html(data.Total);
                    }
                }
            };

            var search_fail = function (error) {
                if (console && console.error) {
                    console.error(error.get_message());
                }
            };

            $(".searchinput, .elasticSearchInput").keyup(function (e) {
                currentSearchField = $(this);
                var input = this;
                if (e.keyCode === 13) {
                    //execute search
                }
                else if (input.value && $.inArray(e.keyCode, controlkeys) === -1) {
                    delay(function () {
                        WebService.ElasticSearchSuggest(input.value, 'NCOI', search_success, search_fail);
                    }, 0);
                }
            });

            // if user clicks within search suggestions, prevent close function from being triggered
            $('.search-results').click(function (e) { e.stopPropagation(); })
            // user has pressed escape
            $(document).keydown(function (e) { if (e.keyCode == 27) $('.search-results').fadeOut('fast'); });
            // user has clicked outside of search suggestions or on close btn
            $('.search-results a.close, body').click(function (e) { $('.search-results').fadeOut('fast'); });
        }

        function toggleSearch() {
            if ($('header .search').length < 1) return;

            var searchContainer = $('header .search'),
                toggleClass = 'toggled';
            $('<span class="toggle-search" />').insertBefore(searchContainer);
            var elementsToToggle = $('header .search, .toggle-search');

            $('.toggle-search').off('click').on('click', function (e)
            { elementsToToggle.hasClass(toggleClass) ? elementsToToggle.removeClass(toggleClass) : elementsToToggle.addClass(toggleClass); });

            $('body').on('click', function (e) {
                elementsToToggle.removeClass('toggled');
            });

            $('header, .search').click(function (e) { e.stopPropagation(); });
        }

        function headerMenuControls($broker) {
            var toggleClass = "toggled";
            var $pageContent = $('.page-content'),
                $navItems = $pageContent.find('.nav-items');

            $broker.on('sidebar:toggled', function (event, options) {
                if (options.open) {
                    removeToggleClass($navItems);
                }
            });

            $broker.on('currentmedia:change', function (event, options) {
                removeToggleClass($navItems);
            });

            $('.nav-items > li > a').on('click', function (e) {
                var $clickedLink = $(e.target);
                var $parentLi = $clickedLink.parent();
                var state = !$parentLi.hasClass(toggleClass);

                removeToggleClass($clickedLink);

                if ($clickedLink.next().is(".nav-drop-down")) {
                    e.preventDefault();
                    // show drop down
                    toggleDropDownMenu($parentLi, state);
                }
            });

            function removeToggleClass($clickedLink) {
                $clickedLink.closest(".nav-items").find("." + toggleClass).removeClass(toggleClass);
            }

            function toggleDropDownMenu($parentLi, state) {
                $parentLi.toggleClass(toggleClass, state);

                $broker.trigger('primarynav:change', { state: state });
            }

            var CourseToggler = function () {
                var $el = $pageContent.find('.course-toggler');
                var titles = $el.find('.parentTitle'),
                    tabs = {};

                $broker.on('primarynav:change', function (event, options) {
                    if (!options.state) {
                        closeAll();
                    }
                });

                $broker.on('sidebar:toggled', function (event, options) {
                    if (options.open) {
                        closeAll();
                    }
                });

                $broker.on('currentmedia:change', function (event, options) {
                    closeAll();
                });

                function closeAll() {
                    for (var key in tabs) {
                        tabs[key].tab.removeClass('active');
                    }
                }

                function tabsClickHandler(target) {
                    for (var key in tabs) {
                        var amITheClickedTab = key === $(target).parent().data('index') ? true : false;
                        var tabParent = tabs[key].tab.parent();

                        if (amITheClickedTab && tabParent.hasClass('active')) {
                            return tabParent.removeClass('active');
                        }

                        tabParent[amITheClickedTab ? 'addClass' : 'removeClass']('active');
                    }
                }

                titles.each(function (index, element) {

                    var $el = $(element);

                    if ($el.hasClass('is-mobile') || $el.hasClass('is-tablet')) {
                        tabs["tab-" + index] = {
                            index: index,
                            tab: $(element)
                        };

                        tabs["tab-" + index].tab.parent().data('index', "tab-" + index);

                        tabs["tab-" + index].tab.on('click', function (e) {
                            tabsClickHandler(e.target);
                        });
                    }
                });

            }
            new CourseToggler();

        }




        function sideBarController($broker) {

            var $sidebar = $('.page-sidebar'),
                $navitems = $sidebar.find('.nav-items'),
                $sidebarToggle = $('.toggler.nav'),
                $pageSlider = $('.page-slider');

            var open = false;

            if (!$sidebar.length) return;

            $broker.on('primarynav:change', function (event, options) {
                if (options.state) {
                    open = false;
                    var action = open ? 'addClass' : 'removeClass';
                    $pageSlider[action]('toggled');

                    $broker.trigger('sidebar:toggled', { open: open });
                }
            });

            $sidebarToggle.on('click', function () {
                open = open ? false : true;
                var action = open ? 'addClass' : 'removeClass';
                $pageSlider[action]('toggled');

                $broker.trigger('sidebar:toggled', { open: open });
            });


            /* The tabs are the two tabs at the top of the 
             * sidebar. 
             */
            var Tabs = function () {

                var $navTabs = $sidebar.find('.nav-tabs li');
                if (!$navTabs.length) return;

                var $tabPanes = $sidebar.find('.tab-content .tab-pane');

                var tabs = {};
                function tabsClickHandler(target) {
                    for (var key in tabs) {
                        var action = key === $(target).parent().data('index') ? 'addClass' : 'removeClass';
                        tabs[key].tab[action]('active');
                        tabs[key].pane[action]('active');
                    }
                }

                for (var i = 0; i < $navTabs.length; i++) {
                    tabs["tab-" + i] = {
                        index: i,
                        tab: $($navTabs[i]),
                        pane: $($tabPanes[i])
                    }

                    tabs["tab-" + i].tab.data('index', "tab-" + i);

                    tabs["tab-" + i].tab.on('click', function (e) {
                        e.preventDefault();
                        tabsClickHandler(e.target);
                    });
                }

                $navTabs.on('click', function (e) {
                    e.preventDefault();
                });
            }
            new Tabs();

            var NavSubItem = function (el) {
                var $el = $(el),
                    el = $el[0];

                var selected = false;

                function toggleClass() {
                    var action = selected ? 'addClass' : 'removeClass';
                    $el[action]('selected');
                    $navitems[action]('open');
                }

                $broker.on('sidebar:toggled', function (event, options) {
                    if (!options.open) {
                        selected = false;
                        toggleClass();
                    }
                });

                $broker.on('backbtn:clicked', function (event, options) {
                    selected = false;
                    toggleClass();
                });

                var parentTitle, backBtn;
                $el.on('click', function (e) {

                    parentTitle = e.target.className === 'parentTitle' ? true : false;
                    backBtn = e.target.className === 'up-level' ? true : false;

                    if (parentTitle || backBtn) {
                        e.preventDefault();

                        // Toggle selected
                        selected = selected ? false : true;
	
                        // The back button has been clicked
                        if (backBtn) {
                            selected = false;
                        }

                        toggleClass();

                        $broker.trigger('navitem:selected', { $el: $el });
                    }
                });
            }

            /* Each individual top level nav item constructor */
            var NavItem = function (el) {
                var $el = $(el),
                    el = $el[0];

                if ($el.hasClass('has-children')) {
                    var $navSubItems = $el.find('.sub-items');

                    $navSubItems.each(function (index, el) {
                        new NavSubItem(el);
                    });
                }

            }

            /* The parent view container for all list items */
            var NavItems = function () {
                var $el = $sidebar.find('.nav-items'),
                    $navItems = $el.children('li');

                $broker.on('navitem:selected', function (event, options) {

                });

                $navItems.each(function (index, el) {
                    new NavItem(el);
                });
            }
            new NavItems();

            return $broker;

        }

        function stickyNav() {
            if ($('header').length < 1) return;

            // the script is executed for all formats but is only necesssary for desktop
            // the point at which the header becomes sticky has been hard-coded to 20 because no obvious point exists such at which this should happen
            var header = $('header'),
                stickyFlag = 18;

            $(window).scroll(function () {
                if ($(window).scrollTop() > stickyFlag) {
                    header.addClass('sticky');
                    $('main').addClass('sticky');
                    // remove focus form button on a brochure request page
                    $('input.FormButton[type="submit"]').blur();
                }
                else {
                    header.removeClass('sticky');
                    $('main').removeClass('sticky');
                }
            });

            $(window).scroll();
        }

        function techniekNav() {
            var $techniekSubnav = $('.ncoitechniek-subnav'),
                cookievalue;

            if ($techniekSubnav.length < 1) return;

            currentmedia.setMedia();

            if (!currentmedia.isDesktop) {
                // hide the horizontal techniek submenu
                $techniekSubnav.eq(1).hide();
            }

            // hide the horizontal techniek submenu for mobile devices when screen is resized
            $(window).resize(function () {
                if (!currentmedia.isDesktop) {
                    $techniekSubnav.eq(1).hide();
                }
            });

            if (currentmedia.isDesktop) {
                cookievalue = getNCOITechniekSessionCookie();

                if (cookievalue != 'false') {
                    $techniekSubnav.hide();
                    $techniekSubnav.delay(1200).slideDown(400);
                    setNCOITechniekSessionCookie(false);
                }
            }
        }


        /* Closure */
        +function () {

            var UnexpandableSubnav = function () {

                var $el = $('.unexpandable-subnav'),
                    el = $el[0];

                if (el) {
                    var $h4 = $el.find('h4'),
                        toggle,
                        showClass = 'show';

                    $h4.on('click', function (eve) {
                        toggle = $el.hasClass(showClass) ? 'removeClass' : 'addClass';
                        $el[toggle](showClass);
                    });
                }

            };
            new UnexpandableSubnav();
        } ();

        function manageSubNav() {
            if ($('.subnav').length < 1 || $('main').hasClass('segment')) return;
    
            // delare vars and set flags for visibility of the three menus
            var subnav = $('.subnav'),
                toggler = $('.subnav h4, .subnav .h4'),
                listing = $('.subnav ul'),
                showMoreTxt = 'Toon alle niveaus en vakgebieden',
                showLessTxt = 'Toon minder',
                mobile1 = false,
                mobile2 = false,
                tabletDesktop = false;

            // mobile
            toggler.addClass('mobile-toggle').click(function (e) {
                e.preventDefault();
        
                // grab the parent index so we can figure out whether we're dealing with the first or second mobile menu
                var parentIndex = $(this).parent().index(),
                    container = $(this).parent();

                if (container.hasClass('toggled')) {
                    container.removeClass('toggled');
                    parentIndex == 0 ? mobile1 = false : mobile2 = false;
                }
                else {
                    container.addClass('toggled');
                    parentIndex == 0 ? mobile1 = true : mobile2 = true;
                }
                // pass the updated state of the flags to the cookie function
                updateCookie(mobile1, mobile2, tabletDesktop);
            });

            // tablet and desktop
            listing.each(function (i) {
                if ($('li', this).length > 5 && $('.menu-toggle', subnav).length < 1 && $('main').is('.home, .kroonjuweel'))
                { subnav.append('<span class="menu-toggle">' + showMoreTxt + '</span>') }
            });

            $('.menu-toggle', subnav).click(function (e) {
                e.preventDefault();
                if (subnav.hasClass('toggled')) {
                    subnav.removeClass('toggled');
                    $(this).html(showMoreTxt);
                    if ($('main').is('.home')) {
                        // scroll back to top of menu, otherwise user is left halfway down the page when collapsing the menu
                        $('body, html').animate({ scrollTop: subnav.offset().top - 120 }, 'fast');
                    }
                    tabletDesktop = false;
                }
                else {
                    $(this).html(showLessTxt);
                    subnav.addClass('toggled');
                    tabletDesktop = true;
                }
                // pass the updated state of the flags to the cookie function
                updateCookie(mobile1, mobile2, tabletDesktop);
            });

            function updateCookie(mobile1, mobile2, tabletDesktop) {
                // put together the JSON array
                if (!$('main').hasClass('home')) return;
                var cookieArray = '{ "mobile1" : ' + mobile1 + ', "mobile2" : ' + mobile2 + ', "tabletDesktop" : ' + tabletDesktop + ' }';
                setCookie('ncoi-subnav', cookieArray, 999);
            }

            if (getCookie('ncoi-subnav')) {
                if (!$('main').hasClass('kroonjuweel') && !$('main').hasClass('page-with-submenu')) return;
                var subnavcookie = getCookie('ncoi-subnav'),
                    cookieVal = JSON.parse(subnavcookie);
        
                // get the values of the JSON array
                mobile1 = cookieVal.mobile1;
                mobile2 = cookieVal.mobile2;
                tabletDesktop = cookieVal.tabletDesktop;

                // and toggle visiblity of each of the menus depending on the values in the cookie
                if (mobile1) $('div:first-child', subnav).addClass('toggled');
                if (mobile2) $('div:nth-child(2)', subnav).addClass('toggled');
                if (tabletDesktop) {
                    subnav.addClass('toggled');
                    $('.menu-toggle').html(showLessTxt);
                }
            }

            // the template for content page with submenu has a variant of the submenu, exit the function if we're not on this page
            if ($('.content-menu-container').length < 1) return;

            // prevent page reload when clicking on the active page link
            $('ul .HighLighted>a', subnav).click(function (e) {
                // and make an exception for the parent because it will also have the highlighted class
                if (!$(this).parent().find('.HighLighted').length) e.preventDefault();
            });

            $('ul>li', subnav).each(function (i) {
                if ($('ul', this).length) $(this).addClass('has-child');
            });
        }

        function backToTop() {
            if ($('footer').length < 1) return;

            var footer = $('footer'),
                htmlToInsert = $('<div class="back-to-top"><span>Terug naar boven</span><a /><span /></div>');

            htmlToInsert.prependTo(footer);

            $('.back-to-top').off('click').on('click', function (e) {
                e.preventDefault();
                $('html, body').animate({ scrollTop: 0 }, 'fast');
            });
        }

        function activateTabs() {
            if ($('.tabs').length < 1) return;
    
            // default to tab 1
            var activeTab = 1,
                triggers = $('.tabs>ul a, .tabs-content>a'),
                contentBlocks = $('.tabs-content>div'),
                headerOffset = 0;


            // check if the active tab is present in the url
            if (window.location.href.indexOf('#tab-') > -1) {
                activeTab = (window.location.href).split('#tab-')[1];
                setTimeout(scrollToTop, 1);
            }

            // check if the select filters have been used
            if (window.location.href.indexOf('html?') > -1) {
                setTimeout(function () {
                    var offsetTop = $(".filters").length > 0 ? $(".filters").offset().top : 0;
                    $('html, body').animate({ scrollTop: offsetTop }, 0);
                }, 10);
            }
    
            // activate the active tab
            $('a[href="#tab-' + activeTab + '"]').addClass('active');
            $('#tab-' + activeTab).addClass('active');

            $('a[href*="#tab-"]').click(function (e) {
                e.preventDefault();
                var isMobile = false,
                    trigger = $(this),
                    tabAnchor = trigger.attr('href'),
                    tabIndex = tabAnchor.split('#tab-')[1],
                    activeTriggers = $('a[href$="#tab-' + tabIndex + '"]');
        
                // check if we're on a mobile device
                if (trigger.parent().hasClass('tabs-content')) isMobile = true;

                if (!isMobile) {
                    resetAll();
                    showActiveTab();
                }
                else {
                    if (!trigger.hasClass('inactive-mobile') && trigger.hasClass('active')) {
                        // we're on a mobile and the user wants to collapse an expanded tab
                        resetAll();
                        activeTriggers.addClass('inactive-mobile');
                        $('#tab-' + tabIndex).addClass('inactive-mobile');
                    }
                    else {
                        // simply follow the default flow
                        resetAll();
                    }
                    showActiveTab();

                }
                // scroll to the top of the tabs section
                scrollToTop();

                function resetAll() {
                    // reset everything to default state, so remove all classnames that were appended with javascript
                    triggers.removeClass('active').removeClass('inactive-mobile');
                    contentBlocks.removeClass('active').removeClass('inactive-mobile');
                }

                function showActiveTab() {
                    activeTriggers.addClass('active');
                    $('#tab-' + tabIndex).addClass('active');
                }
            });

            function scrollToTop() {
                // if on desktop add sticky class to prevent scroll movement from overshooting the target
                if (!$('header').hasClass('sticky')) $('header').addClass('sticky');
        
                // check the current header height, add a litlle breating space and scroll down to the top of the tabs section
                headerOffset = $('header').outerHeight() + 10;
                $('html, body').animate({ scrollTop: $('.tabs').offset().top - headerOffset }, 'fast');
            }
        }

        function prettyForms() {
            // selects
            $('select').selectOrDie();

            if ($('.form').length < 1) return;
    
            // checkboxes
            $('.form input[type="checkbox"]').each(function (i) {
                $(this).wrapAll('<label class="checkbox-wrapper" />');
            });
            $('.form label.checkbox-wrapper').append('<span />');

            // radio btns
            function styleRadioButtons(el) {
                // console.log(el);
                var txtToMove = $(el).next().html();
                $('<label class="radio-wrapper"><span /></label>').insertBefore(el);
                $(el).prev().find('span').html(txtToMove);
                $(el).next().remove();
                $(el).prev().prepend(el);
            }

            $('input[type="radio"]', '.form, .opleidings-interesse-formulier').each(function (i) {
                styleRadioButtons(this);
            });

            // On course interest form submit, style error radiobuttons
            var form = ".opleidings-interesse-formulier";
            $(form).parents("#frm").submit(function (ev) {
                // We won't need to prevent default event, since the Bizform isn't submitted with errors
                // Set timer to check for errors
                var timer = setInterval(function () {
                    if ($(form).find(".Error").length > 0) {
                        errorCallback();
                        clearInterval(timer);
                    }
                }, 10),
                    // If errors are found, modify HTML
                    errorCallback = function () {
                        // If radiobuttons are already styled, do nothing
                        if ($(form).find(".radio-wrapper").length !== 0) return;
                        // Otherwise, style radiobuttons
                        $(form).find("input[type='radio']").each(function () {
                            styleRadioButtons(this);
                        });
                    };
            });
        }

        /* -------------------------- specific items/pages ------------------------- */
        function onYouTubeIframeAPIReady() {
            $(".yt-player").each(function () {
                // cache all you tube players..
                getYouTubePlayer(this.id);
            });
        }
        function getYouTubePlayer(id) {
            var $player = $(document.getElementById(id));
            var $storageElement = $player.closest(".video-container");
            // try and get the player via the jQuery data() function..
            var player = $storageElement.data("ytPlayer");
            if (player === undefined
                && "YT" in window) {
                player = new YT.Player(id, {
                    height: $storageElement.height()
                    , width: $storageElement.width()
                    , videoId: $player.attr("data-youtube-id")
                    , playerVars: { modestbranding: 1, rel: 0, wmode: "transparent" }
                });
                $storageElement.data("ytPlayer", player);
            }
            return player;
        }
        function doLoadYouTubeApi() {
            // if there are elements with a yt-player css class, then load the YouTube API!
            if ($(".yt-player").length > 0) {
                // 2. This code loads the IFrame Player API code asynchronously.
                var tag = document.createElement('script');

                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            // todo: end:   move this YouTube code to somewhere more global..
        }
        function doSlideshow() {

            if ($('section.slider').length < 1) return;

            // check if the user is on a touch screen or not
            var isTouchDevice = 'ontouchstart' in document.documentElement;

            $('.video-container .play').click(function (e) {
                $playButton = $(this);
                $playButton.closest(".video-container").addClass("playing");
                var playerId = $playButton.closest(".video-container").find(".yt-player").attr("id");
                var player = getYouTubePlayer(playerId);

                if (currentmedia.isDesktop) {
                    // Autoplay only works on desktop..
                    player.playVideo();
                }
            });

            $('section.slider>div').flexslider(
                {
                    animation: 'slide',
                    easing: 'easeInOutQuart',
                    useCSS: isTouchDevice,
                    slideshow: false,
                    keyboard: true,
                    multipleKeyboard: true,
                    animationSpeed: 300,
                    after: pauseYouTube,
                    animationLoop: false
                });

            function pauseYouTube() {
                $('.video-container.playing').each(function () {
                    var playerId = $(this).find(".yt-player").attr("id");
                    if (playerId !== undefined) {
                        var player = getYouTubePlayer(playerId);
                        player.pauseVideo();
                    }
                });
            }

        }

        function collapseContent() {
            // Select segment but ONLY if the section doesn't have the nocollapse
            // class. This class indicates that the page is opened in the Page tab
            // of the CMS Desk.
            if ($('.in-cmsdesk').length < 1) {
                $(".segment .summary > div, .vca-planner .summary > div").shorten({
                    moreText: 'Lees meer',
                    lessText: 'Lees minder',
                    showChars: '250'
                });
            }
            $('.morelink').click(function () {
                if ($('.allcontent').css('display') == 'block') {
                    var scrollPoint = $('body');
                    $('body, html').animate({ scrollTop: scrollPoint.offset().top - 500 }, 'fast');
                }
            });
        }

        function opleidingspaginaLightBoxes() {

            // Add header for tablet and mobile
            if (!currentmedia.isDesktop) {
                if ($('.digitalebrochure, .opleidings-interesse-formulier, .colorbox').length > 0) {

                    // Get url from querystring
                    var urlbacklink = queryStringGrabber.getParameterByName("url");

                    // Check if not emtpy or null
                    if (urlbacklink.length < 1) {
                        urlbacklink = "javascript:history.back()"; // If no url is available, set history back 1 page.
                    } else {
                        urlbacklink = urlbacklink.split('~')[1];
                    }
                    $('section.title').before('<div class="mobile-lightbox-header"><a class="back" href="' + urlbacklink + '" title="terug naar de vorige pagina" /></div>');
                }
            };


            if ($('a.cboxElement.pdf').length < 1) return;
            $('a.cboxElement.pdf, .triggerPopup').click(function (e) {
                if (currentmedia.isDesktop || !(Modernizr.mq('only all'))) {
                    e.preventDefault();
                    openLightbox(true, $(this).attr('href'));
                }
            });


        }

        function brochureRequest() {
            if ($('.form .brochures').length < 1) return;
    
            // add selected class to brochure element if it has been selected on page load - ff caches the checked state of input elements
            $('.brochure .checkbox-wrapper input').each(function () {
                if ($(this).is(':checked')) $(this).parents('.brochure').addClass('selected');
            });

            // toggle the selected class for the brochure block and checkbox in one go
            $('.form .brochure').on('click', function (e) {
                e.preventDefault();

                $(this).toggleClass('selected');
                var checkbox = $('.checkbox-wrapper input', this),
                    checked = checkbox.is(':checked');
        
                //checkbox.prop('checked', !checkbox.prop('checked'));

                // toggle both the actual property and for IE8 the selected class
                if (checkbox.prop('checked')) {
                    checkbox.prop('checked', false);
                    checkbox.removeClass('checked');
                }
                else {
                    checkbox.prop('checked', true);
                    checkbox.addClass('checked');
                }
            });
        }

        function planningLightBox() {
            if ($('#tab-3').length < 1) return;
            $('#tab-3 .contenttable a.cboxElement').click(function (e) {
                if (currentmedia.isDesktop || !(Modernizr.mq('only all'))) {
                    e.preventDefault();
                    openLightbox(true, $(this).attr('href'));
                }
            });
        }

        function seizoenSwitchLightbox() {

            // cookie logic for seizoensvariant op opleidingspagina
            var seasonShowLightboxCookieName = "SeasonShowLightbox";

            $('body').on('change', '.season-popup #chkbxHideLightbox', function () {
                if ($(this).is(':checked')) {
                    setCookie(seasonShowLightboxCookieName, "hide", 90);
                }
                else {
                    setCookie(seasonShowLightboxCookieName, "", 90);
                }
            });

            if ($('.season a').length < 1) return;
            if ($(".seasonlightbox").length !== 0 && (getCookie(seasonShowLightboxCookieName) != "hide")) {
                if (currentmedia.isDesktop || !(Modernizr.mq('only all'))) {
                    // Overwrite colorbox.close function
                    var onclick = "$('.lightbox span.close').click()";

                    var inlineHTML = $(".seasonlightbox").clone()
                        .find("[onclick='parent.$.fn.colorbox.close();']").attr("onclick", onclick).end()
                        .find(".tooltip").toggleClass("tooltip season-popup").end()
                        .find(".btn4").toggleClass("btn4 btn").end()
                        .find(".hidelightbox").addClass("checkbox");
                    inlineHTML = formatLightboxCheckbox(inlineHTML);
                    openLightbox(false, inlineHTML);
                }
            }
        }

        function formatLightboxCheckbox(html) {
            if (typeof html.contents().html() === "undefined") {
                // Return formatted html
                html = html.contents().eq(2).wrap("<span />").end().end()
                    .wrapInner("<label class='checkbox-wrapper' />").end()
                    .html();
                // IE8 logs type as 'string'
            } else {
                // Create new div and append it to body
                $temp = $("<div class='temp-clone' style='display: none;' />").appendTo($("body"));
                $temp.html(html.closest(".seasonlightbox").html());
                // Modify html
                $temp.find(".checkbox").wrapInner("<span />").wrapInner("<label class='checkbox-wrapper' />")
                    .find("input").prependTo($(".temp-clone label")).end().end().end().end();
                // Get new html
                html = $temp.html();
                // Remove element
                $(".temp-clone").remove();
            }
            // Return formatted
            return html;
        }

        /**
         * Hooks up event handlers to start vca-planner and course wizard. 
         */
        function doWizard() {
            if ($('.wizard').length < 1) return;
            $('.wizard').hide();
            $('.home .jumbotron .btn, .vca-planner .btn.vca ').click(function () {
                require(["knockout", "knockout.mapping", "knockout.validation", "knockout.jqautocomplete"],
                        function(){
                            $('.wizard').fadeIn("fast", function () {
                                //If page isn't at top of window: scroll to top of screen
                                $("html, body").animate({
                                    scrollTop: 0
                                }, 300);
                                if (!$('in-cmsdesk').length < 1) {
                                    checkProgress();
                                    activateClose();
                                }
                                moveWizard();
            
                            });
                        });
            });

            function moveWizard() {
                // shift position in the DOM and fix the rest of the page to prevent extra scrolling
                $('.wizard').insertBefore('.page-slider').show();
                $('.page-slider').addClass('fixed');
            }

            function checkProgress() {
                if (!$('.wizard').hasClass('vca-planner')) {
                    // track visibility of the wizard using a cookie - if user clicks on complete btn, set the flag to false
                    $('.wizard-footer a').click(function (e) {
                        $(this).hasClass('wizard-result') ? setCookie('wizard', 'hide', 180) : setCookie('wizard', 'show', 180);
                    });
                }
            }

            // the btn that closes the wizard
            function activateClose() {
                $('.wizard-close, .wizard-bg').off('click').on('click', function (e) {
                    e.preventDefault();
                    $('.wizard').fadeOut("fast", function () {
                        $('.page-slider').removeClass('fixed');
                        setCookie('wizard', 'hide', 180);
                    });
                });
            }

            // call the init functions on page load, in case we're past step 1
            activateClose();
            checkProgress();

            // íf user has navigated from one step to the next or previous, show wizard
            if (getCookie('wizard')) {
                if (getCookie('wizard') == 'show') moveWizard();
            }

            // check if the browser cached checked checkboxed and add selected class
            $('.wizard li input[type=checkbox]').each(function (i) {
                if ($(this).is(':checked')) $(this).parents('label').addClass('selected');
            });

            // toggle the selected class when firing the click event on the checkbox
            $('.wizard li input[type=checkbox]').click(function () {
                $(this).parents('label').toggleClass('selected');
        
                // IE8 doesn't render the updated state until the checkbox loses focus
                $(this).blur();

                var resultBtn = $('.wizard-result');
                if (resultBtn.length > 0) {
                    var noOfCounts = 0;
                    var totalNoOfCourses = 0;
                    $('.wizard li input[type=checkbox]').each(function (i) {
                        if ($(this).is(':checked')) {
                            var cnt = parseInt($(this).attr("data-count"));

                            noOfCounts++;
                            totalNoOfCourses = totalNoOfCourses + cnt;
                        }
                    });
                }

                // NCOI-8097
                // Check if we need to requery
                var requery = typeof resultBtn.data("requery-after-each-click") !== "undefined" && resultBtn.data("requery-after-each-click").toString() === "true" ? true : false;
                if (requery) {
                    // Setup query
                    var facets = resultBtn.data("facets-to-apply");
                    // Loop through checked checkboxes
                    $(".wizard-wrapper input:checked").each(function () {
                        // Add facet/value pair to query string
                        facets += (facets !== "" ? "&" : "") + resultBtn.data("facet-variable") + "=" + $(this).val();
                    });
                    // Success handling
                    function requeryCountUpdate(data) {
                        resultBtn.children("span").text(data.Total);
                    }
                    // Error handling
                    function requeryError() { }
                    // Perform a search
                    WebService.ElasticSearch(false, 1, facets, 15, "ncoi2", "opleidingen", requeryCountUpdate, requeryError);
                }
            });

            // íf an item has 0 results, add a disabled class
            $('.wizard li input[type=checkbox]').each(function () {
                if ($(this).data('count') === 0) {
                    $(this).parents('label').addClass('disabled').click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                    });
                };
            });
        }

        function doPlanning() {
            /* === Inschrijven knop naar tab-3 === */
            /*if ($('a[id^="Inschrijven_boven"]').length > 0) {
                $('a[id^="Inschrijven_boven"]').attr("href", "javascript:void(0)").on('click', function (event) {
                    event.preventDefault ? event.preventDefault() : event.returnValue = false; // IE8 bugfix
                    $('a[id^="planning_boven"]').click();
                    var selector = $('.exampackage-wrap').length !== 0 ? $('.exampackage-wrap:first') : $('.tabs');
                    $('html, body').animate({
                        scrollTop: selector.offset().top - 70
                    }, 100);
                });
            }*/

            // startmomentenlisting opleidingspagina Desktop
            $smlTrigger = $('.startmomenten-listing h3');
            $smlTrigger.on('click', function () {
                $(this).toggleClass('open').next('.results-container').toggle();
            });
            // startmomentenlisting opleidingspagina Mobile
            $smlTriggerM = $('.results-container h3');
            $smlTriggerM.on('click', function () {
                $(this).nextAll('.course-block').toggle();
                $(this).toggleClass('open');
            });
            // if there is only one variant
            if ($smlTrigger.length == 1) {
                // expand list
                $smlTrigger.click();
            }
        }


        function doVCAFilters() {
            if ($('.vca-planner').length < 1) return;
            //hide/show all
            $('.search-container .aside.left > div > label').not('.open').next('div').hide();
            $('.search-container .aside.left > div > label.open').next('div').show();
            //toggle on label click
            $('.search-container .aside.left > div > label').on('click', function () {
                $this = $(this);
                if ($this.hasClass('open')) {
                    $this.removeClass('open').next('div').slideUp();
                } else {
                    $this.addClass('open').next('div').slideDown();
                }
            });

            //count search results  
            var numberOfResults = $(".searchresultitems .item").length;
            //set number in text
            $(".vca-planner .filter-results h1 span").text(numberOfResults);
            if (numberOfResults == 1) {
                //console.log(numberOfResults);
                $(".vca-planner .filter-results h1 i").hide();
            }
        }



        /* -------------------------- legacy support ------------------------- */

        function doPlaceholder() {
            /* Placeholders */
            if (typeof Modernizr !== 'undefined' && !Modernizr.input.placeholder) {
                // on focus, remove placeholder text
                $('[placeholder]').focus(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                        input.removeClass('placeholder');
                    }
                    // on blur, set placeholder
                }).blur(function () {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.addClass('placeholder');
                        input.val(input.attr('placeholder'));
                    }
                }).blur();
                // do not post placeholder text as user input
                $('[placeholder]').parents('form').submit(function () {
                    $(this).find('[placeholder]').each(function () {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    })
                });
            }
        }

        function fixRadioCheckInput() {
            // IE8 doesn't recognize the css :checked selector, so we have to mimic the selector with javascript
            if (!(Modernizr.mq('only all'))) {
                // check if stuff is checked on page load
                $('input[type="checkbox"]:checked, input[type="radio"]:checked').addClass('checked');
        
                // toggle the checked class and blur focus, otherwise the updated state is not rendered
                $(document).on("change", 'input[type="checkbox"]', function (i) {
                    $(this).toggleClass('checked').blur(); i.stopPropagation();
                });
        
                // radio inputs require a slightly different approach because inputs in the same group need to be unchecked
                $(document).on("change", 'input[type="radio"]', function (e) {
                    var nameAttr = $(this).attr('name');
                    $('input[type="radio"]').attr('name', nameAttr).removeClass('checked');
                    $(this).addClass('checked').blur();
                });
            }
        }

        function nthChild() {
            $('.brochures .brochure:nth-child(5n+1)').addClass('fifth');
            $('.informative-meeting .contenttable td:last-child').addClass('last-child');
        }

        /* -------------------------- crossbrowser grayscale images  ------------------------- */

        function imgGrayscale() {
            $imgs = $(".teaser.erkendekwaliteit a > img");
            if ($imgs.length == 0) return;
            // apply plugin
            $imgs.colorMatrix();
        }


        /* -------------------------- Dynamic elastic search results  ------------------------- */

        var NCOI = (function (window, document, $, undefined) {

            var ElasticSearch = (function () {
                // Declare variables
                $search = undefined;
                var targetSelector = undefined,
                    preselectedFacets,
                    count = function (update) {
                        if ($(".groupedsearchresultitems").length > 0) {
                            var count = 5;
                            // Grouped
                            if (!currentmedia.isMobile || update) {
                                count = 999;
                            }
                            return count;
                        } else {
                            return 15;
                        }
                    }

                // Init
                function init() {
                    targetSelector = "#resultTemplate";
                    $search = $(targetSelector).ncoiElasticSearch({
                        searchIndex: "ncoi2",
                        resultCount: count(),
                        expandedFacets: 3,
                        facetsTarget: ".aside.left > div:not('.scrollto-start-marker, .hidden-fields')",
                        deviceIsDesktop: $("html").hasClass("desktop"), // device.js
                        dataFinesseHandler: manipulateData,
                        countFinesseHandler: manipulateCountHtml,
                        afterRenderHandler: updateFacetCountValues
                    });
                }

                function search() {
                    // If #divDataAttributes exists
                    $div = $("#divDataAttributes");
                    if ($div.length <= 0) return;
                    // Get facets to apply
                    var facets = $div.data("facets-to-apply");
                    preselectedFacets = $div.data("preselected-facets") ? $div.data("preselected-facets").replace(/&#39;/, "'") : undefined;
                    // Grouped search on subsegment pages
                    var grouped = $(".groupedsearchresultitems").length !== 0;
                    // Perform a standalone search
                    if (facets !== undefined) {
                        ncoi.ElasticSearch.search($(targetSelector), facets, false, grouped);
                    } else if (preselectedFacets !== undefined) {
                        ncoi.ElasticSearch.search($(targetSelector), preselectedFacets, true, grouped);
                    }
                    // Update result count value
                    $(targetSelector).data("ncoi.ElasticSearch.defaults").settings.resultCount = count(true);
                }

                // Manipulate data
                function manipulateData() {
                    // Get data
                    var data = arguments[0];
                    // console.log(data);
                    // Clean up data
                    data = cleanupData(data);
                    // Return manipulated data
                    // ncoi.log($(targetSelector).data("ncoi.ElasticSearch.defaults").settings);
                    return data;
                }

                // Cleanup data
                function cleanupData(data) {
                    // Setup duur array
                    var duurArray = [];
                    // Manipulate data
                    $.map(data.Hits, function (Hit) {
                        // If data is grouped
                        if (typeof Hit.Display !== "undefined") {
                            $.map(Hit.Facets.Hits, function (GroupedHit) {
                                // console.log(GroupedHit);
                                // Add nvao tooltip
                                GroupedHit.AccreditationTooltip = $("#divDataAttributes").data("accreditation-description");
                                GroupedHit = cleanupHit(GroupedHit);
                            });
                            // Add tooltip and intro text to JSON data
                            $group = $(".group[data-group-key='" + Hit.Key + "']");
                            Hit.Tooltip = $group.find(".tooltip").text().trim();
                            Hit.Intro = $group.find(".groupIntro").text().trim();
                            // Add button text
                            Hit.ButtonText = $group.data("group-button");
                        } else {
                            // Add nvao tooltip
                            Hit.AccreditationTooltip = $("#divDataAttributes").data("accreditation-description");
                            Hit = cleanupHit(Hit);
                        }
                    });
                    return data;
                    // console.log(duurArray);
                }

                // Clean up each Hit
                function cleanupHit(Hit) {
                    // Replace string in url
                    if (typeof Hit.Url === "string") {
                        Hit.Url = Hit.Url.replace("~", "");
                    } else {
                        Hit.Url[0] = Hit.Url[0].replace("~", "");
                    }
                    // Unescape HTML characters (requires Underscore.js)
                    if (Hit.Fields.Title !== null) {
                        Hit.Fields.Title = _.unescape(Hit.Fields.Title);
                    }
                    if (Hit.Fields.Content !== null) {
                        Hit.Fields.Content = _.unescape(Hit.Fields.Content);
                    }
                    if (Hit.Fields.Summary !== null) {
                        Hit.Fields.Summary = _.unescape(Hit.Fields.Summary);
                    }
                    if (Hit.Fields.Question !== null) {
                        Hit.Fields.Question = _.unescape(Hit.Fields.Question);
                    }
                    if (Hit.Fields.Answer !== null) {
                        Hit.Fields.Answer = _.unescape(Hit.Fields.Answer);
                    }
                    //if (Hit.Fields.DuurOpleiding !== null) {
                    //	var duur = Hit.Fields.DuurOpleiding.Normal;
                    //	// ["m001", "m003", "m006", "m009", "m012", "m999"];
                    //	if (!(duur in duurArray)) {
                    //		duurArray[duur] = $("label[data-facet='DuurOpleiding'").next().find("input").filter(function () {
                    //			return $(this).val() === duur;
                    //		}).next("span").text().split(" (")[0];
                    //	}
                    //	Hit.Fields.DuurOpleiding.Normal = duurArray[duur];
                    //}
                    // Other content types
                    if (Hit.Type === "blogpost") {
                        Hit.Fields.Level = "Blog";
                    } else if (Hit.Type === "faqitem") {
                        Hit.Fields.Level = "FAQ";
                    } else if (Hit.Type === "contentitem") {
                        Hit.Fields.Level = "Pagina";
                    }
                    // Return manipulated array item
                    return Hit;
                }

                // Manipulate count html
                function manipulateCountHtml() {
                    return arguments[0].replace("(", "").replace(")", "");
                }

                // Updated facet count values
                function updateFacetCountValues() {
                    /*                      There is some additional complexity with removing this. This is caled in the success callback as afterRenderHandler() in plugin.js
                        but will need to be looked at separately.
        
                        Until that's refactored, this should continue to return true
        
                    */
                    // $("span.nvao").append("<span class='accreditation-tooltip'><dfn>Lorem ipsum dolor sit amet consectetur adipiscing</dfn></span>");
                    return true;
                }

                // Make public
                return {
                    init: init,
                    search: search
                };

            })();

            // Make public
            return {
                ElasticSearch: ElasticSearch
            };

        })(this, this.document, jQuery);

        // TOGGLE LIST
        // SIMILAR TO ENABLETOGGLEMORE, BUT THIS WORKS FOR MULTIPLE ITEMS
        // elem:   elements to loop through
        // int:    hide elements after 'x' items
        function toggleList(elem, int, getBtnTextBool, getLabelTextBool) {
            // loop through child elements
            for (var i = 0; i < elem.children().length; i++) {
                var child = elem.children().eq(i);
                // add class if child's index is higher than int value
                if (child.index() >= int) child.addClass('collapsed');
            }
            // if some child elements are hidden
            // add toggle button after element
            addToggleButtonAfter(elem.filter(function () {
                return $(this).children('.collapsed').length != 0;
            }), false, getBtnTextBool, getLabelTextBool);
        }

        // ADD TOGGLE BUTTON AFTER ELEMENT
        // elem:        elements to add button/link after
        // triggerElem: elements that should collapse/uncollapse
        // getBtnText:     get button text from element
        function addToggleButtonAfter(elem, triggerElem, getBtnText, inSearch) {
            var btnText = "";
            $(elem).each(function () {
                var cur = $(this);
                if (inSearch) {
                    // get text from label data-attribute
                    btnText = {
                        text: 'Toon alle ' + cur.parent().find('label').first().data('label'),
                        alt: 'Toon minder ' + cur.parent().find('label').first().data('label')
                    }
                } else {
                    // get text from data-attribute or set default value
                    btnText = {
                        text: getBtnText ? 'Toon alle ' + cur.prev('h2').attr('data-label') : 'Toon alles',
                        alt: getBtnText ? 'Toon minder ' + cur.prev('h2').attr('data-label') : 'Toon minder'
                    }
                }

                // add button if it doesn't exist yet
                if (cur.next('.showall').length == 0) {
                    cur.after('<a href="javascript:;" class="showall" data-alt-text="' + btnText.alt + '">' + btnText.text + '</a>');
                }
            });

            // bind functionality to link
            var link = elem.next('.showall');
            link.unbind('click').click(function (e) {
                link = $(e.target);
                // switch text
                var labels = {
                    text: link.text(),
                    alt: link.attr('data-alt-text')
                }
                link.attr('data-alt-text', labels.text).text(labels.alt);
                // if there is no element defined
                if (!triggerElem) {
                    // toggle visibility of element
                    link.prev().children().filter('.collapsed').toggleClass('visible');
                } else {
                    // toggle visibility of specified element(s)
                    triggerElem.filter('.collapsed').toggleClass('visible');
                }
            });
        }

        // CREATE MOBILE FILTER
        function doToggleES() {

            if (currentmedia.isMobile) {
                $('.aside.left > div:not(.hidden-fields) ').each(function (i) {
                    var countCheckboxes = $('.checkbox-wrapper', this).length;

                    $('label[data-facet]', this).append(" (" + countCheckboxes + ")");
                })
            }
            // close all open labels
            $('.elastic-search:not(.vca-planner) .aside.left').find('label.open').removeClass('open').next().hide();
            // if it doesn't exist
            if (!$('.aside.left').prev().hasClass('mobile-filter-toggle')) {
                // unset margin-bottom on search box
                $('.search.is-toggled').css('margin-bottom', 0);
                // create filter toggle
                //$('.aside.left').before('<div class="mobile-filter-toggle"><span class="result-count"></span><a href="javascript:;" class="toggle-filters" data-alt-text="Filter"><b>Filter</b></a></div>');
                $('.aside.left').before('<div class="mobile-filter-toggle"><a href="javascript:;" class="toggle-filters" data-alt-text="Filter">Filter</a></div>');
                // store elements
                var filterToggle = $('.mobile-filter-toggle'),
                    resultCount = filterToggle.children('.result-count'),
                    filterToggleLink = filterToggle.children('.toggle-filters');
                // set count text
                var i = parseInt($('.elastic-search h1 > span').text()),
                    label = i != 1 ? ' resultaten ' : ' resultaat ';
                resultCount.text(i + label + 'gevonden');
            }
        }
        // TOGGLE CHECKBOXES
        function toggleFacetCheckboxes() {
            // enable toggle more/less checkboxes
            var cbInsertAfterIndex = 5;
            toggleList($('.elastic-search .checkboxes').filter(function () {
                // get highest index of all checked checkboxes
                var checkedBoxes = $(this).find('input[type="checkbox"]:checked'),
                    highestIndex = checkedBoxes.filter(':last').parents('.checkbox-wrapper').index();
                // if highest index is more than the marked index, exclude this from selector
                return (cbInsertAfterIndex > highestIndex);
            }), cbInsertAfterIndex, false, true);
        }
        $('body').on('click', '.mobile-filter-toggle a', function () {
            // store elem and labels
            var link = $(this),
                text = {
                    label: link.text(),
                    alt: link.attr('data-alt-text')
                }
            // toggle aside left
            $('.aside.left').slideToggle(300);
            // toggle text
            link.attr('data-alt-text', text.label).text(text.alt);
            link.parent().toggleClass("open");
        });

        // On load
        jQuery(function () {
            if ($('.elastic-search').length <= 0) return;
            // Create mobile toggle
            doToggleES();
            // Collapse facet checkboxes
            toggleFacetCheckboxes();
            // Add link filter facets link
            $filterAside = $('.elastic-search .aside.left');
            $filterAside.ncoiAddScrollLink({
                endMarkAfter: $('.elastic-search .container-fluid > .row'),
                scrollOffset: -20, // -(20 + $('.cookies').height())
            });
            // Bind click functionality to static scroll-to link
            $(".scrollto-facets.visible-xs").click(function (event) {
                event.preventDefault();
                var name = this.hash.replace("#", "");
                // Scroll to toggle button, since the filters are hidden
                $target = $("*[name='" + name + "']").prev();
                $(window).scrollTo($target, 300, {
                    offset: -80
                });
            })
            // Start search
            NCOI.ElasticSearch.init();
            // Search
            NCOI.ElasticSearch.search();
        });




        return null;
    });
