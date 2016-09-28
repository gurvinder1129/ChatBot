if (! ('app' in window)) window['app'] = {};
jQuery(function($) {
	//at some places we try to use 'tap' event instead of 'click' if jquery mobile plugin is available
	window['app'].click_event = $.fn.tap ? 'tap' : 'click';
});
	
	//Mayank -- Function to extract the delimeter from the Date/Date Format
	app.getDelimeter = function(format){
		var s = "abcdefghijklmnopqrstuvwxyz0123456789";
		for(var i = 0; i<format.length; i++){
			if(s.indexOf(format.charAt(i)) == -1)
				return format.charAt(i);
		}
	};

	app.extractDate = function(format, dateString){
		format = format.toLowerCase();
		var	formatArray = format.split(app.getDelimeter(format)),
		dateArray = dateString.split(app.getDelimeter(format)),
		date = {
			month : "",
			day : "",
			year : ""
		};
		
		var createDateObject = function(formatPart, datePart){
			if(formatPart == "dd")
			{
				date.day = datePart;
			}
			else if(formatPart == "mm")
			{
				date.month = datePart;
			}
			else{
				date.year = datePart;
			}
		};
		
		for(var i = 0; i < formatArray.length; i++){
			createDateObject(formatArray[i], dateArray[i]);
		}
		
		return date;
	};
	
	app.updateDateFormatInJSON = function(node){
		var nodeVal = node.data("bind");
		if(typeof nodeVal == "undefined") return;
		var nodeDate = node.val();
		var nodeFormat = (typeof node.attr("placeholder") == "string" && node.attr("placeholder") != "")? node.attr("placeholder").trim() : df_global;
		var context = node.data("context");
		
		//if (node.closest ('.cebwidget').attr ('widget-name') == 'GenericFilterWidget') return;
		var	dateJSON = (nodeDate != "")? app.extractDate(nodeFormat, nodeDate) : {};
		//console.log(dateJSON.month + "/" + dateJSON.date + "/" + dateJSON.year);
		context[nodeVal] = dateJSON.month + "/" + dateJSON.day + "/" + dateJSON.year;
	};
	
	app.stripScripts = function (s) {
        var div = document.createElement('div');
        div.innerHTML = s;
        var scripts = div.getElementsByTagName('script');
        var i = scripts.length;
		var flag = i > 0;
        while (i--) {
          scripts[i].parentNode.removeChild(scripts[i]);
        }
        return flag ? div.innerHTML : s;
     };

	app.stripScripts = function (s) {
        var div = document.createElement('div');
        div.innerHTML = s;
        var scripts = div.getElementsByTagName('script');
        var i = scripts.length;
		var flag = i > 0;
        while (i--) {
          scripts[i].parentNode.removeChild(scripts[i]);
        }
        return flag ? div.innerHTML : s;
     };


jQuery(function($) {
	
	//Array defining the locale to date format relation
	var delimiter = "-",
		date_format = [
			["ar","dd mm yyyy"],
			["nl_be","dd mm yyyy"],
			["fr_be","dd mm yyyy"],
			["pt_br","dd mm yyyy"],
			["fr_ca","dd mm yyyy"],
			["zh_cn","dd mm yyyy"],
			["zh_tw","dd mm yyyy"],
			["cs_cz","dd mm yyyy"],
			["da_dk","dd mm yyyy"],
			["en_us","mm dd yyyy"],
			["et_et","dd mm yyyy"],
			["fi_fi","dd mm yyyy"],
			["fr_fr","dd mm yyyy"],
			["de_de","dd mm yyyy"],
			["el_gr","dd mm yyyy"],
			["hu_hu","dd mm yyyy"],
			["is_is","dd mm yyyy"],
			["in_in","dd mm yyyy"],
			["en_gb","dd mm yyyy"],
			["it_it","dd mm yyyy"],
			["ja_jp","dd mm yyyy"],
			["ko_kr","dd mm yyyy"],
			["es_mx","dd mm yyyy"],
			["lv_lv","dd mm yyyy"],
			["lt_lt","dd mm yyyy"],
			["nl_nl","dd mm yyyy"],
			["no_no","dd mm yyyy"],
			["pl_pl","dd mm yyyy"],
			["pt_pt","dd mm yyyy"],
			["ro_ro","dd mm yyyy"],
			["ru_ru","dd mm yyyy"],
			["sr_sr","dd mm yyyy"],
			["sk_sk","dd mm yyyy"],
			["es_es","dd mm yyyy"],
			["sv_se","dd mm yyyy"],
			["th_th","dd mm yyyy"],
			["tr_tr","dd mm yyyy"],
			["en_au","dd mm yyyy"],
			["en_ca","dd mm yyyy"],
			["en_in","dd mm yyyy"],
			["en_za","dd mm yyyy"],
			["eo","dd mm yyyy"]
		];
	
	//app.click_event defined in app-elements.js
	app.handle_langDropDown(jQuery);
	app.handle_toggleLoginForgot(jQuery);
	app.handle_side_menu(jQuery);
	app.handle_top_menu(jQuery);
	//app.enable_search_ahead(jQuery);

	app.general_things(jQuery);//and settings


	app.widget_boxes(jQuery);
	app.widget_reload_handler(jQuery);//this is for demo only, you can remove and have your own function, please see examples/widget.html
	/**
	//make sidebar scrollbar when it is fixed and some parts of it is out of view
	//>> you should include jquery-ui and slimscroll javascript files in your file
	//>> you can call this function when sidebar is clicked to be fixed
	$('.nav-list').slimScroll({
		height: '400px',
		distance:0,
		size : '6px'
	});
	*/
	
	//Code to set Global date format according to the locale set
	df_global = "mm dd yyyy".replace(/ /g, delimiter);
	//var tempVal = $("#langDropDown").val(), 
	var cookie = document.cookie,
	tempVal = (cookie != "") ? cookie.substring(cookie.indexOf("locale"), (cookie.indexOf(";", cookie.indexOf("locale")) != -1) ? cookie.indexOf(";", cookie.indexOf("locale")) : cookie.length) : "en_us",
	curr_locale = (tempVal != "") ? tempVal.substring(tempVal.indexOf('=')+1).toLowerCase() : "";
	if(curr_locale !=""){
		for(var i=0; i<date_format.length; i++){
			if(date_format[i][0] == curr_locale){
				df_global = date_format[i][1].replace(/ /g, delimiter);
				break;
			}
		}
	}

	//TODO: Temporary Hack for IE 8 - 11 for Ellipses for BUG ADMN-994.
	$userInfo = $('.user-info');
	$userInfo.css('overflow', 'visible');
	setTimeout(fnEllipsesIE, 100);
	function fnEllipsesIE() {$userInfo.css('overflow', 'hidden');}
	// ----- xxx Fix Ends xxx --- //
	
	app.handle_search_term(jQuery);
	
	// Hiding all SHL + Font Awesome icons from Screen Readers
	
	(function(){
		var $shlIcons = $('i[class^="shl-icon_"]'),
		$fontAwesomeIcons = $('i[class^="icon-"]'); 
		$shlIcons.attr ('aria-hidden', 'true');
		$fontAwesomeIcons.attr ('aria-hidden', 'true');
		if ($(document).attr("dir") == "rtl")
			app.switch_direction(jQuery);
	}());
	
	$('body').on ('click', 'a.app-prevent-default-link', function (e){
		e.preventDefault();
		return false;
	});
	
	$('body').on ('click', 'input[type="button"], button, a', function (e) {
		var $this = $(this);
		var id = $this.attr ('id');
		var href = $this.attr ('href');
		var text = $this.is ('input') ? $this.val() : $this.text();
		if (typeof ga === 'function'){
			if (typeof id === 'string') {
				if (typeof href === 'string' && href != "#")
					return;
				ga('require', id, 'linkid.js');
				ga('send', 'pageview');	
			}
		
			ga('send', 'event', 'General Event', 'Clicked', text);
		}
		
	});

});

app.bootstrap_alert = function(alertType, message) {
	
	var icon_class_name = '';
	this.$alert = $('<div></div>').addClass('alert alert-dismissable alert-' + alertType).attr ('role', 'alert');
	this.$btnDismiss = $('<button/>')
					.addClass('close')
					.attr('type', 'button')
					.attr('data-dismiss', 'alert')
					.attr('aria-hidden', 'true')
					.html('<i class="icon-remove-sign">&#160;</i>');
	
	
	switch (alertType) {
		case 'success' :  icon_class_name = 'shl-icon_success';
						  break;
		
		case 'danger' : icon_class_name = 'shl-icon_error';
			  			break;
			  			
		case 'warning' : icon_class_name = 'shl-icon_error';
						break;
	    
		case 'info' : icon_class_name = 'shl-icon_information';
						break;
	}
	
	this.$icon = $('<i/>').addClass(icon_class_name + ' ' + 'bigger-130').html('&#160;');
	this.$message = $('<span/>').addClass('message').text(message);

	this.$btnDismiss.appendTo(this.$alert);
	this.$icon.appendTo(this.$alert);
	this.$message.appendTo(this.$alert);

	return this.$alert;
};

app.analyticsConfig = function () {
	try {
		var env = $('html').data ('env'),
		defReturn = $.Deferred();
		if (env && typeof env === 'string') {
			$.getJSON (analyticsconfig_url, function (gaConfig) {
				if (typeof gaConfig [env] === 'object' && typeof gaConfig [env].tracker === "string" && gaConfig [env].active) 
					defReturn.resolve (gaConfig [env].tracker);
			});
		}
		return defReturn.promise();
	}
	catch (exception) {
		return false;
	}
};

app.setLocalizationLoaded = function () {
	app.localizationLoaded = true;
};

app.isBreakpoint = function ( alias ) {
    return $('.device-' + alias).is(':visible');
};

app.getCurrentDeviceType = function () {
	var is_XS = app.isBreakpoint ('xs'),
	is_SM = app.isBreakpoint ('sm'),
	is_MD = app.isBreakpoint ('md'),
	is_LG = app.isBreakpoint ('lg'),
	device = 'unknown device';
	
	if (is_XS || is_SM)
		device = 'Mobile';
	
	if (is_SM)
		device = 'Tablet';
	
	if (is_LG || is_MD)
		device = 'Desktop';
	
	return device;
};

app.handle_top_menu = function($) {
	if ($('#topbar').length > 0) {

		var $topMenu = $('#topbar').find('.nav-list');

		$('body').on(app.click_event, function(e) {
			var $openSubMenu = $topMenu.find('.submenu:visible'),
			$activeListItem = $openSubMenu.parent('li.open');

			$openSubMenu.slideUp(200);
			$activeListItem.removeClass('open');

		});

		$topMenu.find('li > a').on('click', function(e) {
			var $headerNavVisibleDropdown = $("#header div[role='navigation'] ul.app-nav li.open");
			$headerNavVisibleDropdown.removeClass('open');
		});
	}
};

app.handle_langDropDown = function($) {
	//var captchaLanguage= 'en_US';
	var $langDropDown = $('#header .language-wrap select');
	//$langDropDown.selectpicker({ style: 'btn-default btn-language', title: app.getLocalizedText ('header.language', 'Language...')});
	$langDropDown.cebdropdown();
	$('.authHeader .multiselect-container').find("input:radio").attr('checked', false);
	$langDropDown.siblings ('.btn-group.bootstrap-select').find ('button.selectpicker').attr ('aria-label', 'Select Language');
	var tempString = '';
	$.each($(location.search.split('&')), function(i, val) {
		if (val.substring(1).split('=')[0] === 'lang')
			tempString = val;
	});

	if (tempString.substring(1).split('=')[0] === 'lang') {
		//$langDropDown.selectpicker('val', tempString);
		$langDropDown.multiselect('select', tempString);
		$langDropDown.multiselect('refresh');
	}
	else
	{
		//check if the cookie is present
		//var $COOKIE = (document.cookie || '').split(/;\s*/).reduce(function(re, c) {
		//	  var tmp = c.match(/([^=]+)=(.*)/);
		//	  if (tmp) re[tmp[1]] = unescape(tmp[2]);
		//	  return re;
		//	}, {});
		//var selectedLang = $COOKIE['locale'];
		var selectedLang = readCookie('locale');
		if (selectedLang)
		{
			//$langDropDown.selectpicker('val', '?lang=' + selectedLang.toLowerCase());
			$langDropDown.multiselect('select', '?lang=' + selectedLang.toLowerCase());
			$langDropDown.multiselect('refresh');
		}
		else
		{
			//check if we can set the selection via captcha language, which comes from current locale
			if (!(typeof captchaLanguage === 'undefined'))
			{
				if (captchaLanguage)
					//$langDropDown.selectpicker('val', '?lang=' + captchaLanguage.toLowerCase());
					$langDropDown.multiselect('select', '?lang=' + captchaLanguage.toLowerCase());
					$langDropDown.multiselect('refresh');
			}
		}
	}
	$langDropDown.on('change', function() {
		var additionalParam = '';
		if ($('#flagfield').val())
			additionalParam = '&flagfield=' + $('#flagfield').val();

		location = this.options[this.selectedIndex].value + additionalParam;
		});
	//$langDropDown.selectpicker('show');
	$('[data-id="langDropDown"]').next().find('ul.dropdown-menu li:last').focusout(function(e) {
		$(this).parent().dropdown('toggle');
		if ($('input[name="j_username"]').length)
			$('input[name="j_username"]').focus();
	});
};

app.handle_toggleLoginForgot = function($) {
	var $forgotPasswordLink = $('.forgot-password-link'),
		$forgotPasswordPane = $('#forgot-box'),
		$backToLoginLink = $('.back-to-login-link'),
		$loginPane = $('#login'),
		CSSHideUtilClass = 'hidden';

	$forgotPasswordLink.on('click', function(e) {
		$('#flagfield').val('frgt');
		$loginPane.addClass(CSSHideUtilClass);
		$forgotPasswordPane.removeClass(CSSHideUtilClass);
	});

	$backToLoginLink.on(app.click_event, function(e) {
		$('#flagfield').val('');
		$forgotPasswordPane.addClass(CSSHideUtilClass);
		$loginPane.removeClass(CSSHideUtilClass);
		if ($('.login-errormsgs').is(':visible')) { $('.login-errormsgs').hide();}
	});
};
app.handle_side_menu = function($) {
	$('#menu-toggler').on(app.click_event, function() {
		if ($('#sidebar').length) {
			$('#sidebar').toggleClass('display');
		}
		if ($('#topbar').length) {
			$('#topbar').toggleClass('display');
		}
		$(this).toggleClass('display');
		return false;
	});
	//mini
	var $minimized = $('#sidebar').hasClass('menu-min');
	$('#sidebar-collapse').on(app.click_event, function() {
		$minimized = $('#sidebar').hasClass('menu-min');
		app.settings.sidebar_collapsed(!$minimized);//@ app-extra.js
	});

	//opening submenu
	$('.nav-list').on(app.click_event, function(e) {

		//check to see if we have clicked on an element which is inside a .dropdown-toggle element?!
		//if so, it means we should toggle a submenu
		var link_element = $(e.target).closest('a');
		if (!link_element || link_element.length == 0) return;//if not clicked inside a link element

		$minimized = $('#sidebar').hasClass('menu-min');

		if (! link_element.hasClass('dropdown-toggle')) {//it doesn't have a submenu return
			//just one thing before we return
			//if sidebar is collapsed(minimized) and we click on a first level menu item
			//and the click is on the icon, not on the menu text then let's cancel event and cancel navigation
			//Good for touch devices, that when the icon is tapped to see the menu text, navigation is cancelled
			//navigation is only done when menu text is tapped
			if ($minimized && app.click_event == 'tap' &&
				link_element.get(0).parentNode.parentNode == this /*.nav-list*/)//i.e. only level-1 links
			{
					var text = link_element.find('.menu-text').get(0);
					if (e.target != text && !$.contains(text, e.target))//not clicking on the text or its children
					  return false;
			}

			return;
		}
		//
		var sub = link_element.next().get(0);

		//if we are opening this submenu, close all other submenus except the ".active" one
		if (! $(sub).is(':visible')) {//if not open and visible, let's open it and make it visible
		  var parent_ul = $(sub.parentNode).closest('ul');
		  if ($minimized && parent_ul.hasClass('nav-list')) return;

		  parent_ul.find('> .open > .submenu').each(function() {
			//close all other open submenus except for the active one
			if (this != sub /*&& !$(this.parentNode).hasClass('active')*/) {
				$(this).slideUp(200).parent().removeClass('open');

				//uncomment the following line to close all submenus on deeper levels when closing a submenu
				//$(this).find('.open > .submenu').slideUp(0).parent().removeClass('open');
			}
		  });
		} else {
			//uncomment the following line to close all submenus on deeper levels when closing a submenu
			//$(sub).find('.open > .submenu').slideUp(0).parent().removeClass('open');
		}

		if ($minimized && $(sub.parentNode.parentNode).hasClass('nav-list')) return false;

		$(sub).slideToggle(200).parent().toggleClass('open');
		return false;
	 });
};

app.accessibleAccordion = function (accordion) {
	var triggers = $('[data-toggle="collapse"]', accordion);
	
	if (triggers.length) {
		
		accordion.attr ('aria-role', 'tablist');
		
		var setTriggerAria = function (_trigger, _section, param) {
			var state = param.state,
			href = _trigger.attr('href');
			
			switch (state) {
				case 'default' : {
					_trigger.attr ({
						'aria-role' : 'tab',
						'aria-selected' : false,
						'aria-controls' : href.split ('#')[1]
					});
					break;
				}
				case 'on' : {
					_trigger.attr ('aria-selected', true);
					break;
				}
				case 'off' : {
					_trigger.attr ('aria-selected', false);
					break;
				}
			}
		};
		
		var setSectionAria = function (_section, _trigger, param) {
			var state = param.state;
			
			switch (state) {
				case 'default' : {
					_section.attr ({
						'aria-expanded' : false,
						'aria-role' : 'tabpanel',
						'aria-hidden' : true,
						'aria-labelledby' : _trigger.attr ('id')
					});
				} 
				case 'on' : {
					_section.attr ({
						'aria-expanded' : true,
						'aria-hidden' : false,
					});
					break;
				}
				case 'off' : {
					_section.attr ({
						'aria-expanded' : false,
						'aria-hidden' : true,
					});
					break;
				}
			}
			
		};
		
		$.each (triggers, function (index, trigger){
			trigger = $(trigger);
			var href = trigger.attr('href');
			if (href && href !== '#') {
				(function(){
					var section = $(href);
					setTriggerAria (trigger, section, {state : 'default'});
					setSectionAria (section, trigger, {state: 'default'});
					
					if (section.is (':visible')) {
						$(trigger).attr ({
							'aria-expanded': true,
							'aria-selected' : true
						});
					}
					
					section.on ('show.bs.collapse', function (){
						setTriggerAria (trigger, section, {state : 'on'});
						setSectionAria (section, trigger, {state: 'on'});
					});
					
					section.on ('hide.bs.collapse', function (){
						setTriggerAria (trigger, section, {state : 'off'});
						setSectionAria (section, trigger, {state: 'off'});
					});
				}());
			}
		});
	}
};

app.convertToServerdate = function(date){
	if (date) {
		var _date  = '';
		if(date.substring(1,5).toLowerCase() === "date")
			_date = new Date(parseInt(date.substr(6)));
		else
			_date = new Date(date);
		if(typeof(_date) === 'object'){
			_date = _date.toServerString();
			_date = _date.substring(0, 10);
		}
		return _date;
	}
};

app.queryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = pair[1];
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]], pair[1] ];
	      query_string[pair[0]] = arr;
	    } else {
	      query_string[pair[0]].push(pair[1]);
	    }
	  } 
	    return query_string;
}();

app.showModalMessage = function (title, body) {
	var modal = $('#generic-updates-modal');
	$('#generic-updates-modal-label', modal).text (title);
	$('#generic-updates-modal-body', modal).text (body);
	modal.modal('show');
	return modal;
};


app.loadWidgetByName = function (name, container, widgetLoadUrl) {
	if (name) {
		var loadUrl = widgetLoadUrl + '?name=' + name;
    	container.load(loadUrl, null, function() {
    		loadCEBWidgets(container, false);
        });
	}
};

app.general_things = function($) {
 $('.app-nav [class*="icon-animated-"]').closest('a').on('click', function() {
	var icon = $(this).find('[class*="icon-animated-"]').eq(0);
	var $match = icon.attr('class').match(/icon\-animated\-([\d\w]+)/);
	icon.removeClass($match[0]);
	$(this).off('click');
 });

 $('.nav-list .badge[title],.nav-list .label[title]').tooltip({'placement': 'right'});



 //simple settings

 $('#app-settings-btn').on(app.click_event, function() {
	$(this).toggleClass('open');
	$('#app-settings-box').toggleClass('open');
 });


 $('#app-settings-navbar').on('click', function() {
	app.settings.navbar_fixed(this.checked);//@ app-extra.js
 }).each(function() {this.checked = app.settings.is('navbar', 'fixed');});

 $('#app-settings-sidebar').on('click', function() {
	app.settings.sidebar_fixed(this.checked);//@ app-extra.js
 }).each(function() {this.checked = app.settings.is('sidebar', 'fixed');});

 $('#app-settings-breadcrumbs').on('click', function() {
	app.settings.breadcrumbs_fixed(this.checked);//@ app-extra.js
 }).each(function() {this.checked = app.settings.is('breadcrumbs', 'fixed');});

 $('#app-settings-add-container').on('click', function() {
	app.settings.main_container_fixed(this.checked);//@ app-extra.js
 }).each(function() {this.checked = app.settings.is('main-container', 'fixed');});

 //Switching to RTL (right to left) Mode
 $('#app-settings-rtl').removeAttr('checked').on('click', function() {
	app.switch_direction(jQuery);
 });


 $('#btn-scroll-up').on(app.click_event, function() {
	var duration = Math.min(400, Math.max(100, parseInt($('html').scrollTop() / 3)));
	$('html,body').animate({scrollTop: 0}, duration);
	return false;
 });

  try {
	$('#skin-colorpicker').app_colorpicker();
  } catch (e) {}

  $('#skin-colorpicker').on('change', function() {
	var skin_class = $(this).find('option:selected').data('skin');

	var body = $(document.body);
	body.removeClass('skin-1 skin-2 skin-3');


	if (skin_class != 'default') body.addClass(skin_class);

	if (skin_class == 'skin-1') {
		$('.app-nav > li.grey').addClass('dark');
	}
	else {
		$('.app-nav > li.grey').removeClass('dark');
	}

	if (skin_class == 'skin-2') {
		$('.app-nav > li').addClass('no-border margin-1');
		$('.app-nav > li:not(:last-child)').addClass('light-pink').find('> a > [class*="icon-"]').addClass('pink').end().eq(0).find('.badge').addClass('badge-warning');
	}
	else {
		$('.app-nav > li').removeClass('no-border margin-1');
		$('.app-nav > li:not(:last-child)').removeClass('light-pink').find('> a > [class*="icon-"]').removeClass('pink').end().eq(0).find('.badge').removeClass('badge-warning');
	}

	if (skin_class == 'skin-3') {
		$('.app-nav > li.grey').addClass('red').find('.badge').addClass('badge-yellow');
	} else {
		$('.app-nav > li.grey').removeClass('red').find('.badge').removeClass('badge-yellow');
	}
 });

};



app.widget_boxes = function($) {
	$(document).on('hide.bs.collapse show.bs.collapse', function(ev) {
		var hidden_id = ev.target.getAttribute('id');
		$('[href*="#' + hidden_id + '"]').find('[class*="icon-"], [class*="shl-icon_"]').each(function() {
			var $icon = $(this);

			var $match;
			var $icon_down = null;
			var $icon_up = null;
			if (($icon_down = $icon.attr('data-icon-show'))) {
				$icon_up = $icon.attr('data-icon-hide');
			}
			else if ($match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/)) {
				$icon_down = 'icon-' + $match[1] + '-down';
				$icon_up = 'icon-' + $match[1] + '-up';
			}

			if ($icon_down) {
				if (ev.type == 'show') $icon.removeClass($icon_down).addClass($icon_up);
					else $icon.removeClass($icon_up).addClass($icon_down);

				return false;//ignore other icons that match, one is enough
			}

		});
	});


	$(document).on('click.app.widget', '[data-action]', function(ev) {
		ev.preventDefault();

		var $this = $(this);
		var $action = $this.data('action');
		var $box = $this.closest('.widget-box');

		if ($box.hasClass('ui-sortable-helper')) return;

		if ($action == 'collapse') {
			var event_name = $box.hasClass('collapsed') ? 'show' : 'hide';
			var event_complete_name = event_name == 'show' ? 'shown' : 'hidden';


			var event;
			$box.trigger(event = $.Event(event_name + '.app.widget'));
			if (event.isDefaultPrevented()) return;

			var $body = $box.find('.widget-body');
			var $icon = $this.find('[class*=icon-]').eq(0);
			var $match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/);
			var $icon_down = 'icon-' + $match[1] + '-down';
			var $icon_up = 'icon-' + $match[1] + '-up';

			var $body_inner = $body.find('.widget-body-inner');
			if ($body_inner.length == 0) {
				$body = $body.wrapInner('<div class="widget-body-inner"></div>').find(':first-child').eq(0);
			} else $body = $body_inner.eq(0);


			var expandSpeed = 300;
			var collapseSpeed = 200;

			if (event_name == 'show') {
				if ($icon) $icon.addClass($icon_up).removeClass($icon_down);
				$box.removeClass('collapsed');
				$body.slideUp(0 , function() {$body.slideDown(expandSpeed, function() {$box.trigger(event = $.Event(event_complete_name + '.app.widget'));});});
			}
			else {
				if ($icon) $icon.addClass($icon_down).removeClass($icon_up);
				$body.slideUp(collapseSpeed, function() {$box.addClass('collapsed');$box.trigger(event = $.Event(event_complete_name + '.app.widget'));});
			}


		}
		else if ($action == 'close') {
			var event;
			$box.trigger(event = $.Event('close.app.widget'));
			if (event.isDefaultPrevented()) return;

			var closeSpeed = parseInt($this.data('close-speed')) || 300;
			$box.hide(closeSpeed, function() {$box.trigger(event = $.Event('closed.app.widget'));$box.remove();});
		}
		else if ($action == 'reload') {
			var event;
			$box.trigger(event = $.Event('reload.app.widget'));
			if (event.isDefaultPrevented()) return;

			$this.blur();

			var $remove = false;
			if ($box.css('position') == 'static') {$remove = true; $box.addClass('position-relative');}
			$box.append('<div class="widget-box-overlay"><i class="icon-spinner icon-spin icon-2x white"></i></div>');

			$box.one('reloaded.app.widget', function() {
				$box.find('.widget-box-overlay').remove();
				if ($remove) $box.removeClass('position-relative');
			});

		}
		else if ($action == 'settings') {
			var event = $.Event('settings.app.widget');
			$box.trigger(event);
		}

	});
};


app.widget_reload_handler = function($) {
	//***default action for reload in this demo
	//you should remove this and add your own handler for each specific .widget-box
	//when data is finished loading or processing is done you can call $box.trigger('reloaded.app.widget')
	$(document).on('reload.app.widget', '.widget-box', function(ev) {
		var $box = $(this);
		//trigger the reloaded event after 1-2 seconds
		setTimeout(function() {
			$box.trigger('reloaded.app.widget');
		}, parseInt(Math.random() * 1000 + 1000));
	});


	//you may want to do something like this:
	/**
	$('#my-widget-box').on('reload.app.widget', function(){
		//load new data
		//when finished trigger "reloaded"
		$(this).trigger('reloaded.app.widget');
	});
	*/
};



//search box's dropdown autocomplete
/*app.enable_search_ahead = function($) {
	app.variable_US_STATES = ['Basic Computer Literacy', '.NET Framework 4.0', 'Adobe InDesign CS5', 'Adobe Photoshop CS5', 'ASP.NET 4.0', 'C# 5.0', 'Computer Fundamentals - Mac OS X 10.8', 'Computer Fundamentals - Windows 7', 'Data Entry Alphanumeric', 'Java 6', 'Javascript', 'Math Fundamentals', 'Microsoft Excel 2010', 'Microsoft PowerPoint 2010', 'Microsoft SQL Server 2012', 'Microsoft Windows Server 2012', 'Microsoft Word 2010', 'Programming Concepts', 'Split Screen Typing', 'Written English', 'DB2 Administration (zOS)'];
	try {
		$('#nav-search-input').typeahead({
			source: app.variable_US_STATES,
			updater: function(item) {
				$('#nav-search-input').focus();
				return item;
			}
		});
	} catch (e) {}
};*/

app.handle_search_term = function($){
	$('#nav-search-input').focus();
	$('#nav-search-input').keydown(function(e) {
		var keycode = (e.keyCode ? e.keyCode : e.which);
	    if (keycode == 13) {
	    	var srchText = $('#nav-search-input').val();
	    	if (srchText && srchText.trim().length > 0){
	    		sessionStorage.globalSearchTerm = srchText;
	    		window.location.href = gSearchUrl;// + '?term=' + encodeURIComponent(srchText);
	    	}
	    }
	});
	$('#btn-search-input').click(function(e) {
	    	var srchText = $('#nav-search-input').val();
	    	if (srchText && srchText.trim().length > 0){
	    		sessionStorage.globalSearchTerm = srchText;
	    		window.location.href = gSearchUrl;// + '?term=' + encodeURIComponent(srchText);
	    	}
	});
};


app.isDataTable = function ( nTable )
{
    var settings = $.fn.dataTableSettings;
    for ( var i=0, iLen=settings.length ; i<iLen ; i++ )
    {
        if ( settings[i].nTable == nTable )
        {
            return true;
        }
    }
    return false;
};

app.swap_classes = function (class1, class2) {
	$(document.body)
	 .find('.' + class1).removeClass(class1).addClass('tmp-rtl-' + class1)
	 .end()
	 .find('.' + class2).removeClass(class2).addClass(class1)
	 .end()
	 .find('.tmp-rtl-' + class1).removeClass('tmp-rtl-' + class1).addClass(class2);
};

app.switch_column_floats = function () {
	if (app.getCurrentDeviceType() != 'Mobile' && app.getCurrentDeviceType() != 'Tablet')
	$('[class*="col-"]').css ('float', 'right');
};

app.switch_direction = function($) {
	var $body = $(document.body);
	$body
	.toggleClass('rtl')
	//toggle pull-right class on dropdown-menu
	.find('.dropdown-menu:not(.datepicker-dropdown,.colorpicker)').toggleClass('pull-right')
	.end()
	//swap pull-left & pull-right
	.find('.pull-right:not(.dropdown-menu,blockquote,.profile-skills .pull-right)').removeClass('pull-right').addClass('tmp-rtl-pull-right')
	.end()
	.find('.pull-left:not(.dropdown-submenu,.profile-skills .pull-left)').removeClass('pull-left').addClass('pull-right')
	.end()
	.find('.tmp-rtl-pull-right').removeClass('tmp-rtl-pull-right').addClass('pull-left')
	.end()
	.find('.chosen-container').toggleClass('chosen-rtl')
	.end();

	//app.switch_column_floats();

	function swap_styles(style1, style2, elements) {
		elements.each(function() {
			var e = $(this);
			var tmp = e.css(style2);
			e.css(style2, e.css(style1));
			e.css(style1, tmp);
		});
	}

	app.swap_classes('align-left', 'align-right');
	app.swap_classes('no-padding-left', 'no-padding-right');
	app.swap_classes('arrowed', 'arrowed-right');
	app.swap_classes('arrowed-in', 'arrowed-in-right');
	app.swap_classes('messagebar-item-left', 'messagebar-item-right');//for inbox page
	app.swap_classes('shl-icon_nav_next', 'shl-icon_nav_prev');//for Test Driver nav.
	app.swap_classes('margin-left-10', 'margin-right-10');
	app.swap_classes ('shl-icon_arrow_small_right', 'shl-icon_arrow_small_left');
	app.swap_classes ('margin-left-third', 'margin-right-third');
	app.swap_classes ('margin-left-1', 'margin-right-1');

	//redraw the traffic pie chart on homepage with a different parameter
	var placeholder = $('#piechart-placeholder');
	if (placeholder.size() > 0) {
		var pos = $(document.body).hasClass('rtl') ? 'nw' : 'ne';//draw on north-west or north-east?
		placeholder.data('draw').call(placeholder.get(0) , placeholder, placeholder.data('chart'), pos);
	}
};


// Utility

$.fn.exists = function() {
    return this.length !== 0;
};

var closeEditableFields = function () {
	$('.editable-field-input-elem:visible').each (function (index, elem){
		var text = $.trim ($(elem).val());
		var originalText = $(elem).attr ('data-original');
		var prev = $(elem).prev();
		$(elem).remove();
		text = text.trim();
		text = text == '' ? originalText : text;
		prev.find ('.editable-title').text (text);
		prev.show();
	});
};

$.fn.editableField = function (options) {
	var elem = $(this);
	var txt = elem.text();
	var iconHTML = '<span class="edit-icon margin-left-third" style="font-size: 70%"><i class="shl-icon_edit"></i></span>';
	elem.html ('');
	elem.append ('<span class = "editable-title">' + txt+ '</span>');
	elem.append (iconHTML);
	elem.on ('click', function (e){
		var initialText = $.trim (elem.text()); 
		var $input = $('<input />').attr ({
			type: 'text',
			placeholder: options.placeholder || '',
			value: initialText,
			maxlength: options.maxlength || '',
			dataOriginal : initialText
		}).addClass ('form-control editable-field-input-elem ' + options.cssClasses || '').css ('padding-left', '10px').on ('click', function (e){
			e.stopPropagation();
			return false;
		}).on ('keyup', function (e){
			var keycode = (e.keyCode ? e.keyCode : e.which);
		    if (keycode == 13) {closeEditableFields ();}
		}).on ('change', options.onEditComplete || null);
		$input.insertAfter (elem.hide());
		return false;
	});
};

$(document).on ('click', function (e){
	closeEditableFields ();
});

Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
};

$.fn.clearVal = function (){
	$(this).val ('');
};

$.fn.forceNumericOnly =
	function()
	{
	    return this.each(function()
	    {
	        $(this).keydown(function(e)
	        {
	            var key = e.charCode || e.keyCode || 0;
	            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
	            // home, end, period, and numpad decimal
	            return (
	                key == 8 || 
	                key == 9 ||
	                key == 13 ||
	                key == 46 ||
	                key == 110 ||
	                (key >= 35 && key <= 40) ||
	                (key >= 48 && key <= 57) ||
	                (key >= 96 && key <= 105));
	        });
	    });
	};

app.converToMixCase = function(array){
	var _output = ''; 
	var parts = array.split (' ');
	if (parts.length) {
		$.each (parts, function (pindex, part){
			if(($.trim(part)).length){
				part = String (($.trim(part))).toLowerCase();
				part = part.substring(0, 1).toUpperCase() + part.substring(1);
				_output = _output + " " + part;
			}
		});
		}
	return _output;
};
	
Array.prototype.getUnique = function(){
	    var inputArray = this;
		var outputArray = [];
	    for (var i = 0; i < inputArray.length; i++)
	    {
	    	if ((jQuery.inArray(app.converToMixCase($.trim (inputArray[i])), outputArray)) === -1)
	        {
	    		outputArray.push(app.converToMixCase($.trim (inputArray[i])));
	    		//outputArray.push(capitalizeFirstLetter(inputArray[i]));
	        }
	    }
	    return outputArray;
};

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};
	
navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem, 
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\bOPR\/(\d+)/)
        if(tem!= null) return 'Opera '+tem[1];
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

app.isCookieEnabled = function () {
	var cookieEnabled=(navigator.cookieEnabled)? true : false;
	if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled){
	    document.cookie = "testcookie";
	    cookieEnabled = (document.cookie.indexOf("testcookie")!= -1)? true : false;
	}
	return cookieEnabled;
};

app.widgetDirtyCheck = function(widgets){
	for (widget in widgets) {
		if(widgets[widget].dirty){
			return true;
		}
	}
	return false;
};

app.setDefaultDirtyBit = function(widgets){
	for(widget in widgets){
		widgets[widget].dirty = false;
	}
};

app.entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

app.contact="http://support.cebglobal.com/client?l=en_US&c=SHL_Support%3ASHL_Online";

app.escapeHtml = function (string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return app.entityMap[s];
	});
};

app.caseInsensitiveCompare = function (s1, s2) {
  var s1lower = s1.toLowerCase();
  var s2lower = s2.toLowerCase();
  return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0);
};

if (!String.prototype.startsWith) {
	try {
		Object.defineProperty(String.prototype, 'startsWith', {
		    enumerable: false,
		    configurable: false,
		    writable: false,
		    value: function (searchString, position) {
		      position = position || 0;
		      return this.lastIndexOf(searchString, position) === position;
		    }
		  });
	}
	catch (error) {}
}

if (!String.prototype.endsWith) {
	try {
		Object.defineProperty(String.prototype, 'endsWith', {
		    value: function (searchString, position) {
		      var subjectString = this.toString();
		      if (position === undefined || position > subjectString.length) {
		        position = subjectString.length;
		      }
		      position -= searchString.length;
		      var lastIndex = subjectString.indexOf(searchString, position);
		      return lastIndex !== -1 && lastIndex === position;
		    }
		  });
	}
	catch (error) {}
  
}

app.getLocalizedText = function(key, defaultText){
	/* var _text = $.i18n.prop(key).trim(),
		_dirtyText = '[' + key + ']';
	if(_text === _dirtyText){
		return defaultText;
	} */
	return defaultText;
};

// IE8 support for trim
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  };
}

app.supportsLocalStorage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
};

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

app.removeLoaderForWidget = function (widgetName) {
	$('[widget-name="' + widgetName + '"]').prev('.tc-source-loader').remove();
};

function deleteCookie (name, path) {
	document.cookie = name + '=;path=' + path + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

