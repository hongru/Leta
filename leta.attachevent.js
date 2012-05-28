/**
 * attach event to $dom.proto
 */
 
;(function ($L, $D, $E) {
    
    function on (e, f) {
        return this.each(function (el) {
            $E.on(el, e, f);
        });
    }
    
    function off (e, f) {
        return this.each(function (el) {
            $E.off(el, e, f);
        });
    }
    
    function fire (e, args) {
        return this.each(function (el) {
            $E.fire(el, e, args);
        });
    }

    $L.extend($D.proto, {
        on: on,
        off: off,
        fire: fire
    });

})(Leta, Leta.$dom, Leta.event);
