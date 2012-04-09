/**
 * leta util
 */
Leta.register('.util', function ($L) {
	var pkg = this;
	/**
	 * parseUrl
	 * @example:
	 * 		var url = Leta.util.parseUrl('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
	 * 		url.source // http://abc.com:8080/dir/index.html?id=255&m=hello#top
	 * 		url.protocol // http
	 * 		url.host // abc.com
	 * 		url.port // 8080
	 * 		url.query // ?id=255&m=hello
	 *		url.file // index.html
	 *		url.hash // top
	 *		url.path // 
	 *		url.relative
	 *		url.segments // ['dir', 'index.html']
	 *		url.params // {id: 255, m: 'hello'}
	 */
	var parseUrl = function (s) {
		var a = document.createElement('a');
		a.href = s;
		return {
		 	source: s,
			protocol: a.protocol.replace(':', ''), // eg. http https
			host: a.hostname, // eg. a.com
			prot: a.port, // eg. 8080
			query: a.search, // ?a=1&b=2
			file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/,'/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
			segments: a.pathname.replace(/^\//,'').split('/'),
			params: (function () {
					var ret = {},
						seg = a.search.replace(/^\?/,'').split('&'),
						len = seg.length,
						i = 0,
						s;
					for ( ; i < len; i++) {
						if (!seg[i]) {
							continue;
						}
						s = seg[i].split('=');
						ret[s[0]] = s[1];
					}
					return ret;
				})()
		}
	};
	this.parseUrl = parseUrl;
	
	/**
	 * @param	{String}	图片路径
	 * @param	{Function}	尺寸就绪
	 * @param	{Function}	加载完毕 (可选)
	 * @param	{Function}	加载错误 (可选)
	 * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
			alert('size ready: width=' + this.width + '; height=' + this.height);
		});
	 */
	var imgReady = (function () {
		var list = [], intervalId = null,

		// 用来执行队列
		tick = function () {
			var i = 0;
			for (; i < list.length; i++) {
				list[i].end ? list.splice(i--, 1) : list[i]();
			};
			!list.length && stop();
		},

		// 停止所有定时器队列
		stop = function () {
			clearInterval(intervalId);
			intervalId = null;
		};

		return function (url, ready, load, error) {
			var onready, width, height, newWidth, newHeight,
				img = new Image();

			img.src = url;

			// 如果图片被缓存，则直接返回缓存数据
			if (img.complete) {
				ready.call(img);
				load && load.call(img);
				return;
			};

			width = img.width;
			height = img.height;

			// 加载错误后的事件
			img.onerror = function () {
				error && error.call(img);
				onready.end = true;
				img = img.onload = img.onerror = null;
			};

			// 图片尺寸就绪
			onready = function () {
				newWidth = img.width;
				newHeight = img.height;
				if (newWidth !== width || newHeight !== height ||
					// 如果图片已经在其他地方加载可使用面积检测
					newWidth * newHeight > 1024
				) {
					ready.call(img);
					onready.end = true;
				};
			};
			onready();

			// 完全加载完毕的事件
			img.onload = function () {
				// onload在定时器时间差范围内可能比onready快
				// 这里进行检查并保证onready优先执行
				!onready.end && onready();

				load && load.call(img);

				// IE gif动画会循环执行onload，置空onload即可
				img = img.onload = img.onerror = null;
			};

			// 加入队列中定期执行
			if (!onready.end) {
				list.push(onready);
				// 无论何时只允许出现一个定时器，减少浏览器性能损耗
				if (intervalId === null) intervalId = setInterval(tick, 40);
			};
		};
	})();
	this.imgReady = imgReady;
	
	// domready
	var domReady = (function() {

		var w3c = !!document.addEventListener,
			loaded = false,
			toplevel = false,
			fns = [];
		
		if (w3c) {
			document.addEventListener("DOMContentLoaded", contentLoaded, true);
			window.addEventListener("load", ready, false);
		}
		else {
			document.attachEvent("onreadystatechange", contentLoaded);
			window.attachEvent("onload", ready);
			
			try {
				toplevel = window.frameElement === null;
			} catch(e) {}
			if ( document.documentElement.doScroll && toplevel ) {
				scrollCheck();
			}
		}

		function contentLoaded() {
			(w3c)?
				document.removeEventListener("DOMContentLoaded", contentLoaded, true) :
				document.readyState === "complete" && 
				document.detachEvent("onreadystatechange", contentLoaded);
			ready();
		}
		
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		function scrollCheck() {
			if (loaded) {
				return;
			}
			
			try {
				document.documentElement.doScroll("left");
			}
			catch(e) {
				window.setTimeout(arguments.callee, 15);
				return;
			}
			ready();
		}
		
		function ready() {
			if (loaded) {
				return;
			}
			loaded = true;
			
			var len = fns.length,
				i = 0;
				
			for( ; i < len; i++) {
				fns[i].call(document);
			}
		}
		
		return function(fn) {
			// if the DOM is already ready,
			// execute the function
			return (loaded)? 
				fn.call(document):      
				fns.push(fn);
		}
	})();
	this.domReady = domReady;
	
	// export to top
	Leta.extend(this);
});