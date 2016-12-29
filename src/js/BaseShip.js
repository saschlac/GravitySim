(function (window) {

	function BaseShip() {
		this.Container_constructor();

		this.debugMode = true;

		// this.shipBody = new createjs.Shape();
		this.shipVelocityVector = new createjs.Shape();

		this.loadAssets();
		this.timeout = 0;
		this.thrust = 0;
		this.velocityX = 0;
		this.velocityY = 0;
		this.rotation = 0;
	}
	var p = createjs.extend(BaseShip, createjs.Container);

// public properties:
	BaseShip.MAX_THRUST = 0.6;
	BaseShip.MAX_VELOCITY = 4;
	BaseShip.DECELERATION_FACTOR = 7.5;
	BaseShip.TURN_FACTOR = 20; // degrees per tick
	BaseShip.ROTATION_OFFSET = 90;
	BaseShip.TARGET_HEADING_THRESHOLD = 20;
	BaseShip.TARGET_HIT_BOX = 30;
	BaseShip.MASS = 1;
	BaseShip.RESIDUAL_VELOCITY_ON_REROUTE = 0.025;


// public properties:
	p.shipFlame;
	p.shipBody;

	p.timeout;
	p.thrust;

	p.velocityX;
	p.velocityY;

	p.bounds;
	p.hit;

	p.targetX;
	p.targetY;
	p.targetHeading; //

	p.loadAssets = function() {
		var preload = new createjs.LoadQueue();

		preload.addEventListener("fileload", function(event){
			this.shipBody = new createjs.Bitmap(event.result);
			this.addChild(this.shipBody);
			this.shipBody.scaleX = this.shipBody.scaleY = 0.15;
			this.shipBody.regX = 300;
			this.shipBody.regY = 300;

			this.addChild(this.shipVelocityVector);

		}.bind(this));

		preload.loadFile("media/ship-2.png");
	}
	

// public methods:
	p.makeShape = function () {
		//draw ship body
		var g = this.shipBody.graphics;
		g.clear();
		g.beginStroke("#FFFFFF");

		g.moveTo(-10, 0);	//nose
		g.lineTo(6, -5);	//rfin
		g.lineTo(2, 0);	//notch
		g.lineTo(6, 5);	//lfin
		g.closePath(); // nose

		//furthest visual element
		this.bounds = 10;
		this.hit = this.bounds;
	}

	p.setTarget = function(x, y){
		// calculate target heading;
		this.targetX = x;
		this.targetY = y;

		// cut current velocity
		this.velocityX = this.velocityX * BaseShip.RESIDUAL_VELOCITY_ON_REROUTE;
		this.velocityY = this.velocityY * BaseShip.RESIDUAL_VELOCITY_ON_REROUTE;

		this.updateTargetHeading();

		console.log("Setting new Target (",x,",",y,") with target heading ",  this.targetHeading);
	}

	p.updateTargetHeading = function(){
		var scratch = Math.atan((this.targetY- this.y)/(this.targetX - this.x)) * 180 / Math.PI;

		if(this.targetX >= this.x)
			scratch += 180;

		this.targetHeading = Math.round(scratch*100)/100;

		if(this.targetHeading > 180)
			this.targetHeading -= 360;

		if(this.targetHeading < -180)
			this.targetHeading += 360;

		console.log("Setting new target heading ",  this.targetHeading);
	}

	p.update = function (event) {

		if(this.hasTarget()){
			// Update Heading;
			if(!!this.targetX && !!this.targetY && this.x != this.targetX || this.y != this.targetY)
				this.updateHeading();

			this.updateTargetHeading();

			// Update Velocity
			// console.log("Setting new target heading ",  this.targetHeading, this.rotation);
			if(this.inRange(this.rotation, this.targetHeading, BaseShip.TARGET_HEADING_THRESHOLD)){
				this.accelerate();
			}

			// Check to see if we've hit our target
			if(this.inRange(this.x, this.targetX, BaseShip.TARGET_HIT_BOX) && this.inRange(this.y, this.targetY, BaseShip.TARGET_HIT_BOX)){
				this.clearTarget();
			}
		}

		if(this.debugMode){
			this.drawVelocityVector();
		}

		// Update Position
		this.x += this.velocityX;
		this.y += this.velocityY;

		this.x = Math.round(this.x*100)/100;
		this.y = Math.round(this.y*100)/100;

		if(this.x > 1000) {
			this.x = 1000;
			this.velocityX = 0;
		}
		if(this.y > 1000){
			this.y = 1000;	
			this.velocityY = 0;
		} 

		if(this.x < 0){
			this.x = 0;
			this.velocityX = 0;
		} 
		if(this.y < 0){
			this.y = 0;	
			this.velocityY = 0;
		} 

	}

	p.inRange = function(target, actual, range){
		return actual > (target-range) && actual < target+range;
	}

	p.hasTarget = function(){
		return this.targetX && this.targetY;
	}

	p.clearTarget = function(){
		this.velocityX = 0;
		this.velocityY = 0;
		this.targetX = false;
		this.targetY = false;
	}

	p.updateHeading = function(){
		// Make sure our target heading is within our bounds

		// console.log("target:", this.targetHeading, "actual", this.rotation);

		var targetComp = this.targetHeading;
		var actualComp = this.rotation;

		var over180 = Math.abs(targetComp - actualComp) > 180;

		// console.log("target:", targetComp, "actual", actualComp);

		if( (targetComp > actualComp && !over180) || (targetComp < actualComp && over180))
			this.rotation += Math.min(BaseShip.TURN_FACTOR, Math.abs(this.targetHeading - this.rotation)); // clockwise

		if( (targetComp < actualComp && !over180) || (targetComp > actualComp && over180))
			this.rotation -= Math.min(BaseShip.TURN_FACTOR, Math.abs(this.targetHeading - this.rotation)); // counter-clockwise

		// Shouldn't ever happen but good to normalize
		if(this.rotation > 180)
			this.rotation -= 360;

		if(this.rotation < -180)
			this.rotation += 360;
		// console.log(this.rotation);
	}

	p.accelerate = function () {
		var acceleration = this.getAcceleration();

		if(this.inRange(this.x, this.targetX, Math.abs(this.velocityX) * BaseShip.DECELERATION_FACTOR) && this.inRange(this.y, this.targetY, Math.abs(this.velocityY) * BaseShip.DECELERATION_FACTOR)){
			acceleration = -1 * acceleration;
		}

		// console.log(acceleration);

		if(Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) < BaseShip.MAX_VELOCITY){
			//accelerate
			this.velocityX += Math.sin((this.rotation + 90) * (Math.PI / -180)) * acceleration;
			this.velocityY += Math.cos((this.rotation + 90) * (Math.PI / -180)) * acceleration;
		}

		// console.log("velocity", this.velocityX, this.velocityY);	
	}

	p.getMass = function(){
		return BaseShip.MASS;
	}

	p.getAcceleration = function(){
		return BaseShip.MAX_THRUST / this.getMass();
	}

	p.drawVelocityVector = function(){
		var maxVelocityVector = 50;

		var ratio = (this.velocityX*this.velocityX + this.velocityY * this.velocityY)/(2 * BaseShip.MAX_VELOCITY * BaseShip.MAX_VELOCITY);

		var velocityVector = maxVelocityVector * ratio;

		var g = this.shipVelocityVector.graphics;
		g.clear();
		g.beginStroke("#FF0000");
		g.moveTo(0, 0);
		g.lineTo(-velocityVector, 0);

		var scratch = Math.atan(this.velocityY / this.velocityX) * 180 / Math.PI;

		if(this.velocityX > 0)
			scratch += 180;

		scratch -= this.rotation;
		
		this.shipVelocityVector.rotation = scratch;
	}

	window.BaseShip = createjs.promote(BaseShip, "Container");

}(window));