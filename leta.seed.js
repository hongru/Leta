/**
 * leta.seed.js
 * 种子文件
 * @config
 * 配置module路径
 */
Leta.module.MAINURL = '';
(function () {
 	var scriptList = document.getElementsByTagName('script'),
		currentNode = scriptList[scriptList.length-1],
		src = currentNode.getAttribute('src'),
		MAINURL = src.lastIndexOf('/');

		function getModulePath (src) {
			var a = document.createELement('a');
			a.href = src;
		}
	Leta.module.MAINURL = !!MAINURL ? MAINURL : '';
 })();
Leta.module.register('leta.object', Leta.module.MAINURL+'leta.object.js')
