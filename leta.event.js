/**
 * Leta.event
 * @require [core]
 * @merged to [dom]
 */

(function (win, undefined) {
 
 	var $E = function () {
		var addEvent, removeEvent, guid = 1,
			// 把之前同一type的handler 临时存储
			storage = function (element, type, handler) {
				if (!handler.$$GUID) {
					handler.$$GUID = guid ++;
				}
				if (!element.events) {
					element.events = {};
				}
				var handlers = element.events[type];
				if (!handlers) {
					handlers = element.events[type] = {};
				}
			}
	}();
 
 })(window)
