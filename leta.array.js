/**
 * leta.array.js
 * @require [leta.core]
 */
;(function (Leta, undefined) {
	
	var $A = {};

	$A.each = $A.forEach = function (obj, iterator, context) {
		if (Leta.isNull(obj)) {return ;}
		if (Leta.arrayProto.forEach && obj.forEach === Leta.arrayProto.forEach) {
			obj.forEach(iterator, context);
		}
	}

})(Leta);
