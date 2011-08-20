(function () {
	function DisplayObject () {
		this.x = 0;
		this.y = 0;
	}
	
	var Stage = function (canvas) {
		this.canvas = canvas;
		this.isRunning = false;
	}

	if (!window.Leta) {
		var Leta = window.Leta = {};
	}
	

})()


/* @example 
var canvas = document.getElementById('canvas');
var stage = new Leta.canvas.Stage(canvas);

var btn = new Leta.canvas.Sprite(stage.ctx, {
	x: 20,
	y: 20,
	width: 100,
	height:100,
	init: function () {
		this.ctx.beginPath();
		this.ctx.rect(this.x, this.y, this.width, this.height);
		this.ctx.closePath();
		this.ctx.fill();
	},
	onmouseenter: function () {},
	onmouseleave: function () {},
	onmousedown: function () {},
	onmouseup: function () {},
	onclick: function () {}
});

stage.addSprite('btn', btn);
stage.do();
