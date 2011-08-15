/**
 * Leta
 * a poor javascript framework
 * @author horizon [hongru.chenhr@gmail.com]
 * {core}
 * module loader
 */
 
(function () {
    var isUndefined = function (o) {
        return typeof o === 'undefined';
    }
    var Leta = isUndefined(Leta) ? {} : Leta;

    /**
     * Method 使用模块的主函数
     * @param (String or Array) 要使用的模块名
     * @param (Function) *optional 加载模块后的回调函数
     * @param (Object) *optional 回调绑定对象
     * @return undefined
    **/ 
    var _module = function (moduleName, callback, context) {
        var argIndex=-1;
        
        // private method 监测moduleName,如果是url(http://*)路径形式，register后load
            function checkURL(src) {
                var dsrc = src;
                if (src && src.substring(0, 4) == "url(") {
                    dsrc = src.substring(4, src.length - 1);
                }
                var r = _module.registered[dsrc];
                return (!r && (!_module.__checkURLs || !_module.__checkURLs[dsrc]) && src && src.length > 4 && src.substring(0, 4) == "url(");
            }
            
        // 并发调用的模块列表
        var moduleNames = new Array();
        
        if (typeof(moduleName) != "string" && moduleName.length) {
            var _moduleNames = moduleName;
            for (var s=0;s<_moduleNames.length; s++) {
                if (_module.registered[_moduleNames[s]] || checkURL(_moduleNames[s])) {
                    moduleNames.push(_moduleNames[s]);
                }
            }
            moduleName = moduleNames[0];
            argIndex = 1;
        } else {
            while (typeof(arguments[++argIndex]) == "string") {
                if (_module.registered[moduleName] || checkURL(moduleName)) {
                    moduleNames.push(arguments[argIndex]);
                }
            }
        }
        callback = arguments[argIndex];
        context = arguments[++argIndex];
        
        if (moduleNames.length > 1) {
            var cb = callback;
            callback = function() {
                _module(moduleNames, cb, context);
            }
        }
        
        // 已经register过的模块hash
        var reg = _module.registered[moduleName];
        // 处理直接使用url的情况
        if (!_module.__checkURLs) _module.__checkURLs = {};
        if (checkURL(moduleName) && moduleName.substring(0, 4) == "url(") {
            moduleName = moduleName.substring(4, moduleName.length - 1);
            if (!_module.__checkURLs[moduleName]) {
                moduleNames[0] = moduleName;
                _module.register(moduleName, moduleName);
                reg = _module.registered[moduleName];
                var callbackQueue = _module.prototype.getCallbackQueue(moduleName);
                var cbitem = new _module.prototype.curCallBack(function() {
                    _module.__checkURLs[moduleName] = true;
                });
                callbackQueue.push(cbitem);
                callbackQueue.push(new _module.prototype.curCallBack(callback, context));
                callback = undefined;
                context = undefined;
            }
        }
        
        if (reg) {
            // 先处理被依赖的模块
            for (var r=reg.requirements.length-1; r>=0; r--) {
                if (_module.registered[reg.requirements[r].name]) {
                    _module(reg.requirements[r].name, function() {
                        _module(moduleName, callback, context); 
                    }, context);
                    return;
                }
            }
            
            // load每个模块
            for (var u=0; u<reg.urls.length; u++) {
                if (u == reg.urls.length - 1) {
                    if (callback) {
                        _module.load(reg.name, reg.urls[u], reg.asyncWait, new _module.prototype.curCallBack(callback, context));
                    } else {
                        _module.load(reg.name, reg.urls[u], reg.asyncWait);
                    }
                } else {
                    _module.load(reg.name, reg.urls[u], reg.asyncWait);
                }
            }
            
        } else {
            !!callback && callback.call(context);
        }
    }
        
    _module.prototype = {

        /**
         * Method 模块注册
         * @param (String or Object) 注册的模块名或者对象字面量
         * @param (Number) *optional 异步等待时间
         * @param (String or Array) 注册模块对应的url地址
         * @return (Object) 注册模块的相关信息对象字面量
        **/
        register : function(name, asyncWait, urls) {
            var reg;
            if (typeof(name) == "object") {
                reg = name;
                reg = new _module.prototype.__register(reg.name, reg.asyncWait, urls);
            } else {
                reg = new _module.prototype.__register(name, asyncWait, urls);
            }
            if (!_module.registered) _module.registered = { };
            if (_module.registered[name] && window.console) {
                window.console.log("Warning: Module named \"" + name + "\" was already registered, Overwritten!!!");
            }
            _module.registered[name] = reg;
            return reg;
        },
        // -- 注册模块的行动函数，并提供链式调用
        __register : function(_name, _asyncWait, _urls) {
            this.name = _name;
            var a=0;
            var arg = arguments[++a];

            if (arg && typeof(arg) == "number") { this.asyncWait = _asyncWait } else { this.asyncWait = 0 }
            this.urls = new Array();
            if (arg && arg.length && typeof(arg) != "string") {
                this.urls = arg;
            } else {
                for (a=a; a<arguments.length; a++) {
                    if (arguments[a] && typeof(arguments[a]) == "string") this.urls.push(arguments[a]);
                }
            }
            // 依赖列表
            this.requirements = new Array();
            
            this.require = function(resourceName) {
                this.requirements.push({ name: resourceName });
                return this;
            }
            this.register = function(name, asyncWait, urls) {
                return _module.register(name, asyncWait, urls);
            }
            return this;
        },

        defaultAsyncTime: 10,
        
        // -- 处理加载模块逻辑
        load: function(moduleName, scriptUrl, asyncWait, cb) {
            if (asyncWait == undefined) asyncWait = _module.defaultAsyncTime;
            
            if (!_module.loadedscripts) _module.loadedscripts = new Array();

             var callbackQueue = _module.prototype.getCallbackQueue(scriptUrl);
             callbackQueue.push(new _module.prototype.curCallBack( function() {
                 _module.loadedscripts.push(_module.registered[moduleName]);
                 _module.registered[moduleName] = undefined;
             }, null));
             if (cb) {
                 callbackQueue.push(cb);
                 if (callbackQueue.length > 2) return;
             }
            
             _module.loadScript(scriptUrl, asyncWait, callbackQueue);
        }, 
        
        // -- 加载模块行动函数
        loadScript : function(scriptUrl, asyncWait, callbackQueue) {
            var scriptNode = _module.prototype.createScriptNode();
            scriptNode.setAttribute("src", scriptUrl);
            if (callbackQueue) {
                // 执行callback队列
                var execQueue = function() {
                    _module.__callbackQueue[scriptUrl] = undefined;
                    for (var q=0; q<callbackQueue.length; q++) {
                        callbackQueue[q].runCallback();
                    }
                    // 重置callback队列
                    callbackQueue = new Array(); 
                }
                scriptNode.onload = scriptNode.onreadystatechange = function() {
                    if ((!scriptNode.readyState) || scriptNode.readyState == "loaded" || scriptNode.readyState == "complete" || scriptNode.readyState == 4 && scriptNode.status == 200) {
                        asyncWait > 0 ? setTimeout(execQueue, asyncWait) : execQueue();
                    }
                };
            }
            var headNode = document.getElementsByTagName("head")[0];
            headNode.appendChild(scriptNode);
        },    
        
        // -- 执行当前 callback
        curCallBack : function(_callback, _context) {
            this.callback = _callback;
            this.context = _context;
            this.runCallback = function() {
                !!this.context ? this.callback.call(this.context) : this.callback();
            };
        },
        // -- 获取callback列表
        getCallbackQueue: function(scriptUrl) {
            if (!_module.__callbackQueue) _module.__callbackQueue = {};    
             var callbackQueue = _module.__callbackQueue[scriptUrl];        
             if (!callbackQueue) callbackQueue = _module.__callbackQueue[scriptUrl] = new Array();
             return callbackQueue;
        },
        
        createScriptNode : function() {
            var scriptNode = document.createElement("script");
            scriptNode.setAttribute("type", "text/javascript");
            scriptNode.setAttribute("language", "Javascript");
            return scriptNode;    
        }
        
    }
    // 提供静态方法
    _module.register = _module.prototype.register;
    _module.load = _module.prototype.load;
    _module.defaultAsyncTime = _module.prototype.defaultAsyncTime;
    _module.loadScript = _module.prototype.loadScript;
    
    /**
     * extend [Method]
     */
    Leta.extend = function () {
        var target, source, args = arguments, isOverwrite = args[2];
        if (isUndefined(isOverwrite)) {
            isOverwrite = true;
        }
        if (args.length === 1) {
            target = Leta;
            source = args[0];
        } else {
            target = args[0];
            source = args[1];
        }
        for (var p in source) {
            if (!(p in target) || isOverwrite) {
                target[p] = source[p];
            }
        }
        return target;
    }
    
    Leta.extend({
        module: _module
    })
    
    window.Leta = Leta;
    
})();
 