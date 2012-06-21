/**
 * leta.array.js
 * @require [leta.core]
 */
;(function (Leta, undefined) {

    var $A = {};

    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        slice = arrayProto.slice,
        toString = objectProto.toString,
        hasOwnProperty = objectProto.hasOwnProperty,

        nativeForEach = arrayProto.forEach,
        nativeMap = arrayProto.map,
        nativeReduce = arrayProto.reduce,
        nativeFilter = arrayProto.filter,
        nativeEvery = arrayProto.every,
        nativeSome = arrayProto.some,
        nativeIndexOf = arrayProto.indexOf,
        nativeLastIndexOf = arrayProto.lastIndexOf;

    $A.each = $A.forEach = function (obj, iterator, context) {
        if (Leta.isNull(obj)) {return ;}
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            // array like
            for (var i = 0, l = obj.length; i < l; i ++) {
                if (iterator.call(context, obj[i], i, obj) === false) {
                    return ;
                }
            }
        } else {
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === false) {
                        return ;
                    }
                }
            }
        }
    };


    $A.map = function (obj, iterator, context) {
        var ret = [];
        if (nativeMap && obj.map === nativeMap) {
            return obj.map(iterator, context);
        }
        $A.each(obj, function (value, index, arr) {
            ret[ret.length] = iterator.call(context, value, index, arr);		
        });

        return ret;
    }


    /**
     * 判断一个list里面所有元素是否满足某iterator
     * @return {Boolean}
     */
    $A.every = $A.all = function (obj, iterator, context) {
        var ret = true;
        if (nativeEvery && obj.every === nativeEvery) {
            return obj.every(iterator, context);
        }
        $A.each(obj, function (value, index, arr) {
            if (!iterator.call(context, value, index, arr)) {
                return false;
            }
        })

        return ret;
    }


    /**
     * 判断是否存在一个元素满足iterator
     */
    $A.some = $A.any = function (obj, iterator, context) {
        var ret = false;
        if (nativeSome && obj.some === nativeSome) {
            return obj.some(iterator, context);
        }
        $A.each(obj, function (value, index, arr) {
            if (ret |= iterator.call(context, value, index, arr)) {
                return ret;
            }		
        })

        return ret;
    }


    $A.contains = $A.include = function (obj, target) {
        var ret  = false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
            return (obj.indexOf(target) != -1);
        }
        $A.any(obj, function (value) {
            if (ret = value === target) {
                return true;
            }		
        });

        return ret;
    }

    Leta.extend({array: $A});

})(Leta);
