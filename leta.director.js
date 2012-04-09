/**
 * Director pattern
 * for Big Web App Development
 * @require [core, class]
 */
 
Leta.register('.Dr', function (La) {

    var Class = La.Class,
        extend = La.extend;
    
    /**
	 * Person
	 * Director & Actor 的基类
	 */
	var Person = Class({
		initialize: function (name) {
			this.name = name;
			this.isWaking = false;
			this.$WAKETODO = [];
		},
		$wake: function () {
			this.isWaking = true;
		},
		$sleep: function () {
			this.isWaking = false;
		}
	});
    
	/**
	 * Director
	 */
	var Director = Person.extend({
		initialize: function (name, fn) {
			this._super(name);
			!!fn && fn.call && fn.apply && fn.call(this);
			this.actors = [];
			this._observes = {};
		},

		$wake: function (wakeFn) {
			this._super();
			wakeFn != undefined && this.$WAKETODO.push(wakeFn);
			this.$firstAct != undefined && this.$WAKETODO.push(this.$firstAct);

			for (var i = 0; i < this.actors.length; i ++) {
				var actor = this.actors[i];
				if (actor instanceof Actor) {
					actor.$wake();
				}
			}
			
			for (var j = 0; j < this.$WAKETODO.length; j ++) {
				var fn = this.$WAKETODO[j];
				if (typeof fn == 'string') {
					fn = this[fn];
				}
				!!fn.call && !!fn.apply && fn.call(this);
			}
		},
		$sleep: function (sleepFn) { 
			this._super();
			!!sleepFn && sleepFn();
		},
		$observe: function (actor, type, listener) {
			if (this._observes[actor.name] == undefined) {
				this._observes[actor.name] = {};
			}
			if (this._observes[actor.name][type] == undefined) {
				this._observes[actor.name][type] = [];
			}
			this._observes[actor.name][type].push(listener);
		}
			
	});
    
	/**
	 * Actor
	 */
	var Actor = Person.extend({
		initialize: function (opt, fn) {
			this._super(opt.name);
			!!fn && fn.call && fn.apply && fn.call(this);
			this.director = opt.director;
			if (this.director instanceof Director) {
				this.director.actors.push(this);
			}
		},
		$wake: function (wakeFn) { 
			this._super();
			wakeFn != undefined && this.$WAKETODO.push(wakeFn);
			for (var i = 0; i < this.$WAKETODO.length; i ++) {
				var fn = this.$WAKETODO[i];
				if (typeof fn == 'string') {
					fn = this[fn];
				}
				!!fn.call && !!fn.apply && fn.call(this);
			}
		},
		$sleep: function (sleepFn) { 
			this._super();
			!!sleepFn && sleepFn();
		},
		$notifyDirector: function (type, arg) {
			var listeners = this.director._observes[this.name][type];
			if (!!listeners) {
				for (var i = 0; i < listeners.length; i ++) {
					listeners[i].apply(this, Array.prototype.slice.call(arguments, 1));
				}
			}
		}
	});
    
    /* public interface */
	this.Director = function (name, fn) {
		return (this instanceof Director) ? this.init(name, fn) : new Director(name, fn);
	};
	this.Actor = function (opt, fn) {
		return (this instanceof Actor) ? this.init(opt, fn) : new Actor(opt, fn);
	}

});