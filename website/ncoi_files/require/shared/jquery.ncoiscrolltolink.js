/*!*
-------------------------------
ncoiScrollToLink plugin
-------------------------------
version:     1.0
last update: June 25th, 2014
author:      Maarten Zilverberg
required:	 $.scrollTo plugin
-------------------------------
**/
/*!jslint sloppy: true, white: true */
define(["jquery", "jquery.scrollto"], function (jQuery) {


(function(f,e,a){function b(h,j){if(h.children("."+j.linkClass).length!=0){return}j.beforeCreate.call();var i=h.attr("name")?h.attr("name"):h.attr("name",j.linkTargetName).attr("name");h.append("<div class='"+j.startMarkClass+"' />");h.append("<a href='#"+i+"' class='"+j.defaultClass+"'>"+j.label+"</a>");j.endMarkAfter.after("<div class='"+j.endMarkClass+"' />");j.afterCreate.call()}function g(j,m){m=m||0;var l=f(e).scrollTop()+m,k=l+f(e).height(),h=j.offset().top,i=h+j.height();return((i<=k)&&(h>=l))}function d(i,k){k=k||0;var j=f(e).scrollTop()+k,h=i.offset().top+i.height();return(j>h)}var c={init:function(h){return this.each(function(){var i=f(this),j=i.data("ncoiAddScrollLink");if(typeof(j)=="undefined"){j=f.extend({},f.fn.ncoiAddScrollLink.defaults,h);i.data("ncoiAddScrollLink",j)}else{j=f.extend({},j,h)}b(i,j);f(e).on("scroll",{self:i,settings:j},c.windowScroll).trigger("scroll");i.children("."+j.defaultClass).unbind("click").on("click",{self:i,settings:j},c.scroll)})},windowScroll:function(m,i){var n=f(e),h=m.data.self,k=f.extend({},h.data("ncoiAddScrollLink"),i);var l=h.children("."+k.defaultClass);if(d(h.children("."+k.startMarkClass))){l.addClass(k.visibleClass)}else{l.removeClass(k.visibleClass)}var j=f("."+k.endMarkClass);g(j)||n.scrollTop()>j.offset().top?l.addClass(k.absoluteClass):l.removeClass(k.absoluteClass)},scroll:function(k,i){var h=k.data.self,j=f.extend({},h.data("ncoiAddScrollLink"),i);k.preventDefault();j.beforeScroll.call();if(e.scrollTo!=undefined){f(e).scrollTo(h,j.scrollDuration,{offset:j.scrollOffset,onAfter:j.afterScroll.call()})}else{var l=h.offset().top+j.scrollOffset;f(e).scrollTop(l);j.afterScroll.call()}}};f.fn.ncoiAddScrollLink=function(){var h=arguments[0];if(c[h]){h=c[h];arguments=Array.prototype.slice.call(arguments,1)}else{if(typeof(h)=="object"||!h){h=c.init}else{f.error("Method "+h+" does not exist in jQuery.ncoiAddScrollLink");return this}}return h.apply(this,arguments)};f.fn.ncoiAddScrollLink.defaults={label:"Verfijn zoekopdracht",linkTargetName:"facets",defaultClass:"scrollto-facets",visibleClass:"visible",absoluteClass:"absolute",startMarkClass:"scrollto-start-marker",endMarkAfter:f(".content"),endMarkClass:"scrollto-end-marker",scrollDuration:300,scrollOffset:0,beforeCreate:function(){},afterCreate:function(){},beforeScroll:function(){},afterScroll:function(){}}})(jQuery,window,window.document);

});