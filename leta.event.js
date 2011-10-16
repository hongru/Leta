/**
 * Leta.event
 * @require [core]
 * @merged to [dom]
 */

(function (win, undefined) {
 
 	var $E = {};

	/* private vars */
	var reg_strip = /\..*/,
		reg_namespace = /[^\.]*(?=\..*)\.|.*/,
		registry = {},
		collected = {},
		__uid = 1,
		doc = document || {},
		root = doc.documentElement || {},
		W3C_MODEL = root['addEventListener'],
		eventSupport = W3C_MODEL ? 'addEventListener' : 'attachEvent';

	// 自定义events， 包括一些fix events 和custom events
	var customEvents = {
		'mouseenter': { base:'mouseover', condition: __check },
		'mouseleave': { base: 'mouseout', condition: __check },
		'mousewheel': { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' } // firefox 有区别
	};
	// 原生events
	// 如果不需严格检测的话可用 'onclick' in window 一类的方式
	var nativeEvents = {
		'click': 1,
		'dblclick': 1,
		'mouseup': 1,
		'mousedown': 1,
		'contextmenu': 1,
		'mousewheel': 1,
		'DOMMouseScroll': 1,
		'mouseover': 1,
		'mouseout': 1,
		'mousemove': 1,
		'selectstart': 1,
		'selectend': 1,
		'keydown': 1,
		'keyup': 1,
		'keypress': 1,
		'orientationchange': 1, // mobile
    	'touchstart': 1, 
		'touchmove': 1, 
		'touchend': 1, 
		'touchcancel': 1, // touch
    	'gesturestart': 1, 
		'gesturechange': 1, 
		'gestureend': 1, // gesture
    	'focus': 1, 
		'blur': 1, 
		'change': 1, 
		'reset': 1, 
		'select': 1, 
		'submit': 1, //form elements
    	'load': 1, 
		'unload': 1, 
		'beforeunload': 1, 
		'resize': 1, 
		'move': 1, 
		'DOMContentLoaded': 1, 
		'readystatechange': 1, //window
    	'error': 1, 
		'abort': 1, 
		'scroll': 1
		
	};

	/* private metheds */
	function __check (event) {
		var related = event.relatedTarget;
		if (!related) {
			return (related === null);
		}
		return (related != this && related.prefix != 'xul' && !/document/.test(this.toString()) && _isDescendant(this, related));
	}
	// 是否父子关系
	function _isDescendant (parent, child) {
		var node = child.parentNode;
		while (node !== null) {
			if (node == parent) {
				return true;
			}
			node = node.parentNode;
		}
	}
	// delegate
	function _dele (selector, fn, args) {
		return function (e) {
			// context 'this' --> delegateElement
			var eles = (Leta.isString(selector) && Leta.isFunction(args)) ? args(selector, this) : selector;
			for (var target = e.target; target != this; target = target.parentNode) {
				for (var i = eles.length; i --; ) {
					if (eles[i] == target) {
						return fn.apply(target, arguments);
					}
				}
			}
		}
	}
	
	function _retrieveEvents (element) {
		var uid = _retrieveUid(element);
		return (registry[uid] = registry[uid] || {});
	}
	function _retrieveUid (obj, uid) {
		return (obj.__uid = uid && (uid + '::' + __uid ++) || obj.__uid || __uid ++);
	}
	
	// handler for custom or native
	function _customHandler (element, fn, type, condition, args) {
		return function (event) {
			if (condition ? condition.apply(this, arguments): W3C_MODEL ? true : event && event.propertyName == '_on'+type || !event) {
				event = event ? _fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event) : null;
				fn.apply(element, Array.protorype.slice.call(arguments, event ? 0 : 1).concat(args));
			}
		}
	}
	function _nativeHandler (element, fn, args) {
		return function (event) {
			event = _fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event);
			return fn.apply(element, [event].concat(args));
		}
	}

	var _listener = W3C_MODEL ? function (element, type, fn, add) {
		element[add ? 'addEventListener' : 'removeEventListener'](type, fn, false);
	} : function (element, type, fn, add, custom) {
		if (custom && add && element['_on' + custom] === null) {
			element['_on'+custom] = 0;
		}
		element[add ? 'attachEvent' : 'detachEvent']('on' + type, fn);
	}

	// orgType --> 'click.a'
	function _addListener (element, orgType, fn, args) {
		var type = orgType.replace(reg_strip, ''),
			events = _retrieveEvents(element),
			handlers = events[type] || (events[type] = {}),
			originalFn = fn,
			uid = _retrieveUid(fn, orgType.replace(reg_namespace, ''));

		if (handlers[uid]) {
			return element;
		}

		var custom = customEvents[type];
		if (custom) {
			// 如果是自定义或者fix event
			fn = custom.condition ? _customHandler(element, fn, type, custom.condition): fn;
			type = custom.base || type;
		}

		var isNative = nativeEvents[type];
		fn = isNative ? _nativeHandler(element, fn, args) : _customHandler(element, fn, type, false, args);
		isNative = W3C_MODEL || isNative;

		if (type == 'unload') {
			var org = fn;
			fn = function () {
				_removeListener(element, type, fn) && org();
			}
		}

		element[eventSupport] && _listener(element, isNative ? type : 'propertychange', fn, true, !isNative && type);
		handlers[uid] = fn;
		fn.__uid = uid;
		fn.__originalFn = fn;

		return type == 'unload' ? element : (collected[_retrieveUid(element)] = element);

	}

	// remove listener
	function _removeListener (element, orgType, handler) {
		var uid,
			names = orgType.replace(reg_namespace, ''),
			uids = names ? names.split('.') : [handler.__uid],
			i,
			events = _retrieveEvents(element),
			type = orgType.replace(reg_strip, '');

		if (!events || !events[type]) {
			return element;
		}

		function __destoryHandler(uid) {
			handler = events[type][uid];
			if (!handler) {
				return;
			}
			delete events[type][uid];
			if (element[eventSupport]) {
				type = customEvents[type] ? customEvents[type].base : type;
				var isNative = W3C_MODEL || nativeEvents[type];
				_listener(element, isNative ? type : 'propertychange', handler, false, !isNative && type);
			}
		}

		__destoryHandler(names);
		for (i = uids.length; i -- ; __destoryHandler(uids[i])) {}

		return element;
	}

	// fire event listener
	var _fireListener = W3C_MODEL ? function (isNative, type, element) {
		var evt = document.createEvent(isNative ? 'HTMLEvents' : 'UIEvents');
		evt[isNative ? 'initEvent': 'initUIEvent'](type, true, true, window, 1);
		element.dispatchEvent(evt);
	} : function (isNative, type, element) {
		isNative ? element.fireEvent('on'+type, document.createEventObject()) : element['_on'+type]++;
	};

	// fix events
	function _fixEvent (e) {
		var result = {};
		if (!e) {
			return result;
		}
		var type = e.type,
			target = e.target || e.srcElement;

		result.preventDefault = _fixEvent.preventDefault(e);
		result.stopPropagation = _fixEvent.stopPropagation(e);
		result.target = target && target.nodeType == 3 ? target.parentNode : target;

		if (~type.indexOf('key')) {
			// 键盘事件
			result.keyCode = e.which || e.keyCode;
		} else if (/click|mouse|menu/i.test(type)) {
			// 鼠标事件
			// 标准化右键点击 为 rightClick
			result.rightClick = e.which == 3 || e.button == 2;
			result.pos = {x: 0, y: 0};
			// 标准化clientX,clientY
			if (e.pageX || e.pageY) {
				result.clientX = e.pageX;
				result.clientY = e.pageY;
			} else if (e.clientX || e.clientY) {
				result.clientX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				result.clientY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			// 在mouseover和mouseout的时候relatedTarget
			/over|out/i.test(type) && (result.relatedTarget = e.relatedTarget || e[(type == 'mouseover' ? 'from' : 'to') + 'Element']);
		}

		for (var k in e) {
			if (!(k in result)) {
				result[k] = e[k];
			}
		}

		return result;
	}
	_fixEvent.preventDefault = function (e) {
		return function () {
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		}
	};
	_fixEvent.stopPropagation = function (e) {
		return function () {
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		}
	};

	/**
	 * public interface
	 */
	var on = function (element, events, fn, deleFn, args) {
		if (Leta.isObject(events) && !fn) {
			// matched sth. like this
			// ---------------
			// on(element, {
			//		'click': fn1,
			//		'mouseenter': fn2
			// })
			// ---------------
			for (var type in events) {
				events.hasOwnProperty(type) && on(element, type, events[type]);
			}
		} else {
			// 如果是delegate，第二个参数是delegate 的target，第三个参数是event types，以此类推
			var isDelegate = Leta.isString(fn);
			var types = (isDelegate ? fn : events).split(' ');
			fn = isDelegate ? _dele(events, deleFn, args) : fn;
			for (var i = types.length; i --; ) {
				_addListener(element, types[i], fn, Array.protorype.slice.call(arguments, isDelegate ? 4 : 3));
			}
		}

		return element;
	};

	var off = function (element, orgType, fn) {
		var k,
			m,
			i,
			type,
			events,
			isString = Leta.isString(orgType),
			names = isString ? orgType.replace(reg_namespace, ''),
			rm = _removeListener,
			attached = _retrieveEvents(element);

		names = names && names.split('.');
		if (isString && /\s/.test(orgType)) {
			orgType = orgType.split(' ');
			i = orgType.length - 1;
			while (off(element, orgType[i]) && i -- ) {}
			return element;
		}

		events = isString ? orgType.replace(reg_strip, '') : orgType;
		if (!attached || names || (isString && !attached[events])) {
			for (k in attached) {
				if (attached.hasOwnProperty(k)) {
					for (i in attached[k]) {
						for (m = names.length; m -- ; ) {
							attached[k].hasOwnProperty(i) && new RegExp('^' + names[m] + '::\\d*(\\..*)?$').test(i) && rm(element, [k, i].join('.'));
						}
					}
				}
			}
			return element;
		}

		if (Leta.isFunction(fn)) {
			rm(element, events, fn);
		} else if (names) {
			rm(element, orgType);
		} else {
			rm = events ? rm : off;
			type = isString && events;
			events = events ? (fn || attached[events] || events) : attached;
			for (k in events) {
				if (events.hasOwnProperty(k)) {
					rm(element, type || k, events[k]);
					delete events[k];
				}
			}
		}

		return element;
	};

	/* fire event */
	var fire = function (element, type, args) {
		var evt,
			k,
			i,
			m,
			types = type.split(' ');
		for (i = types.length; i -- ; ) {
			type = types[i].replace(reg_strip, '');
			var isNative = nativeEvents[type],
				hasNamespace = types[i].replace(reg_namespace, ''),
				handlers = _retrieveEvents(element)[type];
			if (hasNamespace) {
				hasNamespace = hasNamespace.split('.');
				for (k = hasNamespace.length; k -- ; ) {
					for (m in handlers) {
						handlers.hasOwnProperty(m) && new RegExp('^'+hasNamespace[k] + '::\\d*(\\..*)?$').test(m) && handlers[m].apply(element, [false].concat(args));
					}
				}
			} else if (!args && element[eventSupport]) {
				_fireListener(isNative, type, element);
			} else {
				for (k in handlers) {
					handlers.hasOwnProperty(k) && handlers[k].apply(element, [false].concat(args));
				}
			}
		}

		return element;
	};

	// 防止ie内存泄漏
	var __clean__ = function (el) {
		var uid = off(el).__uid;
		if (uid) {
			delete collected[uid];
			delete registry[uid];
		}
	};
	if (this['attachEvent']) {
		on(this, 'unload', function () {
			for (var k in collected) {
				collected.hasOwnProperty(k) && __clean__(collected[k]);
			}
			this.CollectGarbage && CollectGarbage();
		})
	}

	// merge to Leta
	Leta.extend($E, {
		on: on,
		off: off,
		fire: fire
	});
	Leta.extend({event: $E});
 
 })(window)
