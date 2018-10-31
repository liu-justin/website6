// need to fix the hard code at increment, right now its hard coded at direction 2
//cp /u/z/users/mitra/jscript/dhtml/* .


"use strict"

var canvas;
var ctx;
var timer;
var fps = 50;

class Triangle {

	constructor(xpos, ypos, side, flip) {
		this.xpos = xpos;
		this.ypos = ypos;
		this.side = side;

		// 1 is point up, -1 is point down
		this.flip = flip;

		this.r = Math.sqrt(3)*this.side/3;

        // this is just in the constructor, only use the coordinates, thats what draw uses
		this.midx = xpos;
		this.midy = ypos-flip*(3*this.r/4);

		this.leftx = xpos-side/2;
		this.lefty = ypos+flip*(3*this.r/4);

		this.rightx = xpos+side/2;
		this.righty = this.lefty;

        // will update
		this.coordinates = [[this.midx, this.midy], [this.leftx, this.lefty], [this.rightx, this.righty]];
        // this is updating the sinusoidal increment
        this.anglex = 0;
        this.angley = 0;

        // [initial set, final set] will be fixed points, will not update
        this.movingcoords = [[0,0], [0,0]];

        // midpoint of the anchor line, the line created by the two points that are not moving
        // will not update after the first point moving
        this.radius = [0,0];
    }

	draw() {
        canvas = document.getElementById("title_canvas");
        ctx = canvas.getContext("2d");
		ctx.beginPath();

		// based off of the geometric center
		/*ctx.moveTo(this.xpos, this.ypos-this.flip*r);
		ctx.lineTo(this.xpos+(this.side/2), this.ypos+this.flip*(r/2));
		ctx.lineTo(this.xpos-(this.side/2), this.ypos+this.flip*(r/2));
		ctx.closePath();
		ctx.stroke();*/

		// based off half height of the side length, raw code
		//ctx.moveTo(this.xpos, this.ypos-this.flip*(d3*r/4));
		//ctx.lineTo(this.xpos+(this.side/2), this.ypos+this.flip*(3*r/4));
		//ctx.lineTo(this.xpos-(this.side/2), this.ypos+this.flip*(3*r/4));

		// based off midx midy leftx lefty rightx righty
		//ctx.moveTo(this.midx, this.midy);
		//ctx.lineTo(this.leftx, this.lefty);
		//ctx.lineTo(this.rightx, this.righty);


		// based off coordinates
		ctx.moveTo(this.coordinates[0][0], this.coordinates[0][1]);
		ctx.lineTo(this.coordinates[1][0], this.coordinates[1][1]);
		ctx.lineTo(this.coordinates[2][0], this.coordinates[2][1]);


		// based off geometric center again, but just moving origin first DOESNT WORK
		/*
		let ygeo=this.ypos-this.flip*Math.sqrt(3)*this.side/12;
		console.log(ygeo);
		ctx.moveTo(this.xpos, ygeo-this.flip*r);
		ctx.lineTo(this.xpos+(this.side/2), ygeo+this.flip*(r/2));
		ctx.lineTo(this.xpos-(this.side/2), ygeo+this.flip*(r/2));
		*/
		ctx.closePath();
		ctx.stroke();
	}

	point_moving(direction) {
		// flip is reserved?
        // direction is either 0 (vertical), 1(from left), 2(from right)
		// direction is also the point which will be moving in the array 0-mid, 1-left, 2-right

		// getting the points that wont move, or the two other points
		let anchor1_x = this.coordinates[(direction+1)%3][0];
		let anchor1_y = this.coordinates[(direction+1)%3][1];
		//console.log("first anchor - " + anchor1_x+ ":" + anchor1_y);

		let anchor2_x = this.coordinates[(direction+2)%3][0];
		let anchor2_y = this.coordinates[(direction+2)%3][1];
        //console.log("second anchor - " + anchor2_x+ ":" + anchor2_y);

		// finding the slope, order doesnt matter
		let anchor_slope = (anchor2_y-anchor1_y)/(anchor2_x-anchor1_x);
        //console.log("slope: " + anchor_slope);

        // dont make this global, make the radius global instead
		let anchor_mid_x = (anchor2_x+anchor1_x)/2;
		let anchor_mid_y = (anchor2_y+anchor1_y)/2;
        console.log("anchor mid - " + anchor_mid_x+ ":" + anchor_mid_y);

		// finding the initial coords for the point that moves
        this.movingcoords[0][0] = this.coordinates[direction][0];
        this.movingcoords[0][1] = this.coordinates[direction][1];

        // find the distance between where the runner starts and the anchor midpoint
        this.radius[0] = (this.movingcoords[0][0] - anchor_mid_x);
        this.radius[1] = (this.movingcoords[0][1] - anchor_mid_y);
        console.log("radius: " + this.radius);

		// finding final coords for the point that moves, using the midpoint and the initial point
		this.movingcoords[1][0] = this.movingcoords[0][0] + 2*(anchor_mid_x-this.movingcoords[0][0]);
		this.movingcoords[1][1] = this.movingcoords[0][1] + 2*(anchor_mid_y-this.movingcoords[0][1]);
        console.log(this.movingcoords);

        // this test confirms that it finds the correct coordinates
        /*
        console.log(this.coordinates);
        this.coordinates[direction][0] = this.movingcoords[1][0];
        this.coordinates[direction][1] = this.movingcoords[1][1];
        console.log(this.coordinates);
        this.draw();
        */
	}

    increment(direction) {
        // this is ease in, end is slower than the beginning
        /*
        // find distance from current point to the end point
        let dx = this.movingcoords[1][0] - this.coordinates[direction][0];
        let dy = this.movingcoords[1][1] - this.coordinates[direction][1];
            // ease value is defined as an attibute in the class
        // find distance traveled in next frame
        let velx = this.easeValue*dx;
        let vely = this.easeValue*dy;
        */

        // need to make it sinusoidal, increment angle linearly and grab the sine of it

        // triangle goes through angle 0-PI, but need to shift it so zero point is midpoint

        // need to have the animation length in seconds
        let length = 1;
        let number_of_steps = length*fps;
        let step_size = Math.PI/number_of_steps;


        // calling radius because in a circle projection it is radius
        //let radiusx = (3/4)*this.side;
        //let radiusy = (Math.sqrt(3)/4)*this.side;

        // not -=, need to grab the starting value from movingcoord
        this.coordinates[direction][0] = this.movingcoords[0][0] - this.radius[0]*(1-Math.cos(this.anglex));
        this.coordinates[direction][1] = this.movingcoords[0][1] - this.radius[1]*(1-Math.cos(this.angley));

        this.anglex += step_size;
        this.angley += step_size;




    }

}

function init() {

    canvas = document.getElementById("title_canvas");
    ctx = canvas.getContext("2d");
    tri1.point_moving(1);
    timer = setInterval(draw_main, 1000/fps);
    console.log(tri1.midx);
    return timer;

}

function draw_main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tri1.draw();
    tri1.increment(1);
    console.log(tri1.midx);
}


let tri1 = new Triangle(250,250,50,1);

tri1.draw();
/*
let tri2 = new Triangle(275,250,50,-1);
tri2.draw();
let tri3 = new Triangle(300,250,50,1);
tri3.draw();
*/
