/**
 * Ads rotator plugin
 *
 * Pulls in random ads via AJAX
 *
 * Options:
 *	- num_displayed (integer): how many ads to show
 *	- ads_sources (array): array of file paths
 *
 */
(function($) {
	'use strict';

	$.fn.adsRotator = function (opts) {
		console.log('opts', opts);
	
		var defaultOptions = {
			ads_sources : [],
			num_displayed : 2,
			onAdLoaded : $.noop
		};
	
		var opts = $.extend({}, defaultOptions, opts);
	
		var $ads_area = this,
			num_displayed = opts.num_displayed,
			ads_sources = opts.ads_sources,
			// the collection of random ads, starting with none
			selected_ads = [],
			// after ads_sources is transformed into an array, it becomes this
			ads_array = [];
		
		// if ads_sources is a function, call it and collect the resulting array
		if ($.isFunction(ads_sources)) {
			ads_array = ads_sources.call();
		} else {
			ads_array = ads_sources;
		}
		
		if (!$.isArray(ads_array) || ads_array.length < 1) {
			ads_array = defaultOptions.ads_array;
		}
		
		// validate the number of ads
		if (!$.isNumeric(num_displayed)) {
			num_displayed = defaultOptions.num_displayed;
		// not too many
		} else if (num_displayed > ads_array.length) {
			num_displayed = ads_array.length;
		// or too few
		} else if (num_displayed < 1) {
			num_displayed = 1;
		}
	
		// collect as many random ads as we need
		for (var i = 0; i < num_displayed; i++) {
			// retrieve a random index from the array
			// see fn definition below
			var ad_index = randomIntFromInterval(0, ads_array.length - 1);
		
			// add it to the selected ads array
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
			var selected_ad = ads_array.slice(ad_index, ad_index + 1)
			selected_ads = selected_ads.concat(selected_ad);
		
			// remove the selected ad from the ads_array array
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
			ads_array.splice(ad_index, 1);
		}
	
		if (selected_ads.length > 0) {
			// clear out the ads area
			$ads_area.html('');
	
			// load each selected ad into the ads area via AJAX
			jQuery.each(selected_ads, function loadAd(idx, src) {
				$.get( src, function( data ) {
					$ads_area.append(data);
					
					// fire the onAdLoaded callback
					opts.onAdLoaded(idx, num_displayed)
				});
			});
		}
		
		// never break the chain
		return $ads_area;
	
		// http://stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
		function randomIntFromInterval(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
	};

})(jQuery);