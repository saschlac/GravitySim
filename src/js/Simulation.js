var Simulation = function (canvasName) {

	if(!canvasName)
		canvasName = "simCanvas"

	this.canvasName = canvasName;

	this.masses = new Array();
	
	this.stage = new createjs.Stage(this.canvasName);
	
	this.startRenderTime = new Date().getTime();
	
	 $("#"+canvasName).click(function(e){
		var x = Math.floor((e.pageX-$("#"+canvasName).offset().left));
		var y = Math.floor((e.pageY-$("#"+canvasName).offset().top));
		
		var massPosX = this.playerMass.position.x;
		var massPosY = this.playerMass.position.y;
		
		var dist = Math.sqrt( (massPosX-x)*(massPosX-x) + (massPosY-y)*(massPosY-y) );
		
		var velocBaseX = (massPosX-x)/dist;
		var velocBaseY = (massPosY-y)/dist;  
		
		var velocMag = 0.075;      
		
		//console.log( veloBaseX, veloBaseY );
		
		this.playerMass.velocity.x += velocBaseX*velocMag;
		this.playerMass.velocity.y += velocBaseY*velocMag;
		
		var force = this.playerMass.mass*velocMag;
		
		var newMass = this.playerMass.mass * 0.02;
		var initX = massPosX - (this.playerMass.getRadius() + 25)*velocBaseX;
		var initY = massPosY - (this.playerMass.getRadius() + 25)*velocBaseY;
		var velocX = (-1) * velocBaseX * force/newMass;
		var velocY = (-1) * velocBaseY * force/newMass;
		var color = "blue";
		this.masses.push( new Mass( initX, initY, velocX, velocY, newMass, 1 /*Density*/, color, Mass.types.DYNAMIC, this) );
		
		this.playerMass.setMass( this.playerMass.mass - newMass );
		
		
		
	}.bind(this) );
};


Simulation.G = 0.0667;

Simulation.prototype.initialize = function () {
	this.borders = false;

};

Simulation.prototype.getWidth = function () {
	$("#"+this.canvasName).width();
}

Simulation.prototype.getHeight = function () {
	$("#"+this.canvasName).height();
}

Simulation.prototype.render = function(){
	this.stage.update();
};

Simulation.prototype.update = function(){
	
	for( var i = this.masses.length-1 ; i >=0; i--){
		this.masses[i].detectCollisions( this.masses );
		
		if(this.masses[i].type == Mass.types.DYNAMIC || this.masses[i].type == Mass.types.DYNAMIC_GRAVITY_WELL || this.masses[i].type == Mass.types.PLAYER)
			this.masses[i].updatePosition( this.masses );
			
		if( this.playerMass != undefined && this.masses[i].ID != this.playerMass.ID ){
			if( this.masses[i].mass > this.playerMass.mass ){
				if( this.masses[i].circle.getFill() != "red" ){
					this.masses[i].circle.setFill("red");    
					this.masses[i].circle.draw();
				}
				
			}
			else{
				if( this.masses[i].circle.getFill() != "blue" ){
					this.masses[i].circle.setFill("blue");    
					this.masses[i].circle.draw();
				}
			}    
			
		}
	
		if(this.masses[i].mass <= 0){
			this.masses.splice(i, 1);
		}
	}
};