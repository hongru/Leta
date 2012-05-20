/**
 * event.dispatch
 * better than batchBind
 */

;(function (win, undefined) {
    var $E = Leta.event;
    
    function bubbleTo (el, endEl, key) {
        if (!el || (el && el == document)) {
            return null;
        } else if (el == endEl || (el.getAttribute && el.getAttribute(key))) {
            return el;
        } else if (el.parentNode) {
            return bubbleTo(el.parentNode, endEl, key);
        } else {
            return null;
        }
    }

    function dispatch (el, type, key, distributor) {
        if (typeof key == 'object') {
            distributor = key;
            key = 'data-cmd';
        }
        $E.on(el, type, function (e) {
            var tar = bubbleTo(e.target, el, key); 
            if (tar) {
                var cmd = tar.getAttribute(key);
                distributor[cmd] && distributor[cmd].call && distributor[cmd].call(tar, e, tar);
            }
        });
    }

    Leta.extend($E, {
       bubbleTo: bubbleTo,
       dispatch: dispatch
    });

})(window);
