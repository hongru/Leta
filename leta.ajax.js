/* ajax */
/*
    Leta.ajax('/test', function (r) { console.log(r) })
    Leta.ajax({
        url: '/test',
        data: {a: 'a'},
        type: 'json', 
        method: 'GET',
        headers: { 'X-my-headers': 'sth' },
        contentType: 'application/json',
        charset: 'utf-8',
        jsonpCallback: 'callback',
        jsonpCallbackName: '?',
        success: function (r) {},
        complete: function (r) {},
        error: function (r) {}
    })

*/
;(function (win, undefined) {

    var getUniqueId = function () {
        var id = 0;
        return function () {
            return id ++;
        }
    }();

    var lastJsonpData, // 临时存储上一次jsonp 回调传来的参数
        head = document.getElementsByTagName('head')[0],
        defaultHeaders = {
            contentType: 'application/x-www-form-urlencoded',
            accept: {
                '*':  'text/javascript, text/html, application/xml, text/xml, */*',
                xml:  'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain',
                json: 'application/json, text/javascript',
                js:   'application/javascript, text/javascript'
            },
            requestedWith: 'XMLHttpRequest'
        };

    function isArray (o) {
        if (typeof Array.isArray == 'function') {
            return Array.isArray(o);
        } else {
            return (Object.prototype.toString.call(o) == '[object Array]');
        }
    }
    function urlappend(url, s) {
        return url + (/\?/.test(url) ? '&' : '?') + s;
    }
    function getJsonpData (data) {
        lastJsonpData = data;
    }
    function generateScript (url, charset) {
        if (charset == undefined) { charset = 'utf-8'; }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = charset;
        script.src = url;
        script.async = true;

        return script;
    } 
    function getXhr () {
        if (win['XMLHttpRequest']) {
            return new XMLHttpRequest()
        } else {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }
    }
    // 设置httpRequest 的headers
    function setHeaders (xhr, o) {
        var headers = o.headers || {};
        headers.Accept = headers.Accept || defaultHeaders.accept[o.type] || defaultHeaders.accept['*'];
        if (!o.crossOrigin && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = defaultHeaders.requestedWith;
        }
        if (!headers['Content-Type']) {
            headers['Content-Type'] = o.contentType || defaultHeaders.contentType;
        }

        for (var k in headers) {
            headers.hasOwnProperty(k) && xhr.setRequestHeader && xhr.setRequestHeader(k, headers[k]);
        }
    }
    // handle jsonp
    function toJsonp (o, succ, err, url) {
        var uid = getUniqueId(),
            cbkey = o.jsonpCallback || 'callback',
            cbval = o.jsonpCallbackName || ('_leta_' + uid),
            cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'), // 匹配jsonpCallbak
            match = url.match(cbreg),
            loaded = false;

        if (!!match) {
            if (match[3] == '?') {
                // 如果是 callback=? 的方式的话，默认我们自动生成的callbakName
                url = url.replace(cbreg, '$1=' + cbval);
            } else {
                cbval = match[3];
            }
        } else {
            // 没提供callback相关参数，使用默认
            url = urlappend(url, (cbkey + '=' + cbval));
        }
        // 临时存储 jsonp callback 执行时的参数，也就是我们要得结果
        win[cbval] = getJsonpData;

        var script = generateScript(url, o.charset);
        if (typeof script.onreadystatechange != 'undefined') {
            // fix IE onreadystatechange 无序的问题
            // http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
            script.event = 'onclick';
            script.htmlFor = script.id = ('_leta_'+uid);
        }
        script.onload = script.onreadystatechange = function () {
            if ((script['readyState'] && script['readyState'] != 'complete' && script['readyState'] != 'loaded') || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            script.onclick && script.onclick();
            o.success && o.success(lastJsonpData);
            lastJsonpData = undefined;
            head.removeChild(script);
            loaded = true;
        }

        head.appendChild(script);
    }

    // handle xhr 
    function handleXhrStateChange (xhr, succ, err) {
        return function () {
            if (xhr && xhr['readyState'] == 4) {
                // 20* 都是表示请求成功
                /**
                    200（成功）  服务器已成功处理了请求。通常，这表示服务器提供了请求的网页。
                    201（已创建）  请求成功且服务器已创建了新的资源。 
                    202（已接受）  服务器已接受了请求，但尚未对其进行处理。 
                    203（非授权信息）  服务器已成功处理了请求，但返回了可能来自另一来源的信息。 
                    204（无内容）  服务器成功处理了请求，但未返回任何内容。 
                    205（重置内容） 服务器成功处理了请求，但未返回任何内容。与 204 响应不同，此响应要求请求者重置文档视图（例如清除表单内容以输入新内容）。 
                    206（部分内容）  服务器成功处理了部分 GET 请求。
                */
                if (/^20\d$/.test(xhr.status)) {
                    succ(xhr);
                } else {
                    err(xhr);
                }
            }
        }
    }

    function getRequest (o, success, error) {
        var method = (o.method || 'GET').toUpperCase(),
            url = typeof o == 'string' ? o : o.url;
            data = (o.stringifyData !== false && o.data && typeof o.data != 'string') ? ajax.toQueryString(o.data) : (o.data || null);

            if (o.type == 'jsonp' && method == 'GET' && !!data) {
                url = urlappend(url, data);
                data = null;
            }

            if (o.type == 'jsonp') {
                return toJsonp(o, success, error, url);
            }

            // xhr 请求
            var xhr = getXhr();
            xhr.open(method, url, true);
            setHeaders(xhr, o);
            xhr.onreadystatechange = handleXhrStateChange(xhr, success, error);
            o.before && o.before(xhr);
            xhr.send(data);

            return xhr;
    }

    // Ajax 
    function Ajax (o, fn) {
        this.o = o;
        this.fn = fn || function () {};
        this.success = o.success;
        this.error = o.error;
        this.complete = o.complete;
        this.stringifyData = o.stringifyData;
        this.url = typeof o == 'string' ? o : o.url;
        this.timeout_timer = null;
        this.timeout = o.timeout;
        this.type = o.type || 'json';

        this.init(o, fn);
    }
    Ajax.prototype = {
        init: function (o, fn) {
            var _this = this;
            if (this.timeout) {
                this.timeout_timer = setTimeout(function () {
                    _this.abort();
                }, this.timeout);
            }

            // private
            function complete (resp) {
                _this.timeout && clearTimeout(_this.timeout_timer);
                _this.timeout_timer = null;
                !!_this.complete && _this.complete(resp);
            }
            function success (resp) {
                var r = resp.responseText;
                if (r) {
                    switch(_this.type) {
                        case 'json':
                            try {
                                resp = win.JOSN ? win.JSON.parse(r) : eval('('+ r +')');
                            } catch (e) {
                                return error(resp, 'reponse parse error', e);
                            }
                            break;
                        case 'js':
                            resp = eval(r);
                            break;
                        case 'html':
                            resp = r;
                            break;
                    }
                }

                !!fn && fn(resp);
                !!_this.success && _this.success(resp);

                complete(resp);
            }
            function error (resp, msg, err) {
                !!_this.error && _this.error(resp, msg, err);
                complete(resp);
            }

            this.request = getRequest(o, success, error);
        },
        //abort
        abort: function () {
            this.request.abort();
        },
        // retry
        retry: function () {
            this.init.call(this, this.o, this.fn);
        }
    }

    // API
    function ajax(o, fn) {
        return new Ajax(o, fn);
    }
    // static methods
    ajax.toQueryString = function (o) {
        var result = '',
            append = function (k, v) {
                result += (encodeURIComponent(k) + '=' + encodeURIComponent(v) + '&');
            };

        if (isArray(o)) {
            for (var i = 0; i < o.length; i ++) {
                append(o[i].name, o[i].value);
            }
        } else {
            for (var k in o) {
                if (!o.hasOwnProperty(k)) continue;
                var v = o[k];
                if (isArray(v)) {
                    for (var i = 0; i < v.length; i ++) {
                        append(k, v[i]);
                    }
                } else {
                    append(k, v);
                }
            }
        }

        return result.replace(/&$/, '').replace(/%20/g, '+');	
    }

    if (typeof Leta != 'undefined') {
        if (!!Leta.extend) { Leta.extend({ajax: ajax}) } else { Leta.ajax = ajax }
    } else {
        win.Leta = {};
        Leta.ajax = ajax;
    }
})(window);
