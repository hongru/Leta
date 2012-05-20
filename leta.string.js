Leta.register('.str', function (L) {
    var $ = this;
	// escape
    this.escape = function(string) {
        return (''+string).replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/'/g, '&#x27;')
                          .replace(/\//g,'&#x2F;');
    };
    // template
    this.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
    };
    var noMatch = /.^/;
    var unescape = function(code) {
        return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
    };
 
    this.template = function (str, data) {
        var c  = $.templateSettings;
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
            'with(obj||{}){__p.push(\'' +
            str.replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(c.escape || noMatch, function(match, code) {
                    return "',$.escape(" + unescape(code) + "),'";
                })
                .replace(c.interpolate || noMatch, function(match, code) {
                    return "'," + unescape(code) + ",'";
                })
                .replace(c.evaluate || noMatch, function(match, code) {
                    return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
                })
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')
                .replace(/\t/g, '\\t')
                + "');}return __p.join('');";
                
        var func = new Function('obj', '$', tmpl);
        if (data) return func(data, $);
        
        return function (data) {
            return func.call(this, data, $);
        };
    }   
})