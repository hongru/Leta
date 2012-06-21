/**
 * leta.object.js
 * @require [leta.core.js]
 * 
 */


;(function () {

    var $O = {};
    /**
     * ���
     * @param {object} �追���Ķ���
     * @return {object} ��������¶���
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
     * ��������
     * @method
     * @param {Object} ������Ķ���
     * @param {Function} ��ÿ��Ԫ��ִ�в�������
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
     * �������󣬲���ÿ��Ԫ�ذ��������㣬����������Object
     * @method
     * @param {Object} map����
     * @param {Function} ÿ��Ԫ��ִ������
     * @return {Object} ����ִ�����Ӻ���¶���
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
     * extend ��չ������ͬkey��ֱֵ�Ӹ���
     * @method
     * @param {Object} ��չĿ��
     * @param {Object} Դ
     * @param {Boolean} �Ƿ񸲸���������
     * @return {Object} ��չ���Ŀ�����
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
     * ����չ���󣬵�������������Ҳ�Ƕ���ʱ���ݹ��ȥ��չ�����ǽ���������ֱ�Ӹ���
     * @method deepExtend
     * @param {Object} ��չĿ��
     * @param {Object} ��չԴ
     * @param {Boolean} �Ƿ񸲸���������
     * @return {Object} �����չ���Ŀ�����
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
