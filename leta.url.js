/**
 * leta.url.js
 * @example:
 * 		var url = Leta.url.parse('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
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
(function (Leta, undefined) {
 	var url = {};
	url.parse = function (s) {
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
	}

	Leta.extend({url: url})
 })(Leta)
