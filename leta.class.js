/**
 * Class Constructor
 * from John resig
 */

;(function (Leta, undefined) {
	
	
 	var initializing = false,
		superTest = /horizon/.test(function () {horizon;}) ? /\b_super\b/ : /.*/;
	// 临时Class
	var $Class = function () {};
	// 继承方法extend
	$Class.extend = function (prop) {
		var _super = this.prototype;
		//创建一个实例，但不执行init
		initializing = true;
		var prototype = new this();
		initializing = false;

		for (var name in prop) {
			// 用闭包保证多级继承不会污染
			prototype[name] = (typeof prop[name] === 'function' && typeof _super[name] === 'function' && superTest.test(prop[name])) ? (function (name, fn) {
					return function () {
						var temp = this._super;	
						// 当前子类通过_super继承父类
						this._super = _super[name];
						//继承方法执行完毕后还原
						var ret = fn.apply(this, arguments);
						this._super = temp;

						return ret;
					}
				})(name, prop[name]) : prop[name];
		}
		
		//真实的constructor
		function $Class () {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}
		$Class.prototype = prototype;
		$Class.constructor = $Class;
		$Class.extend = arguments.callee;

		return $Class;
	}
	
	Leta.extend({ $Class : $Class });

})(Leta)
