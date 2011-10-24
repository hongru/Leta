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
					'classes': (parts[4] ? parts[4].split('.') : undefined)
				});

				selector = selector.substring(parts[0].length);
			}
		}
		return result;
	}

	function _hasClasses (el, classes) {
		if (el.className == '' || !el.className) {
			return false;
		}
		for (var i = 0; i < classes.length; i ++) {
			if (!_hasClass(el, classes[i])) {
				return false;
			}
		}
		return true;
	}

	function _hasClass (el, className) {
		return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
	}
	function _addClass (el, className) {
		if (!_hasClass(el, className)) {
			el.className += ' ' + className;
		}
		return el;
	}
	function _removeClass (el, className) {
		if (_hasClass(el, className)) {
			el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(\\s|$)'), ' ').replace(/\s$/, '');
		}
		return el;
	}

	function _match (el, condition) {
		if (!condition) {
			return true;
		}
		var tag = condition.tag,
			id = condition.id,
			classes = condition['classes'];

		return (el.nodeType === 1)
				&& !(tag && tag != el.tagName.toLowerCase())
				&& !(id && id != el.id)
				&& !(classes && !_hasClasses(el, classes));
	}
	// 是否有祖先关系
	function _isDescendant (el, ancestor) {
		while ((el = el.parentNode) && el != ancestor) {
			return el !== null;
		}
	}

	function _descendants (selector, referEl) {
		if (referEl.querySelectorAll) {
			return referEl.querySelectorAll(selector, referEl);
		}
		var results = [],
			elements = [referEl],
			selectorSplit = _splitSelector(selector),
			els;

		function _contains(o) {
			for (var i = results.length; i -- ; ) {
				if (results[i] === o) {
					return true;
				}
			}
			return false;
		}
		function __find (el, condition) {
			var c, ret = condition.id ? ((c = ((el && el.ownerDocument) || doc).getElementById(condition.id)) && _isDescendant(c, el)) ? [c] : [] : __toArray(el.getElementsByTagName(condition.tag || '*'));
			c = ret.length;

			if (c > 0 && (condition.id || condition.classes)) {
				while (c--) {
					if (!_match(ret[c], condition)) {
						ret.splice(c, 1);
					}
				}
			}
			return ret;
		}
		function __toArray(nodes) {
			try {
				return Array.prototype.slice.call(nodes, 0);
			} catch (e) {
				var arr = [];
				for (var i = 0, l = nodes.length; i < l; i ++) {
					arr.push(nodes[i]);
				}
				return arr;
			}
		}

		if (!selectorSplit.length) {
			selectorSplit = [{}];
		}

		for (var i = 0, l = selectorSplit.length; i < l; i ++) {
			var splitPart = selectorSplit[i];
			for (j = 0, lj = elements.length; j < lj; j ++) {
				var el = elements[j];
	
				// 支持 >+~
				switch (splitPart.symbol) {
					case '>':
						// 寻找儿子节点
						var children = el.childNodes; 
						for (var k = 0, lk = children.length; k < lk; k ++) { console.log(splitPart, children[k])
							_match(children[k], splitPart) && results.push(children[k]);
						}
						break;

					// 匹配所有弟弟（向后查找）
					case '~':
						while (el = el.nextSibling) {
							if (_match(el, splitPart)) {
								if (_contains(el)) {
									break;
								}
								results.push(el);
							}
						}
						break;

					// 匹配相邻弟弟
					case '+':
						while((el = el.nextSibling) && el.nodeType != 1) {} // 排除非htmlElement
						el && _match(el, splitPart) && results.push(el);
						break;

					default: 
						els = __find(el, splitPart);
						if (i > 0) {
							// 有多级选择器
							for (var m = 0, lm = els.length; m < lm; m ++) {
								!_contains(els[m]) && results.push(els[m])
							}
						} else {
							results = results.concat(els);
						}
						break;
				}
			}

			if (!results.length) {
				return [];
			}
			// 迭代查找
			elements = results.splice(0, results.length);
		}

		return elements;
	}

	// 查找满足条件的第一个
	function _find (el, prop, selector) {
		var condition = _splitSelector(selector)[0];
		while (el && (!_match(el, condition)) && (el = el[prop])) {} // 排除不符合条件的
		return el;
	} 
	function _findNext(el, prop, selector) {
		return _find(el[prop], prop, selector);
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
		if (!!s['classes']) {
			e.className = s['classes'].join(' ');
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
	var mergeEvents = {
		on: Leta.event.on,
		addEvent: Leta.event.on,
		bind: Leta.event.on,
		listen: Leta.event.on,
		delegate: Leta.event.on,

		off: Leta.event.off,
		removeEvent: Leta.event.off,
		unbind: Leta.event.off,
		unlisten: Leta.event.off,
		undelegate: Leta.event.off,

		emit: Leta.event.fire,
		trigger: Leta.event.fire
	};
	var shortcuts = [
		'blur',
		'change',
		'click',
		'dblclick',
		'error',
		'focus',
		'focusin',
		'focusout',
		'keydown',
		'keypress',
		'keyup',
		'load',
		'mousedown',
		'mouseenter',
		'mouseleave',
		'mouseout',
		'mouseover',
		'mouseup',
		'mousemove',
		'resize',
		'scroll',
		'select',
		'submit',
		'unload'
	];
	for (var i = 0; i < shortcuts.length; i ++) {
		var o = {};
		o[shortcuts[i]] = function (i) {
			return function () {
				var args = Array.prototype.slice.call(arguments, 0); 
				// args[0] htmlElment
				args.splice((Leta.isString(args[1]) ? 2 : 1), 0, shortcuts[i]);
				return Leta.event.on.apply(this, args);
			}
		}(i);
		Leta.extend(mergeEvents, o);
	}

	Leta.extend(dom, mergeEvents);

	/* merge dom selector */
	var domSelector = {
		get: function (selector, _doc) {
			return _descendants(selector, (_doc || doc));	 
		},
		one: function (selector, _doc) {
			return _descendants(selector, (_doc || doc))[0];	 
		},
		// 子孙
		descendants: _descendants,
		// 祖先
		ancestor: function (el, selector) {
			return _findNext(el, 'parentNode', selector);
		},
		// 毗邻弟弟
		next: function (el, selector) {
			return _findNext(el, 'nextSibling', selector);	  
		},
		// 毗邻哥哥
		prev:function (el, selector) {
			return _findNext(el, 'previousSibling', selector);
		},
		// 最大的哥哥
		first: function (el, selector) {
			el = el.parentNode.firstChild;
			return _find(el, 'nextSibling', selector);
		},
		// 最小的弟弟
		last: function (el, selector) {
			el = el.parentNode.lastChild;
			return _find(el, 'previousSibling', selector);
		}
	};
	Leta.extend(dom, domSelector);	


	/* merge style setter and getter */
	var byTag = 'getElementsByTagName',
		isIE = /msie/i.test(navigator.userAgent);

	var featureDetect = function () {
		var e = doc.createElement('p');
		e.innerHTML = '<a href="#x">x</a><table style="float:left"></table>';

		return {
			isHrefExtended: e[byTag]('a')[0]['getAttribute']('href') != '#x', // ie < 9
			isAutoTbody: e[byTag]('tbody').length != 0, // ie < 9
			computedStyle: doc.defaultView && doc.defaultView.getComputedStyle,
			cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat',
			transform: function () {
				var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
            	  for (i = 0; i < props.length; i++) {
           	     if (props[i] in e.style) return props[i]
          	    }	
			}()
		};

	}();

  function styleProperty(p) {
      (p == 'transform' && (p = featureDetect.transform)) ||
        (/^transform-?[Oo]rigin$/.test(p) && (p = featureDetect.transform + "Origin")) ||
        (p == 'float' && (p = featureDetect.cssFloat))
      return p ? camelize(p) : null
  }
  function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase()
    })
  }
  
	

	var getStyle = featureDetect.computedStyle ? 
		function (el, prop) {
			var value = null,
				computed = doc.defaultView.getComputedStyle(el, '');
			computed && (value = computed[prop]);

			return el.style[prop] || value;
		} : 

		(isIE && docEl.currentStyle) ?
		function (el, prop) {
			if (prop == 'opacity') {
				var val = 100;
				try {
					val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
				} catch (err1) {
					try {
						val = el.filters['alpha'].opacity;
					} catch (err2) {}
				}
				return val /100;
			}

			var value = el.currentStyle ? el.currentStyle[prop] null;
			return el.style[prop] || value;
		} : 
		function (el, prop) {
			return el.style[prop];
		};

	getStyle.viewport = function () {
		return {
			width: isIE ? docEl.clientWidth : win.innerWdith,
			height: isIE ? docEl.clientHeight : win.innerHeight
		};
	};
	getStyle.doc = function () {
		var vp = getStyle.viewport();
		return {
			width: Math.max(doc.body.scrollWidth, docEl.scrollWdith, vp.width),
			height: Math.max(doc.body.scrollHeight, docEl.scrollHeight, vp.height)
		};
	};

	var styleGS = {
		getStyle: function (el, prop) {
			if (!el) {
				return null;
			}
			if (el === doc || el === win) {
				var vp = (el === doc) ? getStyle.doc() : getStyle.viewport();
				return prop == 'width' ? vp.width : prop == 'height' ? vp.height : '';
			}
			return (prop = styleProperty(prop)) ? getStyle(el, prop) : null;
		},
		setStyle: function (el, prop, value) {
				  
		},
		css: function (el, prop, value) {
				 
		}
	}

 	Leta.extend({dom: dom});
	_init();

 })(window)
