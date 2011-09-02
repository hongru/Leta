/**
 * leta.object.js
 * @require [leta.core.js]
 * 
 */


;(function () {

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

	/**
	 * 遍历对象
	 * @method
	 * @param {Object} 需遍历的对象
	 * @param {Function} 对每个元素执行操作函数
	 */
	$O.each = $O.forEach = function (obj, iterator) {
		var returnValue, key, item;
		if (Leta.isFunction(iterator)) {
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					item = obj[key];
					returnValue = iterator.call(obj, item, key);
					if (returnValue === false) {
						break;
					}
				}
			}
		}
		return obj;
	}
	/**
	 * 遍历对象，并对每个元素按算子运算，返回运算后的Object
	 * @method
	 * @param {Object} map对象
	 * @param {Function} 每个元素执行算子
	 * @return {Object} 遍历执行算子后的新对象
	 */
	$O.map = function (obj, iterator) {
		var key, item, ret = {};
		if (Leta.isFunction(iterator)) {
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					ret[key] = iterator(obj[key], key);
				}
			}
		}
		return ret;
	}
	/**
	 * extend 扩展对象，相同key的值直接覆盖
	 * @method
	 * @param {Object} 扩展目标
	 * @param {Object} 源
	 * @param {Boolean} 是否覆盖已有属性
	 * @return {Object} 扩展后的目标对象
	 */
	$O.extend = function (target, source, isOverwrite) {
		if (Leta.isUndefined(isOverwrite)) {
			isOverwrite = true;
		}
		for (var key in source) {
			if (!target.hasOwnProperty(key) || isOverwrite) {
				target[key] = source[key];
			}
		}
		return target;
	}

	/**
	 * 深扩展对象，当对象中有属性也是对象时，递归进去扩展而不是将整个对象直接覆盖
	 * @method deepExtend
	 * @param {Object} 扩展目标
	 * @param {Object} 扩展源
	 * @param {Boolean} 是否覆盖已有属性
	 * @return {Object} 深度扩展后的目标对象
	 */
	$O.deepExtend = function (target, source, isOverwrite) {
		if (Leta.isUndefined(isOverwrite)) {
			isOverwrite = true;
		}
		for (var key in source) {
			if (Leta.isPlainObject(source[key]) && Leta.isPlainObject(target[key])) {
				$O.deepExtend(target[key], source[key], isOverwrite);
			} else {
				if (!target.hasOwnProperty(key) || isOverwrite) {
					target[key] = source[key];
				}
			}
		}
		return target;
	}


	
	Leta.extend({
			object: $O
			})
 })()
