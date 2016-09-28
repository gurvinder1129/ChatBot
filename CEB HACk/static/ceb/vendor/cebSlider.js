/*
 * Plugin Name: CEB Slider Plugin
 * Dependencies: jQuery, Bootstrap
 */

var cebSlider_Methods = {
    init: function (options, elem) {
        var k = this;
        this.options = $.extend({}, this.options, options);
		k.thumbAdded = false;
		k.thumb = null;
		k.node = $(elem);
		k.$cebSliderContainer = null;
		k._buildDom();
		

        return this;
    },
	// Building the DOM of the Slider
	_buildDom: function(){
		var k = this;
		k.node.addClass('sr-only');
	
		k.node.attr('min', k.options.min);
		k.node.attr('max', k.options.max);
		var master = $("<div/>").addClass('_cebSliderContainer').attr ('aria-hidden', 'true');
		
		var slider = '<div class="_sliderBase">' +
						'<div class="_sliderFill"></div>' +
					  '</div>';
		var radios = k.buildRadios();
		
		master.append(slider + radios);
		k.node.after(master);
		k.$cebSliderContainer = master;
		
		k.alignRadios();
		
		$(window).resize(function(){
			k.alignRadios();
		});
		
		k.bindContext();
		k.bindEvents();
	},
	// Building the DOM of Radios
	buildRadios: function(){
		var k = this,
			options = k.options,
			toReturn = '<div class="_sliderLaps">';
		
		for(var  i = 0; i < options.laps.length; i++)
		{
			toReturn += '<a class="_sliderLap" tabindex = "0"><span class = "_sliderInnerCircle"></span></a>';
		}
		
		toReturn += '</div></div>';
		
		return toReturn;
	},
	// Placing Radios according to the given Lap Values
	alignRadios: function(){
		var k = this,
			laps = k.options.laps,
			max = k.options.max,
			radios = k.node.next().find('._sliderLap'),
			parentContWd = k.node.next().find('._sliderBase').eq(0).outerWidth(),
			radioWd = radios.eq(0).outerWidth(),
			labels = k.options.lapLabels;
			
		
		if(laps.length && radios.length)
		{
			for(var  i = 0; i < radios.length; i++)
			{
				var perc = laps[i]/max,
					positionX = (perc * parentContWd) - (radioWd/2);
				
				radios.eq(i).css('left', positionX + 'px').attr ('data-originalLeft', positionX);
			}
			
			//radios.eq(0).append ('<p class = "cebslider_label label_high">' + labels.high + '</p>');
			//radios.eq(laps.length - 1).append ('<p class = "cebslider_label label_low">' + labels.low + '</p>');
			
			k.$cebSliderContainer.prepend ('<p class = "cebslider_label label_high">' + labels.high + '</p>');
			k.$cebSliderContainer.append ('<p class = "cebslider_label label_low">' + labels.low + '</p>');
		}
		
	},
	bindContext: function(){
		var k = this,
			parentCont = k.node.next(),
			slider = $('._sliderBase', parentCont),
			radios = $('._sliderLap', parentCont),
			options = k.options,
			wdLaps = [];
		
		// Updating the options provided with the Calculated Lap widths
		if(options.laps.length)
		{
			for(var i = 0; i < options.laps.length; i++)
			{
				var perc = (options.laps[i]/options.max) * 100;
				wdLaps.push(perc);
			}
			
			options.lapWidth = wdLaps;
		}
		
		/* Chnaging the default value of the slider from 50% to the minimum value provided
		if(typeof options.min == 'number')
		{
			k.node.val(options.min).trigger('change');
		}
		*/
		// Binding the context to the original Input
		var inputContext = k.node.data('context');
		inputContext['cebSlider'] = options;
		//k.node.data('context', options)
		
		// Binding the Context to the Radios Generated
		for(var i = 0; i < radios.length; i++)
		{
			var ratio = options.laps[i]/options.max,
				label = (options.lapTooltips.length == options.laps.length) ? options.lapTooltips[i] : '';
			radios.eq(i).data('context', {'ratio' : ratio, 'value' : options.laps[i], label: label, left : radios.eq(i).position().left});
		}
	},
	_addThumb : function (ctx) {
		var _this = this;
		_this.thumbAdded = true;
		var thumb = $('<a />').addClass ("ceb_draggable_thumb");
		thumb.appendTo (_this.$cebSliderContainer);
		thumb.append ("<span class = '_sliderInnerCircle'></span>");
		thumb.draggable ({
			axis: "x", 
			containment: "parent",
			delay: 200,
			snap : '._sliderLap',
			snapMode : 'inner',
			opacity: 0.6,
			snapTolerance: 10,
			stop: function (ev, ui) {
				_this._thumbDragStopped (ev, ui);
			}
		});
		_this.thumb = thumb;
		_this._animateThumb(ctx);
	},
	
	_thumbDragStopped : function (ev, ui) {
		var _this = this;
		var widthOffset = $(ui.helper [0]).width() / 2;
		var radios = $('._sliderLap', _this.node.next()); 
		var currentLeft = ui.position.left + widthOffset;
		var totalWidth = ('._sliderBase', _this.node.next()).outerWidth();
		var perc = (currentLeft/totalWidth) * 100;
		var closestHandle = _this._getClosestHandle(perc);
		if(closestHandle != null)
		{
			var targetRadio = radios.eq(closestHandle),
				ctx = targetRadio.data('context');
			
			_this._updateValue(ctx);
		}
			
	},
	// Function to bind events to Different Slider Elements
	bindEvents: function(){
		var k = this,
			parentCont = k.node.next(),
			slider = $('._sliderBase', parentCont),
			radios = $('._sliderLap', parentCont);
		
		// Binding the Popovers if provided in the options
		if(k.options.lapTooltips.length == k.options.laps.length)
		{
			for(var  i = 0; i < radios.length; i++)
			{
				var ele = radios.eq(i),
					label = (ele.data('context')) ? ele.data('context').label : "";
				ele.popover({content: label, placement: "top", trigger: "hover", html: false, container: parentCont});
			}
		}
		
		
		
		// When the radios are clicked then changing the slider
		parentCont.on('click keydown', '._sliderLap', function(e){
			
			if (e.type == 'keydown' && e.keyCode !== 32) return;
			
			var ele = $(this),
				ctx = ele.data('context');
			
			if(ctx)
			{
				k._updateValue(ctx);
				if (!k.thumbAdded) 
					k._addThumb (ctx);

				radios.removeClass('_selected');
				$(this).addClass('_selected');
				
			}
		});
		
		
		k.node.on('change', function(e){
			var val = $(this).val(),
				perc = (val/k.options.max) * 100,
				closestHandle = k._getClosestHandle(perc);
			
			if(closestHandle != null)
			{
				var targetRadio = radios.eq(closestHandle),
					ctx = targetRadio.data('context');
				
				radios.removeClass('_selected');
				targetRadio.addClass('_selected');
				k.node.data('context').dirty=true;
				
			}
		});
		
		// When the slider itself is clicked
		parentCont.on('click', '._sliderBase', function(e){
			var totalWidth = $(this).outerWidth(),
				clickOffset = e.offsetX,
				perc = (clickOffset/totalWidth) * 100,
				closestHandle = k._getClosestHandle(perc);
			
			
			
			if(closestHandle != null)
			{
				var targetRadio = radios.eq(closestHandle),
					ctx = targetRadio.data('context');
				
				k._updateValue(ctx);
			}
			
			if (!k.thumbAdded) 
				k._addThumb (ctx);
		});
		
		
	},
	// Function to get the closest lap to the given value
	_getClosestHandle: function(perc){
		var k = this,
			lapsWd = k.node.data('context').cebSlider.lapWidth;
		
		if(lapsWd)
		{
			var closest = Math.abs(perc - lapsWd[0]),
				index = 0;
			for(var  i = 1; i < lapsWd.length; i++)
			{
				if(Math.abs(perc - lapsWd[i]) < closest)
				{
					closest = Math.abs(perc - lapsWd[i]);
					index = i;
				}
			}
			
			return index;
		}
		
		return null;
	},
	
	_animateThumb : function (ctx) {
		if (!this.thumb) return;
		var $thumb = $(this.thumb [0]);
		var leftOffsetFix = ctx.left - ($thumb.width()/2 - $thumb.find('._sliderInnerCircle').width());
		$thumb.animate ({left : leftOffsetFix});
	},
	
	// Function to fill the bar and update the input by triggering its change
	_updateValue: function(ctx, noTrigger){
		var k = this;
		
		k._animateThumb (ctx);

		if(!noTrigger)
		{
			k.node.val(ctx.value).trigger('change');
		}
	},
   
   options: {
		min: 0,
		max: 10,
		laps: [],
		lapTooltips: []
    }
};

if (typeof Object.create !== "function") {
    Object.create = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };
}

$.plugin = function (name, object) {
    $.fn[name] = function (options) {
        return this.each(function () {
            Object.create(object).init(options, this)
        });
    };
};

$.plugin('cebSlider', cebSlider_Methods);