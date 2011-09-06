/**
 * leta.fx.js
 * do animation of htmlElements
 * CSS3 animation & normal are compatible
 * @author horizon
 */

;(function (Leta, undefined) {
	
	var getStyle = (Leta.dom && Leta.dom.getStyle) 
					? Leta.dom.getStyle
					: function (prop, el) {
						return el.currentStyle ? el.currentStyle[prop] : document.defaultView.getComputedStyle(el, null).getPropertyValue(p);
					} ;
	
	/**
	 * set Selector
	 * create a FX wrap
	 */
	var fx = function (selector) {
		return new FX(fx.get(selector))
	};

	// config of fx 
	fx.CONFIG = {
		duration: 500
	};
	// css3 ease name
	fx.ease = {
		'in': 'ease-in',
		'out': 'ease-out',
		'in-out': 'ease-in-out',
		'snap': 'cubic-bezier(0,1,.5,1)'
	};
	// get element
	fx.get = function (selector) {
		if (Leta.isString(selector)) {
			return (document.getElementById(selector) || document.querySelectorAll(selector)[0]);
		}
	}

	Leta.extend({ fx: fx });

})(Leta)
