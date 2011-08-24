/**
 * leta.object.js
 * @require [leta.core.js]
 * 
 */

if (typeof Leta === 'undefined' 
		|| !Leta.$version) {
	throw new Error('leta.core.js 未载入');
}

(function () {
	var $O = {};
	/**
	 * 深拷贝
	 * @param {object} 需拷贝的对象
	 * @return {object} 拷贝后的新对象
	 */
	$O.clone = function (source) {
		var result;
		if (Leta.isArray(source)) {
			result = [];
			var resultLen = 0;
			for (var i=0, l=source.length; i < l; i++) {
				result[resultLen++] = $O.clone(source[i]);
			}
		} else if (Leta.isPlainObject(source)) {
			result = {};
			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					result[key] = $O.clone(source[key]);
				}
			}
		} else {
			result = source;
		}	

		return result;
	};



	
	Leta.extend({
			object: $O
			})
 })()
