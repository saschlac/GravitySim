var Mass = function (initX, initY, veloX, veloY, mass, density, color, type, parentSim) {
	this.ID = Mass.IDcounter++;

	this.type = type;
	this.velocity = Object.create(null);
	this.velocity.x = veloX;
	this.velocity.y = veloY;
	
	this.position = Object.create(null);
	this.position.x = initX;
	this.position.y = initY;
	
	this.mass = mass;
	this.density = density;

	this.parentSim = parentSim;
	this.stage = this.parentSim.stage;

	var circle = new createjs.Shape();
	circle.graphics.beginFill(color).drawCircle(0, 0, 50);
	circle.x = this.position.x;
	circle.y = this.position.y;
	this.stage.addChild(circle);

	this.circle = circle;
	
	// this.circle = new Kinetic.Circle({
	//     x: ,
	//     y: ,
	//     radius: 1,
	//     fill: color,
	//     //stroke: 'black',
	//     //strokeWidth: 1
	// });

	
	
	this.updateRadius();
};

Mass.IDcounter = 0;
Mass.types = new Object(null);
Mass.types.STATIC = 1;
Mass.types.DYNAMIC = 2;
Mass.types.DYNAMIC_GRAVITY_WELL = 3;
Mass.types.PLAYER = 4;

Mass.prototype.updatePosition = function(masses){

	// Calculate forces
	var forceSumX = 0;
	var forceSumY = 0;
	
	var distance = 0;
	var gravForce = 0;
	
	for( var i = 0;i < masses.length; i++ ){
		// F = G*m1*m2/r^2
		if( masses[i].type == Mass.types.STATIC || masses[i].type == Mass.types.DYNAMIC_GRAVITY_WELL ){
			xDiff = masses[i].position.x - this.position.x;
			yDiff = masses[i].position.y - this.position.y;
			distance = this.calculateDistance(masses[i]);
			
			if( distance < 100 )
				distance = 100;
			gravForce = (Simulation.G*masses[i].mass*this.mass)/(distance*distance);
			
			forceSumX += gravForce*(xDiff/distance);
			forceSumY += gravForce*(yDiff/distance);    
		}
	}
	
	// Make changes in velocity
	this.velocity.x = this.velocity.x + forceSumX/this.mass;
	this.velocity.y = this.velocity.y + forceSumY/this.mass;
	
	// Make changes in position    
	var newX = this.position.x + this.velocity.x;
	var newY = this.position.y +  this.velocity.y;
	
	if(this.parentSim.borders){
		if( newX + this.getRadius() > this.parentSim.getWidth() ){
			newX = this.stage.getWidth() - this.getRadius();
			this.velocity.x = -1 * this.velocity.x;
		}
		if( newX - this.getRadius() < 0 ){
			newX = this.getRadius();
			this.velocity.x = -1 * this.velocity.x;
		}
		if( newY + this.getRadius() > this.parentSim.getHeight() ){
			newY = this.stage.getHeight() - this.getRadius();
			this.velocity.y = -1 * this.velocity.y;
		}
		if( newY - this.getRadius() < 0 ){
			newY = this.getRadius();
			this.velocity.y = -1 * this.velocity.y;
		}
	}
	
	this.setPosition(newX,newY);
};

Mass.prototype.setPosition = function(x,y){
	this.position.x = x;
	this.position.y = y;
	this.circle.x = this.position.x;
	this.circle.y = this.position.y;
}

Mass.prototype.detectCollisions = function(masses){
	var distance = 0;

	for( var i=0; i< masses.length; i++ ){
		if( this.ID == masses[i].ID)
			continue;
		
		mass = masses[i];
		
		if( this.overlapping(mass) ){
			var massChange = Math.PI*this.sizeDiff*this.sizeDiff;
			
			if(massChange > mass.mass-10)
				massChange = mass.mass;
			
			if( this.mass > mass.mass){
				this.setMass(this.mass + massChange);
				mass.setMass(mass.mass - massChange);
				
				//vf = (mi*vi+massChange*v2)/mf
				
				this.velocity.x = ( (this.mass-massChange)*this.velocity.x + massChange*mass.velocity.x )/this.mass;
				this.velocity.y = ( (this.mass-massChange)*this.velocity.y + massChange*mass.velocity.y )/this.mass;
			}
		}
	}
}

Mass.prototype.overlapping = function(mass){
	var distance = this.calculateDistance(mass);
	this.sizeDiff = (this.getRadius() + mass.getRadius()) - distance;
	return this.sizeDiff > 0;
}

Mass.prototype.overlappingParam = function(x,y,mass,density){
	var xDiff = x - this.position.x;
	var yDiff = y - this.position.y;
	
	var distance = Math.sqrt( xDiff*xDiff + yDiff*yDiff );
	
	var otherRadius = Math.sqrt(mass*density/Math.PI);
	
	this.sizeDiff = (this.circle.getRadius() + otherRadius) - distance;
	
	return this.sizeDiff > 0;
}

Mass.prototype.setMass = function(mass){
	this.mass = mass;
	this.updateRadius();
}

Mass.prototype.getRadius = function(){
	// return this.circle.getRadius();
}

Mass.prototype.updateRadius = function(){
	var area = this.mass*this.density;
	
	var radius = Math.sqrt(area/Math.PI);

	// this.circle.setRadius(radius);
}

Mass.prototype.calculateDistance = function(mass){
	var xDiff = mass.position.x - this.position.x;
	var yDiff = mass.position.y - this.position.y;
	return Math.sqrt( xDiff*xDiff + yDiff*yDiff );
}

Mass.getRandomColor = function() {
	var colors = ['green', 'blue'];
	return colors[Math.round(Math.random() * 1)];
};