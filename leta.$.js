/**
 * push to $
 */
;(function ($L) {
    $L.$ = function (sel, host) {
        var nodeList = [];
        if (!sel) { return null; }
        if (typeof sel !== 'string' && !sel.nodeType && typeof sel.length !== 'undefined') {
            nodeList = sel;
        } else if (sel.nodeType === 1) {
            nodeList = [sel];
        } else if (typeof sel === 'string') {
            nodeList = /^\s*<([^\s>]+)/.test(sel) ? $L.$dom.create(sel) : $L.$qsa(sel, host);
        }

        return $L.$dom(nodeList); 
    }
})(Leta);
