/**
 * leta.dom
 * @require [core, event, array, object, string]
 */

(function (win, undefined) {
 
 	var dom = {};

	// pravite vars
	// \s*([>+~]) for selector symbol
	// \s*([*\w-]+) for tag
	// ?:#([\w-]+) for id
	// ?:\.([\w.-]+) for class
	var quickReg = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/i,
		doc = document,
		docEl = document.documentElement,
		_readyCallbacks = [];

	// private methods
	function _init () {
		var done = false,
			timer,
			callback;
		function doFn () {
			if (!done) {
				done = true;
				if (!Leta.isUndefined(timer)) {
					timer = win.clearTimeout(timer);
				}
				for (var i = 0, l = _readyCallbacks.length; i < l; i ++) {
					_readyCallbacks[i]();
				}
			}
		}
		// http://javascript.nwbox.com/IEContentLoaded/
		function scrollCheck () {
			try {
				docEl.doScroll('left');
			} catch(e) {
				timer = window.setTimeout(scrollCheck, 20);
				return;
			}
			doFn();
		}

		if (/loaded|complete/.test(doc.readyState)) {
			win.setTimeout(doFn, 0);
			return;
		}
		if (doc.addEventListener) {
			doc.addEventListener('DOMContentLoaded', doFn, false);
			doc.addEventListener('loaded', doFn, false); // 因为有done标志位，不会执行两次
		} else if (doc.attachEvent) {
			// doScroll 在iframe中有问题
			var topLevel = false;
			try {
				topLevel = (!win.frameElement);
			} catch(e) {}

			if (topLevel && docEl.doScroll) {
				scrollCheck();
			}
			doc.attachEvent('onload', doFn);

		}
	}

	function _splitSelector (selector) {
		var parts, result = [];
		if (Leta.isString(selector)) {
			while (!!selector) {
				parts = selector.match(quickReg);
				if (!parts[0]) {
					break;
				}
				result.push({
					'symbol': parts[1],
					'tag': (parts[2] || '').toLowerCase(),
					'id': parts[3],
					'class': (parts[4] ? parts[4].split('.') : undefined);
				});

				selector = selector.substring(parts[0].length);
			}
		}
		return result;
	}

	
	/* public methods */
	dom.create = function (selector, props) {
		var s = _splitSelector(selector)[0],
			tag = s.tag;
		if (!tag) {
			return null;
		}
		var e = doc.createElement(tag);
		if (!!s.id) {
			e.id = s.id;
		}
		if (!!s.class) {
			e.className = s.class.join(' ');
		}
		
		if (Leta.isPlainObject(props)) {
			for (var key in props) {
				e.setAttribute(key, props[key]);
			}
		}

		return e;
	};

	dom.ready = function (cb) {
		_readyCallbacks.push(cb);
	};

	/* merge package[event] to package[dom] */
	Leta.extend(dom, Leta.event);
	
 	Leta.extend({dom: dom});
	_init();

 })(window)
