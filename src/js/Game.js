
	var Game = function (canvasName) {
		if(!canvasName)
			canvasName = "simCanvas"

		this.canvasName = canvasName;
		this.canvas = document.getElementById(canvasName);

		this.masses = new Array();
		
		this.stage = new createjs.Stage(this.canvasName);

		this.loadAssets();
	}

	Game.prototype.loadAssets = function() {
		var preload = new createjs.LoadQueue();

		preload.addEventListener("fileload", function(event){
			this.stage.addChild(new createjs.Bitmap(event.result));
			this.initialize();
		}.bind(this));

		preload.loadFile("media/space-1.jpg");
	}

	Game.prototype.initialize = function () {
		this.borders = false;
		this.running = true; 

		this.ship = new BaseShip();
		this.ship.x = this.canvas.width / 2;
		this.ship.y = this.canvas.height / 2;

		this.shipTarget = new createjs.Shape();

		this.stage.clear();
		this.stage.addChild(this.ship);
		this.stage.addChild(this.shipTarget);

		//start game timer
		if (!createjs.Ticker.hasEventListener("tick")) {
			createjs.Ticker.addEventListener("tick", function(event){
				this.update();
				this.render();
			}.bind(this));
		}

		this.stage.addEventListener("stagemousedown", function(event){
			this.ship.setTarget(this.stage.mouseX, this.stage.mouseY);

			var g = this.shipTarget.graphics;
			g.clear();
			g.beginStroke("#00FF00");

			g.moveTo(5, 5);
			g.lineTo(-5, -5);
			g.moveTo(5, -5);
			g.lineTo(-5, 5);

			this.shipTarget.x = this.stage.mouseX;
			this.shipTarget.y = this.stage.mouseY;

		}.bind(this));

	};

	Game.prototype.playPause = function (){
		if (this.running) {
			this.running = false;
		}
		else{
			this.running = true;
		}
	}

	Game.prototype.render = function(){
		this.stage.update();
	};

	Game.prototype.update = function(event){
		if(this.running)
			this.ship.update();
	}
