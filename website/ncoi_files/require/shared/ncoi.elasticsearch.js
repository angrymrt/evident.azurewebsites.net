/*!*
-------------------------------
NCOI Elastic Search module
-------------------------------
version:     1.0
last update: September 30th, 2014
author:      Maarten Zilverberg
required:    Hogan.js
-------------------------------
**/
// Create NCOI namespace if it doesn't exist
if (!("ncoi" in this)) {
	this.ncoi = {};
}

// Elastic Search module
ncoi.ElasticSearch = (function (window, document, $, undefined) {

    /** Some pubsub messaging bus **/
    var $topics = $({});

    /** Declare variables **/
    var dataKey = "ncoi.ElasticSearch.defaults",
        lazyLoad = false,
        busy = false,
        page = 1,
        self,
        json,
        endpoints = [],
        endpoint,
        otherEndpoint,
		globalFacets,
        $nodeReference,
        searchFilterSidebar,
        searchController,
        titleView,
		introView,
		uspView,
		originalHtml = [],
        searchModel;

    /** Default settings **/
    var defaults = {
        searchIndex: "NCOI",									// Elastic Search index
        searchQueryParam: "searchtext",							// Query string parameter with search query
        searchOnInit: false,									// Search on plugin init
        defaultEndpoint: "opleidingen",							// Default search endpoint
        endpointAnchorTarget: ".filters a[href*='&cat=']",		// jQuery selector for endpoint links
        endpointQueryParam: "cat",								// Query string parameter with endpoint definition
    	resultsTarget: "div[class$='searchresultitems']",		// jQuery selector that selects element to fill with results
        //resultsTarget: ".searchresultitems",					// jQuery selector that selects element to fill with results
    	itemTarget: ".item",									// jQuery selector for a result
    	itemParentTarget: ".items",
		groupTarget: ".group",									// jQuery selector for grouped search results: group wrapper
        facetsTarget: ".aside.left > div",						// jQuery selector for each facet
        facetTriggerTarget: "> label",							// jQuery selector within "facetsTarget" for collapsing/expanding facets
        openCheckedFacets: true,								// Expand a facet if a checked checkbox is found
        loadBtnTarget: ".load-more-btn",						// jQuery selector for loading more results
        filterCbTarget: "input[name^='facets']",				// jQuery selector for filtering results
        countTarget: "em",										// jQuery selector for element that contains the result count
        hiddenClass: "hidden",
        markFilterCbParent: true,								// Give the parent element of a filter checkbox a 'selected' class
        expandedFacets: 2,										// Collapse all facets and expand first until nth
        resultCount: 15,										// Items to load per page
        scrollTriggerOffset: 3,									// Trigger new search if nth before last result item is scrolled into view
        delay: 300,												// Simulated delay (ms) for visual feedback
        duration: 100,											// Animation duration
        scrollOffset: 100,										// Offset used when indicating load process
        deviceIsDesktop: true,									// Check if on desktop devices
        buttonTextPrefix: "Toon nog ",							// Load button text prefix
        buttonTextSuffix: ["resultaat", "resultaten"],			// Load button text suffix (singular and plural),
        cookiePrefix: "ES_",									// Elastic Search cookie prefix (followed by endpoint)
        cookieDays: 1,											// Number of days cookie will be valid
        dataFinesseHandler: function () {
            return arguments[0];
        },														// Allow manipulation of data before it is being used
        countFinesseHandler: function () {
            return arguments[0];
        },														// Allow manipulation of value HTML before it is being used
        afterRenderHandler: function () {
            return true;
        },														// Allow updating count values in facets; end with 'return true;' [!!]
		grouped: $(".groupedsearchresultitems").length !== 0,	// Use default Elastic Search WebService, or the *Grouped* Elastic Search Webservice
        useFile: false											// Specify a JSON file (use false in order to use Backend WebService)
    }

    /** Get data **/
    function getElasticSearchData($node) {
        return $node.data(dataKey);
    }

    /** Set data **/
    function setElasticSearchData($node, dataObj) {
        $node.data(dataKey, dataObj);
    }

    /** Check if element is scrolled into view **/
    function isScrolledIntoView($elem) {
        // Get scroll position and div position
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();
        // Return true if element is within view
        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    /** Get query string **/
    // if argument 'str' is passed, return value of that query string parameter
    // if argument 'search' is passed, lookup within that string
    var getQueryString = function (str, search) {
        // Get full query string from url
        search = search || window.location.search,
        // Split query string from url
            queries = search.substring(1);
        // If no particular value is requested, return query string
        if (!str) {
            return "?" + queries;
        }
        // Split query parameters
        queries = queries.split("&"),
        // Split keys from value
        qsArray = [];
        for (var i = 0; i < queries.length; i++) {
            var query = queries[i].split("=");
            // If array key doesn't exist
            if (!(query[0] in qsArray)) {
                // Add array key
                qsArray[query[0]] = [];
            }
            // Push value to key
            qsArray[query[0]].push(query[1]);
        }
        // Get value
        if (str in qsArray) {
            // If array length is 1, return as a string
            // Else return as array
            var ret = qsArray[str].length == 1 ? qsArray[str][0] : qsArray[str];
            return ret;
        } else {
            return false;
        }
    }

    /** Get query string from selected checkboxes **/
    function getQueryStringFromCheckboxes() {
        // Get data
        var pluginData = getElasticSearchData($nodeReference),
        // Get checked checkboxes within wrapper
            checked = $(pluginData.settings.filterCbTarget).filter(":checked"),
        // Return facets as a string
            qs = "";
        // Loop through checked checkboxes within wrapper
        checked.each(function () {
            // Store element
            var checkbox = $(this);
            // Add {key} name and {value} value to query string
            qs += "&" + checkbox.attr("name") + "=" + checkbox.val();
        });
        // Return query string (trim leading '&')
        return qs.substring(1);
    }

    /** Get cookie value **/
    function getElasticSearchCookie(key) {
        var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
        return keyValue ? keyValue[2] : null;
    }

    /** Get endpoints **/
    function getEndpoints($node) {
        // Get data
        var pluginData = getElasticSearchData($node);
        // Empty endpoints array
        endpoints = [];
        // Loop through anchors
        $(pluginData.settings.endpointAnchorTarget).each(function () {
            $anchor = $(this);
            // Get endpoint name
            var endpointName = getQueryString(pluginData.settings.endpointQueryParam, $anchor.attr("href"));
            // Push to array
            endpoints.push(endpointName);
        });
        // Return array
        return endpoints;
    }

    /** Get active endpoint **/
    function getActiveEndpoint($node) {
        // Get data
        var pluginData = getElasticSearchData($node),
            ret = pluginData.settings.defaultEndpoint;
        // Get anchors
        $anchors = $(pluginData.settings.endpointAnchorTarget);
        // If an active link is found
        if ($anchors.filter(".active").length > 0) {
            ret = getQueryString(pluginData.settings.endpointQueryParam, $anchors.filter(".active").attr("href"));
        }
        // If the endpoint is specified in the query string
        if (getQueryString(pluginData.settings.endpointQueryParam)) {
            ret = getQueryString(pluginData.settings.endpointQueryParam);
        }
        // Set active anchor
        $activeAnchor = $anchors.filter(function () {
            return $(this).attr("href").split("&" + pluginData.settings.endpointQueryParam + "=")[1] === ret;
        });
        setActiveEndpointAnchor($anchors, $activeAnchor);
        // Return endpoint
        return ret;
    }

    /** Set endpoint **/
    function setActiveEndpointAnchor($anchors, $activeAnchor) {
        // Reset
        $anchors.removeClass("active");
        // Set
        $activeAnchor.addClass("active");
    }

    /** Edit endpoint anchor href attribute **/
    function editEndpointAnchorsHref($node) {
        // Get data
        var pluginData = getElasticSearchData($node);
        // Loop trough links
        $(pluginData.settings.endpointAnchorTarget).each(function () {
            // Store element
            $anchor = $(this);
            // If not active
            var anchorEndpoint = getQueryString(pluginData.settings.endpointQueryParam, $anchor.attr("href"));
            if (anchorEndpoint !== endpoint) {
                // Check for cookie
                var cookieValue = getElasticSearchCookie(pluginData.settings.cookiePrefix + anchorEndpoint);
                // If cookie value is defined
                if (cookieValue !== null && cookieValue !== "") {
                    // Update href
                    $anchor.attr("href", $anchor.attr("href") + cookieValue);
                }
            }
        });
    }

    /** Get endpoint total results **/
    function getActiveEndpointTotal($node) {
        // Get data
        var pluginData = getElasticSearchData($node);
        // Get active anchor
        $activeAnchor = $(pluginData.settings.endpointAnchorTarget).filter(function () {
            return $(this).attr("href").split("&" + pluginData.settings.endpointQueryParam + "=")[1] === endpoint;
        });
        // Find value in numbering
        var value = $activeAnchor.find(pluginData.settings.countTarget).text();
        // Allow editing of value
        value = parseInt(pluginData.settings.countFinesseHandler.call($node, value));

        value = $activeAnchor.length === 0 ? parseInt($(".resultCount").text()) : value;
        return value;
    }

    /** Set loading state **/
    function setLoadingState($node, state) {
        // Return if lazyloading
        if (lazyLoad) return;
        // Get data
        var pluginData = getElasticSearchData($node);
        // Define render target
        $resultsTarget = $(pluginData.settings.resultsTarget);
        // Set state
        switch (state) {
            // Load end
            case "done":
                // Remove overlay
                $resultsTarget.children(".loading-overlay").remove();
                break;
                // Load start
            case "start":
            default:
                // Add overlay
                $resultsTarget.append("<div class='loading-overlay'><span class='loading'>Loading...</span></div>");
                // If on desktops
                if (pluginData.settings.deviceIsDesktop) {
                    // Position indicator
                    $indicator = $resultsTarget.find(".loading");
                    $scrollTop = $(window).scrollTop() - $resultsTarget.offset().top;
                    $indicator.css({
                        "top": function () {
                            var top = $scrollTop > 0 ? $scrollTop : 0;
                            return top + pluginData.settings.scrollOffset;
                        }
                    });
                }
        }
    }

    /** Render results list **/
    function renderedData($node, data, append) {
    	// ncoi.log(data);
        // Get data
    	var pluginData = getElasticSearchData($node),
			remainingResultCount,
			btnGroupKey = $(pluginData.settings.resultsTarget).data("group-key"),
        // Render template
			renderedTemplate = pluginData.template.render(data),
    	    $renderedTemplate = $(renderedTemplate);
        // If Elastic Search results
    	if (data.Hits.length > 0) {
    		// If Grouped Elastic Search
    	    if (pluginData.settings.grouped) {
    	        // Hide all groups
    	        $(pluginData.settings.groupTarget).addClass("hidden").removeClass("no-margin-top");
    			// Loop through groups
    		    $renderedTemplate.find(pluginData.settings.groupTarget).each(function (i, el) {
    		        $el = $(el);
    				// $el.find(".item").css("background", "aliceblue");
    				var key = $el.data("group-key"),
						// Get existing group div
						target = $(pluginData.settings.resultsTarget).find(pluginData.settings.groupTarget + "[data-group-key='" + key + "']"),
						// Get correct hit
						groupData = $.grep(data.Hits, function (_hit) {
							return _hit.Key === key;
						})[0];
    				// If group is found
    				if (target.length !== 0) {
    					// Append formatted HTML
    					if (append) {
    						// If load button was clicked
    						// And the button's group key doesn't match the group key
    						if (typeof btnGroupKey !== "undefined" && btnGroupKey !== key) {
    						    // Hide extra loaded results but continue to display the items that were already visible
    						    var cnt = 1;
    						    $el.find(".item").each(function (j, item) {
    						        if (cnt > 5) {
    						            $item = $(item);
    						            $item.addClass(pluginData.settings.hiddenClass);
    						        }
    						        cnt = cnt + 1;
    						    });
    						}
    						// If results are found replace ALL items
    						if (target.find(pluginData.settings.itemTarget).length !== 0 && $el.find(pluginData.settings.itemTarget).length !== 0) {
    						    target.removeClass("hidden").find(".items").html($el.find(".items").html());
    						    // If first item, remove margin
    						    if (i === 0) target.addClass("no-margin-top");
    						}
    						// Replace HTML
    					} else {
    						// Get button count
    						remainingResultCount = groupData.Count - groupData.Facets.Hits.length;
    						// Get group HTML and button text (on mobile)
    						var html = el.innerHTML,
    						// Get button text and add button
								btnText = groupData.ButtonText;
    						html = addLoadButtonToHtmlString(html, remainingResultCount, pluginData, btnText);
    						// Replace HTML
    						target.removeClass("hidden").html(html);
    					    // If first item, remove margin
    						if (i === 0) target.addClass("no-margin-top");
    					}
    				}
    			});
    		// Normal Elastic Search
    		} else {
    			if (append) {
    				// Append formatted HTML
    				$(pluginData.settings.resultsTarget).append(renderedTemplate);
    			} else {
    				// Replace HTML
    				// Count remaining results
    				remainingResultCount = data.Total - data.Hits.length;
    				// Add button
    				renderedTemplate = addLoadButtonToHtmlString(renderedTemplate, remainingResultCount, pluginData);
    				// Replace HTML
    				$(pluginData.settings.resultsTarget).html(renderedTemplate);
    			}
    		}
    	}
        return true;
    }

    function addLoadButtonToHtmlString(html, remaining, pluginData, btnText) {
		// Define button text
    	var buttonText = pluginData.settings.buttonTextPrefix + "<span>" + remaining + "</span> " + (remaining === 1 ? pluginData.settings.buttonTextSuffix[0] : pluginData.settings.buttonTextSuffix[1]);
    	// If grouped search and button text is specified
    	if (pluginData.settings.grouped && btnText) {
    		// Overwrite button text with specified text
    		buttonText = btnText;
    	}
    	// If remaining results
    	if (remaining > 0) {
    		var additionalClass = pluginData.settings.grouped ? " visible-xs" : "";
    		html += "<a href='javascript:;' class='" + pluginData.settings.loadBtnTarget.substring(1) + additionalClass + "'>" + buttonText + "</a>";
    	}
    	return html;
    }

    function updateButtonCount($btn, subtract) {
    	// Get current count value
    	var count = parseInt($btn.find("span").text()),
			newCount = count - subtract;
    	// If count is above 0, update value
    	if (newCount > 0) {
    		$btn.find("span").text(newCount);
    	} else {
    		$btn.remove();
    	}
    }

    /** Difference between lazyload and default load **/
    function elasticDefaultSuccess(data) {
        successCallback(data, false);
    }
    function elasticLazyLoadSuccess(data) {
        successCallback(data, true);
    }

    /** WebService success callback **/
    function successCallback(data, append) {
        // Restore $node
        $node = self;
        // Get data
        var pluginData = getElasticSearchData($node),
        // Set delay
            delay = lazyLoad ? 0 : pluginData.settings.delay;
        // Enable manipulating data before rendering template
        data = pluginData.settings.dataFinesseHandler.call($node, data);
        // Set loading state (after delay)
        setTimeout(function () {
            // If data is rendered
            if (renderedData($node, data, append) && (!lazyLoad && pluginData.settings.afterRenderHandler.call($node, data, endpoints) || true)) {
                // Set loading state
                setLoadingState($node, "done");
                // Unset busy state
                busy = false;
            }
        }, delay);

        // Messages pub/sub
        $topics.trigger("results:updated", data);

    }

    /** WebService error callback **/
    function errorCallback(error) {
        // Log error
        if (console && console.error) {
            console.error(error.get_message());
        }
    }

    /** Search **/
    function doElasticSearch($node, facets, addToGlobalFacets) {
        searchController.filter($node, facets, addToGlobalFacets);
    }


    /** Expose as jQuery plugin **/
    $.fn.ncoiElasticSearch = function (settings) {
        // Hogan.js is required
        if (!("Hogan" in window)) {
            throw "Hogan.js is required in order to use $.fn.ncoiElasticSearch";
        }
        return $(this).each(function () {
            init($(this), settings);
        });
    };

    var FilterItem = function ($el, callback, groupParent) {
        var $el = $el,
            el = $el[0];

      var $checkbox = $el.find('input[type="checkbox"]');

        var amAnchor = $el.find('a')[0] ? true : false,
            event = amAnchor ? 'click' : 'change',
            dataElement = amAnchor ? el.getElementsByTagName('a') : el.getElementsByTagName('input'),
            dataValue = dataElement[0].value || dataElement[0].getAttribute("data-value"),
            queryString = dataElement[0].getAttribute('name') + "=" + dataValue;

        var jsonString = dataElement[0].getAttribute("data-facet-properties") ? dataElement[0].getAttribute("data-facet-properties").split("&quot;").join('"') : "{}",
            facetProperties = JSON.parse(jsonString);

        var selected = $el.hasClass('selected') ? true : false,
            count = facetProperties.Count ? true : false,
            facetName = dataElement[0].getAttribute('name').split('[')[1].replace('.', '').replace(']', '');

        var viewProperties = {
          dataValue: dataValue,
          query: queryString,
          selected: selected,
          facetName: facetName,
          amount: facetProperties.Count,
          count: count,
          term: facetProperties.Term,
          displayTerm: facetProperties.DisplayTerm,
          select: function (stopEvent) {
            $checkbox.prop('checked', true);
            if (!stopEvent) {
              $el.trigger(event, {
                selected: true
              });
            }
          },
          unselect: function (stopEvent) {
            $checkbox.prop('checked', false);
            if (!stopEvent) {
              $el.trigger(event, {
                selected: false
              });
            }
          }
        }

        $topics.on("results:updated", function (event, data) {
            if (data.Facets[facetName]) {
                render(data.Facets[facetName]);
            }
        });

        function render(values) {
          for (var i = 0; i < values.length; i++) {
            count = values[i].Count ? true : false;
            if (facetProperties.Term === values[i].Term || facetProperties.DisplayTerm === values[i].Term) {
              $el[count ? "removeClass" : "addClass"]("disabled").find('em').html("(" + values[i].Count + ")");
              if (!count && viewProperties.selected) {
                $el.removeClass('selected');
                viewProperties.selected = false;
                viewProperties.count = count;
                searchController.model.remove(viewProperties.facetName, viewProperties.query);
                if (typeof callback === "function" && !groupParent) {
                  callback(viewProperties);
                }
                return;
              }
            }
          }
        }

        $el[event](function (event, data) {

          if (groupParent) return;

            event.stopPropagation();

            if (amAnchor) {
                event.preventDefault();
            }

            if (viewProperties.preventFiltering) {
              viewProperties.preventFiltering = false;
            }

            // If there are no items, then cancel the event
            if (!viewProperties.count && !viewProperties.selected) return false;

            if (data) {
              viewProperties.selected = data.selected;
            } else {
              viewProperties.selected = viewProperties.selected ? false : true;
            }

            $el[viewProperties.selected ? 'addClass' : 'removeClass']("selected");

            if (!data) {
                if (typeof callback === "function" && !groupParent) {
                return callback(viewProperties);
            }
              $topics.trigger("filter:selected", viewProperties);
            }
        });

        if (viewProperties.selected) {
          viewProperties.preventFiltering = true;
          if (!groupParent) {
              $topics.trigger("filter:selected", viewProperties);
          }
        }

        return viewProperties;

    }

    /* Checkbox group */
    var FilterGroup = function ($el) {

        var $el = $el,
            el = $el[0];

      var $groupItems = $el.find('.checkbox-grouped-items'),
          $checkboxWrapper = $el.children('.checkbox-wrapper');

        var childMap = {},
          requestArray = [],
          selectedCount = 0;

      var filterItem = new FilterItem($checkboxWrapper, Function, true);

      var selected = $checkboxWrapper.hasClass('selected') ? true : false;

      $el.on('change', toggleAll);

      function toggleAll() {

        if ($checkboxWrapper.hasClass('disabled')) return;

        selected = selected ? false : true;
        action = selected ? 'addClass' : 'removeClass';
        $checkboxWrapper[action]('selected');

        for (var key in childMap) {
          childMap[key][selected ? 'select' : 'unselect']();
        }

        if (!selected || $('.checkbox-wrapper.checkbox-group-item.selected').length < 1) {
            $groupItems.slideUp("fast", function () {
                $groupItems.hide();
            });
        }
        
        else {
            $groupItems.slideDown("fast", function () {
                $groupItems.removeClass('collapse');
            });
        }

        $topics.trigger("filter:selected", { requestArray: requestArray });

      }

      function checkAll() {
        for (var key in childMap) {
          if (childMap[key].selected) {
            return;
          }
        }
        selected = false;
        $checkboxWrapper.removeClass('selected');
        filterItem.unselect(true);
        $groupItems.addClass('collapse');
      }

      var $checkboxGroupedItemList = $el.find('.checkbox-group-item');
      $checkboxGroupedItemList.each(function (index, element) {
        var filterItem = new FilterItem($(element), setChildProperties);
        childMap[filterItem.query] = filterItem;
        requestArray.push(childMap[filterItem.query]);
      });

      function setChildProperties(props) {
        checkAll();

        childMap[props.query].selected = props.selected;
        $topics.trigger("filter:selected", { requestArray: requestArray });
      }
    }

	var CheckboxList = function ($el) {
	    var $el = $el,
            el = $el[0];

	    var $filterGroup = $el.find('.checkbox-group');
	    if ($filterGroup.length) {
	        $filterGroup.each(function (index, element) {
	            new FilterGroup($(element));
	        });
	    } else {
	      var $filterItems = $el.find('.checkbox-wrapper');

	      $filterItems.each(function (index, element) {
	              new FilterItem($(element));
	      });
	    }
	};
    
	var SearchFilterSidebar = function (el) {
	    var $el = $(el),
             el = $el[0],
             $checkboxes = $el.find('.checkboxes');

	    $checkboxes.each(function (index, element) {
	        var $cb = $(element);
	        new CheckboxList($cb);
	    });
	};

	var CategoriesView = function (el) {

	    var $el = $(el),
            el = $el[0] ? $el[0] : null;

	    if (!el) return;

	    var $anchor = $el.find('.active'),
            additionalCount = calcAdditional(),
            $counter = $anchor.find('.categoriesCounter');

	    var count = parseInt($counter.html())

	    function render(total) {
	        $counter.html(total);
	    }

	    function calcAdditional() {
	        var $inactiveAnchors = $el.find('a').not('.active'),
                additionalCount = 0;

	        $inactiveAnchors.each(function () {
	            additionalCount += parseInt($(this).find('.categoriesCounter').html());
	        });

	        return additionalCount;
	    }

	    $topics.on("results:updated", function (event, data) {
	        render(data.Total);
	    });

	    return {
	        additionalCount: additionalCount
	    }
	}

    /* This view will only have an element if the element
        passed to it as an argument can be found */
	var TitleView = function (el) {
	    var $el = $(el),
            el = $el[0] ? $el[0] : null;

	    if (!el) return;

	    var $resultCount = $el.find('.resultCount'),
            $titleAddition = $el.find('.titleAddition'),
            $courseTerm = $el.find('.courseTerm'),
            $divTitleDataAttributes = $el.find('#divTitleDataAttributes'),
			      $titleTag = $("title").text().trim();

	    var categoriesView = new CategoriesView($el.find('.title-categories'));

	    var pluralTerm,
            singularTerm;

	    if ($divTitleDataAttributes.length) {
	        pluralTerm = $divTitleDataAttributes[0].getAttribute("data-course-plural");
            singularTerm = $divTitleDataAttributes[0].getAttribute("data-course-singular");
	    }

	    searchController.model.$events.on('change', function (event, model) {
	        render();
	    });

	    function singularPlural(total) {
	        if (total > 1) {
	            $courseTerm.html(pluralTerm);
	        } else if (total <= 1) {
	            $courseTerm.html(singularTerm);
	        }
	    }

	    function render() {

	        var selected = searchController.model.get('selected');

	        if (selected && Object.keys(selected).length > 1) {
	        	$("title").html($titleTag);
	            return $titleAddition.empty();
	        }
	        if (selected['KickOffsLocation'] && Object.keys(selected['KickOffsLocation']).length === 1) {
	        	for (var key in selected['KickOffsLocation']) {
	        		// If " in " exists in title tag
	        		var splitter = " in ";
	        		if ($titleTag.indexOf(splitter) !== -1) {
	        			// Add location to title tag
	        			var splitText = $titleTag.split(splitter);
	        			$("title").html(splitText[0] + splitter + selected["KickOffsLocation"][key].displayTerm + splitter + splitText[1]);
	        		}
	                return $titleAddition.html('in ' + selected['KickOffsLocation'][key].displayTerm);
	            }
	        }

	        $("title").html($titleTag);
	        $titleAddition.empty();
	    }
	    
	    $topics.on("results:updated", function (event, data) {

	        $resultCount.each(function () {
	            $(this).html(categoriesView.additionalCount ? data.Total + categoriesView.additionalCount : data.Total);
	        });

	        if ($divTitleDataAttributes.length) {
	            singularPlural(data.Total);
	        }

	    });

	};

	var SummaryView = function ()
	{

	    var $elIntro = $(".summary > div");
	    var $elUsps = $(".usps");
	    var elIntro = $elIntro[0] ? $elIntro[0] : null;
	    var elUsps = $elUsps[0] ? $elUsps[0] : null;

	    if (!elIntro && !elUsps) return;

	    originalHtml['intro'] = $elIntro.html();
	    originalHtml['usps'] = $elUsps.html();
	    originalHtml['title'] = document.title;

	    $topics.on("filter:selected", function (event, data)
	    {
	        var countSelectedlocations = getSelectedKickOffLocationsCount();
            
	        if (countSelectedlocations === 1)
	        {
	            var locationfacet = getSelectedKickoffLocation();
	            getSummarydata(locationfacet);
	        }
	        else
	        {
	            $elIntro.html(originalHtml['intro']);
	            $elUsps.html(originalHtml['usps']);
	            document.title = originalHtml['title'];
	        }
		});

	    function getSelectedKickOffLocationsCount() {

	        var selected = searchController.model.get('selected');

	        if (selected && selected.KickOffsLocation) {
	            return Object.keys(selected.KickOffsLocation).length;
	        }

	        return 0;
	    }

	    function getSelectedKickoffLocation() {
	        var selected = searchController.model.get('selected');

	        if (selected && selected.KickOffsLocation) {
	            return selected.KickOffsLocation[Object.keys(selected.KickOffsLocation)[0]];
	    }
	    }

	    function getSummarydata(facet) {
	        $.ajax({
	            url: '/CMSPages/WebService.asmx/GetLocationInformation',
	            method: 'POST',
	            dataType: "json",
	            contentType: 'application/json',
	            data: JSON.stringify({
	                location: facet.dataValue,
                    currentPageTitle: $('title').html()
	            }),
	            success: render
	        });
	    };

	    function render(data) {
	        $elIntroHtml = $elIntro.find(".allcontent").clone().unwrap().html();
	        var str = data.d.Intro.trim();
	        if ($elIntroHtml.indexOf(str) === -1) {
	            $elIntroHtml += data.d.Intro;
	        }
	        $elIntro.html($elIntroHtml);

	        // If "read more" functionality exists and must be applied
	        if($.fn.shorten) {
	            // Re-enable shorten plugin
	            enableShorten($elIntro);
		}

	        if (data.d.Usp !== '')
	            $elUsps.html(data.d.Usp);

	        function enableShorten($el) {
	            // Reset data
	            $el.data("jquery.shorten", false);
	            // Re-enable shorten plugin
	            $el.shorten({
	                moreText: "Lees meer",
	                lessText: "Lees minder",
	                showChars: "250"
	            });
	};

	        document.title = data.d.TitleTag;
	    };

	};

	

	var SearchModel = function () {

	    var $events = $({});

	    var defaults = {
	        selected: {},
	        url: []
	    };

	    return {
	      set: function (group, key, value) {
	            if (!defaults['selected'][group]) {
	                var tier1 = {}; tier1[key] = value;
	                defaults['selected'][group] = tier1;
	            } else {
	                defaults['selected'][group][key] = value;
	            }

	            if (defaults['url'].indexOf(key) === -1) {
	                defaults['url'].push(key);
	            }

	            $events.trigger('change', {
                  event : 'add', 
	                group: group,
	                key: key,
	                value: value,
	                groupCount : Object.keys(defaults['selected'][group]).length
	            });
	        },
	        get: function (prop, group, key) {
	            if(!prop) {
	                return defaults;
	            }
	            if (!group) {
	                return defaults[prop];
	            }
	            if (!key) {
	                return defaults[prop][group];
	            }
	            return defaults[prop][group][key];
	        },
	        contains: function (prop, group, key) {
	          if (defaults[prop][group] && defaults[prop][group][key]) {
	            return true;
	          }
	          return false;
	        },
	        remove: function (group, key) {

	            var changed = defaults['selected'][group][key];

	            delete defaults['selected'][group][key];
	            if (!Object.keys(defaults['selected'][group]).length) {
	                delete defaults['selected'][group];
	            }

	            if (defaults['url'].indexOf(key) !== -1) {
	                defaults['url'].splice(defaults['url'].indexOf(key), 1);
	            }

	            $events.trigger('change', {
                  event : 'remove',
	                group: group,
	                key: key,
	                value: changed,
	                groupCount: defaults['selected'][group] ? Object.keys(defaults['selected'][group]).length : 0
	            });
	        },
	        $events: $events
	    }
	};

	var SearchController = function () {

	    this.model = new SearchModel();

	    var pluginData = getElasticSearchData($nodeReference),
            self = this;

	    $topics.on("filter:selected", function (event, props) {
	      if (props.requestArray) {
	        for (var i = 0; i < props.requestArray.length; i++) {
	          parseModelData(props.requestArray[i]);
	        }
	      } else {
	        parseModelData(props);
	      }

	        if (props.preventFiltering) return;
            filterChanged.call(self);
	    });

	    function parseModelData(props) {
        // doesnt exist, add it
	      if (!self.model.contains('selected', props.facetName, props.query) && props.selected) {
	        self.model.set(props.facetName, props.query, {
	          selected: props.selected,
	          term: props.term,
	          dataValue: props.dataValue,
	          displayTerm: props.displayTerm,
            amount : props.amount
	        });
	      } else if (self.model.contains('selected', props.facetName, props.query) && !props.selected) {
	        self.model.remove(props.facetName, props.query);
	      }
	    }

	    function filterChanged() {
	        lazyLoad = false;
	        $(window).off("scroll touchmove", onWindowScroll);
	        page = 1;
	        this.filter($nodeReference);
	    }

	    function setElasticSearchCookie(value, days) {
	        var expires = new Date();
	        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
	        document.cookie = pluginData.settings.cookiePrefix + endpoint + "=" + value + ";expires=" + expires.toUTCString();
	    }

	    this.getQueryString = function () {
	        var qs = "";
	        for (var i = 0; i < this.model.get('url').length; i++) {
	            qs += "&" + this.model.get('url')[i];
	        }
	        return qs;
	    }

	    this.filter = function ($node, facets, addToGlobalFacets, grouped) {

	        var elasticSearchCallback = lazyLoad ? elasticLazyLoadSuccess : elasticDefaultSuccess,
                searchFacets = this.getQueryString();
	        //ncoi.log("%c facets: ", "background: gold", searchFacets);

	    	// Grouped search
	        var groupedSearch = grouped || pluginData.settings.grouped;

	        // If function is called from an external script
	        if (facets) {
	            if (addToGlobalFacets) {
	                // Set global facets and add them to the query string
	                globalFacets = facets;
	                searchFacets += "&" + facets;
	            } else {
	                // Overwrite facets
	                searchFacets = facets;
	            }
	        }
	        if (!facets && globalFacets !== undefined) {
	            searchFacets += "&" + globalFacets;
	        }

	        setElasticSearchCookie("&" + searchFacets, pluginData.settings.cookieDays);

	        setLoadingState($node, "start");
	        busy = true;

	        if (!pluginData.settings.useFile) {
	        	if (!groupedSearch) {
	        		// Use Elastic Search Webservice on "default" Elastic Search pages
	        		WebService.ElasticSearch(
						getQueryString(pluginData.settings.searchQueryParam),   // q
						page,                                                   // page
						searchFacets,											// facets
						pluginData.settings.resultCount,                        // items per search
						pluginData.settings.searchIndex,                        // index
						endpoint,                                               // endpoint
						elasticSearchCallback,                                  // success function
						errorCallback                                           // error function
					);
	        	} else {
	        		WebService.GroupedElasticSearch(
						getQueryString(pluginData.settings.searchQueryParam),   // q
						page,                                                   // page
						searchFacets,											// facets
						pluginData.settings.resultCount,                        // items per search
						pluginData.settings.searchIndex,                        // index
						"vakgebieden",                                          // endpoint
						elasticSearchCallback,                                  // success function
						errorCallback                                           // error function
					);
	        	}
	        } else {
	            $.ajax({
	                url: pluginData.settings.useFile,
	                dataType: "json"
	            }).done(function (data) {
	                elasticSearchCallback(data);
	            });
	        }
	    }

	    setElasticSearchCookie("");

	    return this;

	};

	/** Init **/
	function init($node, settings) {

	    $nodeReference = $node;

        // Get data or create new object
		var pluginData = getElasticSearchData($node) || {
			// Compile template
			template: Hogan.compile($node.html())
		};
		// Extend default settings
		pluginData.settings = $.extend(defaults, settings);
		// Override settings from data-.. attributes
		// ...
		// Save data
		setElasticSearchData($node, pluginData);
		// Attach click event to button
		$(document).off("click", pluginData.settings.loadBtnTarget, onLoadBtnClick)
                   .on("click", pluginData.settings.loadBtnTarget, { $node: $node, pluginData: pluginData }, onLoadBtnClick);

		// Collapse facets
		$facets = $(pluginData.settings.facetsTarget);
		$facetTrigger = $facets.find(pluginData.settings.facetTriggerTarget);
		collapseFacets($node, $facets, $facetTrigger);
		// Attach click event to facet headings
		$facetTrigger.off("click", onFacetTriggerClick).on("click", { $node: $node }, onFacetTriggerClick);

		// Get active endpoint
		endpoint = getActiveEndpoint($node);
		// Get endpoints
		endpoints = getEndpoints($node);
        
	    // Set the stage
		searchController = new SearchController();
		new SummaryView();
        
		titleView = new TitleView('.elastic-search-title');


		searchFilterSidebar = new SearchFilterSidebar(".aside.left");

		// Edit endpoint anchors
		editEndpointAnchorsHref($node);
		// Backup $node (for use in success callback)
		self = $node;
		// Do a search on init if requested
		if (pluginData.settings.searchOnInit) {
		    doElasticSearch($node);
		}

	};

	/** Lazy load **/
	function doLazyLoad(event) {
		// Set lazyload to true
		lazyLoad = true;
	    // Update page
		var pluginData = event.data.pluginData;
		if (!pluginData.settings.grouped) {
		    page++;
		}
		// Search
		doElasticSearch(event.data.$node);
	}

	/** On button click **/
	function onLoadBtnClick(event) {
		// Get button
		$btn = $(event.target);
		// If grouped search
		var pluginData = event.data.pluginData;
		if (pluginData.settings.grouped) {
			// Get group key and possible hidden items
			$group = $btn.closest(pluginData.settings.groupTarget);
			$hidden = $group.find(pluginData.settings.itemTarget).filter("." + pluginData.settings.hiddenClass);
			var key = $group.data("group-key"),
				count = 0;
			// Store group key
			$(pluginData.settings.resultsTarget).data("group-key", key);
			// If earlier results have been loaded
			if ($hidden.length > 0) {
				// Show those results
				$hidden.removeClass(pluginData.settings.hiddenClass);
				// Update count
				count = $hidden.length;
			} else {
				doLazyLoad(event);
				// Update count
				count = parseInt($btn.find("span").text());
			}
			// Update button count
			updateButtonCount($btn, count);
		} else {
			// Remove button
			$btn.remove();
			// Load
			doLazyLoad(event);
			// Bind scroll event
			$(window).on("scroll touchmove", { $node: event.data.$node }, onWindowScroll);
		}
	}

	/** On window scroll **/
	function onWindowScroll(event) {
		// Get data
		var pluginData = getElasticSearchData(event.data.$node),
        // Get item count
            itemCount = $(pluginData.settings.resultsTarget).children(pluginData.settings.itemTarget).length;
		// If there are more results
		if (itemCount < getActiveEndpointTotal(event.data.$node)) {
			// If the plugin is not currently busy with another search call
			// And if the user is scrolling towards the end
			if (!busy && isScrolledIntoView($(pluginData.settings.itemTarget).eq(itemCount - pluginData.settings.scrollTriggerOffset)) || $(window).scrollTop() >= $(pluginData.settings.itemTarget).eq(itemCount - pluginData.settings.scrollTriggerOffset).offset().top) {
				// Update page
				page++;
				// Search
				doElasticSearch(event.data.$node);
			}
		}
	}

	/** Collapse facets **/
	function collapseFacets($node, $facets, $trigger) {
		// Get data
		var pluginData = getElasticSearchData($node);
		// Collapse all facets
		$trigger.removeClass("open").next().hide();
		// Expand first "x" facets
		$facets.filter(":lt(" + pluginData.settings.expandedFacets + ")").find(pluginData.settings.facetTriggerTarget).addClass("open").next().show();
		// Open facets with checked checkboxes
		if (pluginData.settings.openCheckedFacets) {
			$facets.each(function (i) {
				// If a checked checkbox is found
				if ($facets.eq(i).find("input:checked").length > 0) {
					// Add open class
					$facets.eq(i).find(pluginData.settings.facetTriggerTarget).addClass("open");
				}
			});
		}
	}

	/** On facet trigger click **/
	function onFacetTriggerClick(event) {
	    event.stopPropagation();
		// Get data
		var pluginData = getElasticSearchData(event.data.$node),
            duration = pluginData.settings.duration;
		// Get target
		$trigger = $(event.target);
		// Toggle class
		if ($trigger.hasClass("open")) {
			$trigger.next().slideUp(duration, function () {
				$trigger.removeClass("open");
			});
		} else {
			$trigger.next().slideDown(duration, function () {
				$trigger.addClass("open");
			});
		}
	}

	/** Make public **/
	return {
		defaults: defaults,
		search: doElasticSearch
	}

})(this, this.document, jQuery);
