/**
 * Pagination plugin
 *
 * Call Ajax Call And Dispaly Pagination
 *
 * Options:
 *	- num_displayed (integer): how many ads to show
 *	- ads_sources (array): array of file paths
 *
 */
(function($) {
	'use strict';

	$.fn.cebpagination = function (opts) {
		
		var defaultOptions = {
			// pattern : 2,
			callBack : $.noop,
			maxNumberDispaly:5,
			getCurrentPageNo:1,
		};
		var opts = $.extend({}, defaultOptions, opts);
		console.log('opts', opts);
	
		var $pagination = this,
			perpage = opts.perPage,
			total = opts.totalResult,
			start =0,
			end=0,
			maxNumberDispaly = opts.maxNumberDispaly,
			getCurrentPageNo=opts.getCurrentPageNo,
			totalPages =  Math.ceil(total/perpage);
			if (totalPages >maxNumberDispaly) {
				// start=getCurrentPageNo-1;
				if (start==getCurrentPageNo) {
					start=getCurrentPageNo;
					end = start +1;
				}
				if (end==getCurrentPageNo) {
					end=getCurrentPageNo;
					start = end-1;
				}
				displayPagination(start,end,getCurrentPageNo);
				//TODO console.log('prev and next check and Load we have to check')
			} else {
				end=totalPages;
				console.log('totalPages', totalPages);
				// console.log('No Need To Chcek Simple make For Loop ')
				displayPagination(start,end,getCurrentPageNo);
			}



			function displayPagination(start,end,getCurrentPageNo){
				console.info('displayPagination');
				console.log('getCurrentPageNo', getCurrentPageNo);
				console.log('end', end);
				console.log('start', start);
				$pagination.html('');
				$pagination.show();
				var liList;
				
				for (var i = start+1; i <= end; i++) {
					if (i==getCurrentPageNo) {
						liList="<li class='active'><a href = '#'>"+i+"</a></li>";
					}else{
						liList="<li><a href = '#'>"+i+"</a></li>";
					}
					$pagination.append(liList)
				}
			}
			// console.log('totalPages', totalPages);

			// console.log('pagination', pagination);
			// console.log('perpage', perpage);
			// console.log('total', total);

     // public List next(){
     //     //Move to the next page if exists
     //     setCurrentPageNo(getCurrentPageNo() + 1);
     //     getElements();
     // }

     // public List previoius(){
     //     //Move to the previous page if exists
     //     setCurrentPageNo(getCurrentPageNo() - 1);
     //     getElements();
     // }
		
		// if (!$.isArray(ads_array) || ads_array.length < 1) {
		// 	ads_array = defaultOptions.ads_array;
		// }
		
		// // validate the number of ads
		// if (!$.isNumeric(num_displayed)) {
		// 	num_displayed = defaultOptions.num_displayed;
		// // not too many
		// } else if (num_displayed > ads_array.length) {
		// 	num_displayed = ads_array.length;
		// // or too few
		// } else if (num_displayed < 1) {
		// 	num_displayed = 1;
		// }
	
		// // collect as many random ads as we need
		// for (var i = 0; i < num_displayed; i++) {
		// 	// retrieve a random index from the array
		// 	// see fn definition below
		// 	var ad_index = randomIntFromInterval(0, ads_array.length - 1);
		
		// 	// add it to the selected ads array
		// 	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
		// 	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
		// 	var selected_ad = ads_array.slice(ad_index, ad_index + 1)
		// 	selected_ads = selected_ads.concat(selected_ad);
		
		// 	// remove the selected ad from the ads_array array
		// 	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
		// 	ads_array.splice(ad_index, 1);
		// }
	
		// if (selected_ads.length > 0) {
		// 	// clear out the ads area
		// 	$ads_area.html('');
	
		// 	// load each selected ad into the ads area via AJAX
		// 	jQuery.each(selected_ads, function loadAd(idx, src) {
		// 		$.get( src, function( data ) {
		// 			$ads_area.append(data);
					
		// 			// fire the onAdLoaded callback
		// 			opts.onAdLoaded(idx, num_displayed)
		// 		});
		// 	});
		// }
		
		// // never break the chain
		// return $ads_area;
	
		// // http://stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
		// function randomIntFromInterval(min, max) {
		// 	return Math.floor(Math.random() * (max - min + 1) + min);
		// }
	};

})(jQuery);