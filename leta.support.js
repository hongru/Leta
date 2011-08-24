/**
 * leta.support.js
 * @require [leta.core]
 */
;(function (Leta, undefined) {
		
	var arrayCheckList = 'forEach,map,reduce,reduceRight,filter,every,some,indexOf,lastIndexOf'.split(','),
		arrayProto = Leta.arrayProto;
	
	var arrayCheckHash = {};
	for (var i = 0; i < arrayCheckList.length; i ++) {
		if (!!arrayProto[arrayCheckList[i]]) {
			arrayCheckHash[arrayCheckList[i]] = true;
		}
	}

	var $support ;

})(Leta)
