/**
 * leta.seed.js
 * 种子文件
 * @config
 * 配置module路径
 */
Leta.module.MAINURL = '';
<<<<<<< HEAD
/*(function () {
=======
(function () {
>>>>>>> dc9cba76edfe539a14c5b8e5d68e1332b8860531
 	var scriptList = document.getElementsByTagName('script'),
		currentNode = scriptList[scriptList.length-1],
		src = currentNode.getAttribute('src'),
		MAINURL = src.lastIndexOf('/');

		function getModulePath (src) {
			var a = document.createELement('a');
			a.href = src;
		}
	Leta.module.MAINURL = !!MAINURL ? MAINURL : '';
<<<<<<< HEAD
 })();*/
=======
 })();
>>>>>>> dc9cba76edfe539a14c5b8e5d68e1332b8860531
Leta.module.register('leta.object', Leta.module.MAINURL+'leta.object.js')
