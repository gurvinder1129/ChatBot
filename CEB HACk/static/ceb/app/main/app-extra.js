if (! ('app' in window)) window['app'] = {};

app.config = {
 cookie_expiry: 604800, //1 week duration for saved settings
 storage_method: 2 //2 means use cookies, 1 means localStorage, 0 means localStorage if available otherwise cookies
};

app.settings = {
	is: function(item, status) {
		//such as app.settings.is('navbar', 'fixed')
		return (app.data.get('settings', item + '-' + status) == 1);
	},
	exists: function(item, status) {
		return (app.data.get('settings', item + '-' + status) !== null);
	},
	set: function(item, status) {
		app.data.set('settings', item + '-' + status, 1);
	},
	unset: function(item, status) {
		app.data.set('settings', item + '-' + status, -1);
	},
	remove: function(item, status) {
		app.data.remove('settings', item + '-' + status);
	},

	navbar_fixed: function(fix) {
		fix = fix || false;
		if (!fix && app.settings.is('sidebar', 'fixed')) {
			app.settings.sidebar_fixed(false);
		}

		var navbar = document.getElementById('navbar');
		if (fix) {
			if (!app.hasClass(navbar, 'navbar-fixed-top')) app.addClass(navbar, 'navbar-fixed-top');
			if (!app.hasClass(document.body, 'navbar-fixed')) app.addClass(document.body, 'navbar-fixed');

			app.settings.set('navbar', 'fixed');
		} else {
			app.removeClass(navbar, 'navbar-fixed-top');
			app.removeClass(document.body, 'navbar-fixed');

			app.settings.unset('navbar', 'fixed');
		}

		document.getElementById('app-settings-navbar').checked = fix;
	},


	breadcrumbs_fixed: function(fix) {
		fix = fix || false;
		if (fix && !app.settings.is('sidebar', 'fixed')) {
			app.settings.sidebar_fixed(true);
		}

		var breadcrumbs = document.getElementById('breadcrumbs');
		if (fix) {
			if (!app.hasClass(breadcrumbs, 'breadcrumbs-fixed')) app.addClass(breadcrumbs, 'breadcrumbs-fixed');
			if (!app.hasClass(document.body, 'breadcrumbs-fixed')) app.addClass(document.body, 'breadcrumbs-fixed');

			app.settings.set('breadcrumbs', 'fixed');
		} else {
			app.removeClass(breadcrumbs, 'breadcrumbs-fixed');
			app.removeClass(document.body, 'breadcrumbs-fixed');

			app.settings.unset('breadcrumbs', 'fixed');
		}
		document.getElementById('app-settings-breadcrumbs').checked = fix;
	},


	sidebar_fixed: function(fix) {
		fix = fix || false;
		if (!fix && app.settings.is('breadcrumbs', 'fixed')) {
			app.settings.breadcrumbs_fixed(false);
		}

		if (fix && !app.settings.is('navbar', 'fixed')) {
			app.settings.navbar_fixed(true);
		}

		var sidebar = document.getElementById('sidebar');
		if (fix) {
			if (!app.hasClass(sidebar, 'sidebar-fixed')) app.addClass(sidebar, 'sidebar-fixed');
			app.settings.set('sidebar', 'fixed');
		} else {
			app.removeClass(sidebar, 'sidebar-fixed');
			app.settings.unset('sidebar', 'fixed');
		}
		document.getElementById('app-settings-sidebar').checked = fix;
	},

	main_container_fixed: function(inside) {
		inside = inside || false;

		var main_container = document.getElementById('main-container');
		var navbar_container = document.getElementById('navbar-container');
		if (inside) {
			if (!app.hasClass(main_container, 'container')) app.addClass(main_container, 'container');
			if (!app.hasClass(navbar_container, 'container')) app.addClass(navbar_container, 'container');
			app.settings.set('main-container', 'fixed');
		} else {
			app.removeClass(main_container, 'container');
			app.removeClass(navbar_container, 'container');
			app.settings.unset('main-container', 'fixed');
		}
		document.getElementById('app-settings-add-container').checked = inside;


		if (navigator.userAgent.match(/webkit/i)) {
			//webkit has a problem redrawing and moving around the sidebar background in realtime
			//so we do this, to force redraw
			//there will be no problems with webkit if the ".container" class is statically put inside HTML code.
			var sidebar = document.getElementById('sidebar');
			app.toggleClass(sidebar, 'menu-min');
			setTimeout(function() {	app.toggleClass(sidebar, 'menu-min'); } , 0);
		}
	},

	sidebar_collapsed: function(collpase) {
		collpase = collpase || false;

		var sidebar = document.getElementById('sidebar');
		var main_content = document.getElementById('main_content');
		var icon = document.getElementById('sidebar-collapse').querySelector('[class*="icon-"]');
		var $icon1 = icon.getAttribute('data-icon1');//the icon for expanded state
		var $icon2 = icon.getAttribute('data-icon2');//the icon for collapsed state

		if (collpase) {
			app.addClass(sidebar, 'menu-min');
			app.addClass(main_content, 'move-left');
			app.removeClass(icon, $icon1);
			app.addClass(icon, $icon2);

			app.settings.set('sidebar', 'collapsed');
		} else {
			app.removeClass(sidebar, 'menu-min');
			app.removeClass(main_content, 'move-left');
			app.removeClass(icon, $icon2);
			app.addClass(icon, $icon1);

			app.settings.unset('sidebar', 'collapsed');
		}

	}
	/**
	select_skin : function(skin) {
	}
	*/
};


//check the status of something
app.settings.check = function(item, val) {
	if (! app.settings.exists(item, val)) return;//no such setting specified
	var status = app.settings.is(item, val);//is breadcrumbs-fixed? or is sidebar-collapsed? etc

	var mustHaveClass = {
		'navbar-fixed' : 'navbar-fixed-top',
		'sidebar-fixed' : 'sidebar-fixed',
		'breadcrumbs-fixed' : 'breadcrumbs-fixed',
		'sidebar-collapsed' : 'menu-min',
		'main-container-fixed' : 'container'
	};


	//if an element doesn't have a specified class, but saved settings say it should, then add it
	//for example, sidebar isn't .fixed, but user fixed it on a previous page
	//or if an element has a specified class, but saved settings say it shouldn't, then remove it
	//for example, sidebar by default is minimized (.menu-min hard coded), but user expanded it and now shouldn't have 'menu-min' class

	var target = document.getElementById(item);//#navbar, #sidebar, #breadcrumbs
	if (status != app.hasClass(target, mustHaveClass[item + '-' + val])) {
		app.settings[item.replace('-', '_') + '_' + val](status);//call the relevant function to mage the changes
	}
};






//save/retrieve data using localStorage or cookie
//method == 1, use localStorage
//method == 2, use cookies
//method not specified, use localStorage if available, otherwise cookies
app.data_storage = function(method, undefined) {
	var prefix = 'app.';

	var storage = null;
	var type = 0;

	if ((method == 1 || method === undefined) && 'localStorage' in window && window['localStorage'] !== null) {
		storage = app.storage;
		type = 1;
	}
	else if (storage == null && (method == 2 || method === undefined) && 'cookie' in document && document['cookie'] !== null) {
		storage = app.cookie;
		type = 2;
	}

	//var data = {}
	this.set = function(namespapp, key, value, undefined) {
		if (!storage) return;

		if (value === undefined) {//no namespapp here?
			value = key;
			key = namespapp;

			if (value == null) storage.remove(prefix + key);
			else {
				if (type == 1)
					storage.set(prefix + key, value);
				else if (type == 2)
					storage.set(prefix + key, value, app.config.cookie_expiry);
			}
		}
		else {
			if (type == 1) {//localStorage
				if (value == null) storage.remove(prefix + namespapp + '.' + key);
				else storage.set(prefix + namespapp + '.' + key, value);
			}
			else if (type == 2) {//cookie
				var val = storage.get(prefix + namespapp);
				var tmp = val ? JSON.parse(val) : {};

				if (value == null) {
					delete tmp[key];//remove
					if (app.sizeof(tmp) == 0) {//no other elements in this cookie, so delete it
						storage.remove(prefix + namespapp);
						return;
					}
				}

				else {
					tmp[key] = value;
				}

				storage.set(prefix + namespapp, JSON.stringify(tmp), app.config.cookie_expiry);
			}
		}
	};

	this.get = function(namespapp, key, undefined) {
		if (!storage) return null;

		if (key === undefined) {//no namespapp here?
			key = namespapp;
			return storage.get(prefix + key);
		}
		else {
			if (type == 1) {//localStorage
				return storage.get(prefix + namespapp + '.' + key);
			}
			else if (type == 2) {//cookie
				var val = storage.get(prefix + namespapp);
				var tmp = val ? JSON.parse(val) : {};
				return key in tmp ? tmp[key] : null;
			}
		}
	};


	this.remove = function(namespapp, key, undefined) {
		if (!storage) return;

		if (key === undefined) {
			key = namespapp;
			this.set(key, null);
		}
		else {
			this.set(namespapp, key, null);
		}
	};
};





//cookie storage
app.cookie = {
	// The following functions are from Cookie.js class in TinyMCE, Moxiecode, used under LGPL.

	/**
	 * Get a cookie.
	 */
	get: function(name) {
		var cookie = document.cookie, e, p = name + '=', b;

		if (!cookie)
			return;

		b = cookie.indexOf('; ' + p);

		if (b == -1) {
			b = cookie.indexOf(p);

			if (b != 0)
				return null;

		} else {
			b += 2;
		}

		e = cookie.indexOf(';', b);

		if (e == -1)
			e = cookie.length;

		return decodeURIComponent(cookie.substring(b + p.length, e));
	},

	/**
	 * Set a cookie.
	 *
	 * The 'expires' arg can be either a JS Date() object set to the expiration date (back-compat)
	 * or the number of seconds until expiration
	 */
	set: function(name, value, expires, path, domain, secure) {
		var d = new Date();

		if (typeof(expires) == 'object' && expires.toGMTString) {
			expires = expires.toGMTString();
		} else if (parseInt(expires, 10)) {
			d.setTime(d.getTime() + (parseInt(expires, 10) * 1000)); // time must be in miliseconds
			expires = d.toGMTString();
		} else {
			expires = '';
		}

		document.cookie = name + '=' + encodeURIComponent(value) +
			((expires) ? '; expires=' + expires : '') +
			((path) ? '; path=' + path : '') +
			((domain) ? '; domain=' + domain : '') +
			((secure) ? '; secure' : '');
	},

	/**
	 * Remove a cookie.
	 *
	 * This is done by setting it to an empty value and setting the expiration time in the past.
	 */
	remove: function(name, path) {
		this.set(name, '', -1000, path);
	}
};


//local storage
app.storage = {
	get: function(key) {
		return window['localStorage'].getItem(key);
	},
	set: function(key, value) {
		window['localStorage'].setItem(key, value);
	},
	remove: function(key) {
		window['localStorage'].removeItem(key);
	}
};






//count the number of properties in an object
//useful for getting the number of elements in an associative array
app.sizeof = function(obj) {
	var size = 0;
	for (var key in obj) if (obj.hasOwnProperty(key)) size++;
	return size;
};

//because jQuery may not be loaded at this stage, we use our own toggleClass
app.hasClass = function(elem, className) {
	return (' ' + elem.className + ' ').indexOf(' ' + className + ' ') > -1;
};
app.addClass = function(elem, className) {
 if (!app.hasClass(elem, className)) {
	var currentClass = elem.className;
	elem.className = currentClass + (currentClass.length ? ' ' : '') + className;
 }
};
app.removeClass = function(elem, className) {app.replaceClass(elem, className);};

app.replaceClass = function(elem, className, newClass) {
	var classToRemove = new RegExp(('(^|\\s)' + className + '(\\s|$)'), 'i');
	elem.className = elem.className.replace(classToRemove, function(match, p1, p2) {
		return newClass ? (p1 + newClass + p2) : ' ';
	}).replace(/^\s+|\s+$/g, '');
};

app.toggleClass = function(elem, className) {
	if (app.hasClass(elem, className))
		app.removeClass(elem, className);
	else app.addClass(elem, className);
};




//data_storage instance used inside app.settings etc
app.data = new app.data_storage(app.config.storage_method);
