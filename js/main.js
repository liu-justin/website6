// need to fix the hard code at increment, right now its hard coded at direction 2 ---> Done!
// need to figure out event hover stuff, the event that activates the flip
//  first idea (for optimization): when hover is first noticed, calculate perpendicular distance
//  from all sides, and mark the side with the smallest distance
//  when hover is first not active, do the same
//  flip along the axis of the side that is not marked

//10-1: had problem where it was only mouse checking the last one in array
//      because the checker is checking is point in path, the last drawn path
//      need to draw and check, draw and check

"use strict"

var canvas;
var ctx;
var timer;
var fps = 50;

class Triangle {

	constructor(center_pt_x, center_pt_y, side, flip) {
		this.center_pt_x = center_pt_x;
		this.center_pt_y = center_pt_y;
		this.side = side;

		// 1 is point up, -1 is point down
		this.flip = flip;

		this.r = Math.sqrt(3)*this.side/3;

        // this is just in the constructor, only use the all_pt, thats what draw uses
		this.midx = center_pt_x;
		this.midy = center_pt_y-flip*(3*this.r/4);

		this.leftx = center_pt_x-side/2;
		this.lefty = center_pt_y+flip*(3*this.r/4);

		this.rightx = center_pt_x+side/2;
		this.righty = this.lefty;

        // will update
		this.all_pt = [[this.midx, this.midy], [this.leftx, this.lefty], [this.rightx, this.righty]];
        // this is updating the sinusoidal increment
        this.angle_x = 0;
        this.angle_y = 0;

        // [initial set, final set] will be fixed points, will not update
        this.runner_pt = [[0,0], [0,0]];

        // midpoint of the anchor line, the line created by the two points that are not moving
        // will not update after the first point moving
        this.radius = [0,0];

        // need to have the animation length in seconds
        // copy pasted from increment method, forgot to change let to this.
        this.length = 1;
        this.number_of_steps = this.length*fps;
        this.step_size = Math.PI/this.number_of_steps;
        this.step_count = 0;
    }

	draw() {
        canvas = document.getElementById("title_canvas");
        ctx = canvas.getContext("2d");
		ctx.beginPath();

		// based off of the geometric center
		/*ctx.moveTo(this.center_pt_x, this.center_pt_y-this.flip*r);
		ctx.lineTo(this.center_pt_x+(this.side/2), this.center_pt_y+this.flip*(r/2));
		ctx.lineTo(this.center_pt_x-(this.side/2), this.center_pt_y+this.flip*(r/2));
		ctx.closePath();
		ctx.stroke();*/

		// based off half height of the side length, raw code
		//ctx.moveTo(this.center_pt_x, this.center_pt_y-this.flip*(d3*r/4));
		//ctx.lineTo(this.center_pt_x+(this.side/2), this.center_pt_y+this.flip*(3*r/4));
		//ctx.lineTo(this.center_pt_x-(this.side/2), this.center_pt_y+this.flip*(3*r/4));

		// based off midx midy leftx lefty rightx righty
		//ctx.moveTo(this.midx, this.midy);
		//ctx.lineTo(this.leftx, this.lefty);
		//ctx.lineTo(this.rightx, this.righty);


		// based off all_pt
		ctx.moveTo(this.all_pt[0][0], this.all_pt[0][1]);
		ctx.lineTo(this.all_pt[1][0], this.all_pt[1][1]);
		ctx.lineTo(this.all_pt[2][0], this.all_pt[2][1]);
		

		// based off geometric center again, but just moving origin first DOESNT WORK
		/*
		let ygeo=this.center_pt_y-this.flip*Math.sqrt(3)*this.side/12;
		console.log(ygeo);
		ctx.moveTo(this.center_pt_x, ygeo-this.flip*r);
		ctx.lineTo(this.center_pt_x+(this.side/2), ygeo+this.flip*(r/2));
		ctx.lineTo(this.center_pt_x-(this.side/2), ygeo+this.flip*(r/2));
		*/
		ctx.closePath();
		ctx.stroke();
	}

    check_mouse() {
        //console.log(ctx.isPointInPath(mouse_pt.x, mouse_pt.y));
        if (ctx.isPointInPath(mouse_pt.x, mouse_pt.y))
        {  
            // need to add it to an increment list, this is just incrementing
            // every triangle only needs one of these
            // maybe can have another animation_roster in iteration_table that runs through the checkmouse
            // once this is called, just remove this triangle from the new animation_roster
            iteration_table.add_ani(this);
            iteration_table.remove_undug(this);

        }
    }

	point_moving(direction) {
		// name flip is reserved? --> no, its because a variable is called flip
        // direction is either 0 (vertical), 1(from left), 2(from right)
		// direction is also the point which will be moving in the array 0-mid, 1-left, 2-right

		// getting the points that wont move, or the two other points
		let anchor1_x = this.all_pt[(direction+1)%3][0];
		let anchor1_y = this.all_pt[(direction+1)%3][1];
		//console.log("first anchor - " + anchor1_x+ ":" + anchor1_y);

		let anchor2_x = this.all_pt[(direction+2)%3][0];
		let anchor2_y = this.all_pt[(direction+2)%3][1];
        //console.log("second anchor - " + anchor2_x+ ":" + anchor2_y);

		// finding the slope, order doesnt matter
		let anchor_slope = (anchor2_y-anchor1_y)/(anchor2_x-anchor1_x);
        //console.log("slope: " + anchor_slope);

        // dont make this global, make the radius global instead
		let anchor_mid_x = (anchor2_x+anchor1_x)/2;
		let anchor_mid_y = (anchor2_y+anchor1_y)/2;
        console.log("anchor mid - " + anchor_mid_x+ ":" + anchor_mid_y);

		// finding the initial coords for the point that moves
        this.runner_pt[0][0] = this.all_pt[direction][0];
        this.runner_pt[0][1] = this.all_pt[direction][1];

        // find the distance between where the runner_pt starts and the anchor midpoint
        this.radius[0] = (this.runner_pt[0][0] - anchor_mid_x);
        this.radius[1] = (this.runner_pt[0][1] - anchor_mid_y);
        console.log("radius: " + this.radius);

		// finding final coords for the point that moves, using the midpoint and the initial point
		this.runner_pt[1][0] = this.runner_pt[0][0] + 2*(anchor_mid_x-this.runner_pt[0][0]);
		this.runner_pt[1][1] = this.runner_pt[0][1] + 2*(anchor_mid_y-this.runner_pt[0][1]);
        console.log(this.runner_pt);

        // this test confirms that it finds the correct all_pt
        /*
        console.log(this.all_pt);
        this.all_pt[direction][0] = this.runner_pt[1][0];
        this.all_pt[direction][1] = this.runner_pt[1][1];
        console.log(this.all_pt);
        this.draw();
        */
	}

    increment(direction) {
        // need to make it sinusoidal, increment angle linearly and grab the sine of it

        // triangle goes through angle 0-PI, but need to shift it so zero point is midpoint

        // not -=, need to grab the starting value from movingcoord
        this.all_pt[direction][0] = this.runner_pt[0][0] - this.radius[0]*(1-Math.cos(this.angle_x));
        this.all_pt[direction][1] = this.runner_pt[0][1] - this.radius[1]*(1-Math.cos(this.angle_y));

        this.angle_x += this.step_size;
        this.angle_y += this.step_size;
        this.step_count += 1;
        console.log(this.step_count);
        if (this.step_count == this.number_of_steps)
        {
            iteration_table.remove_ani();
        }
    }

}

function get_mouse_position(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// better ways to do this, like making a class
// method to add triangles
// attribute for number of steps comes from the triangle  class
// after a triangle reaches the number of steps, remove the triangle from the array


let iteration_table = {
    undug_roster: [],
    animation_roster: [],
    length: 1,
    number_of_steps: function() {return this.length*fps;},
    add_ani: function(x) {
        this.animation_roster.push(x);
    },
    remove_ani: function() {
        this.animation_roster.shift();
    },

    remove_undug: function(x) {
        let index = this.undug_roster.indexOf(x);
        this.undug_roster.splice(index,1);
    }
}

// any way to make this not global?
var mouse_pt;

function init() {
    canvas = document.getElementById("title_canvas");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousemove", function(evt) {
        mouse_pt = get_mouse_position(canvas, evt);
    }, false);
    
    for (let i = 0; i < triangles.length; i++)
    {
        triangles[i].point_moving(1);
        iteration_table.undug_roster.push(triangles[i]);
    }

    timer = setInterval(draw_main, 1000/fps);
    return timer;  
}

function draw_main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //tri1.draw();
    //tri2.draw();
    //tri3.draw();
    for (let i=0; i<iteration_table.undug_roster.length; i++)
    {
        triangles[i].draw();
        iteration_table.undug_roster[i].check_mouse();
    }
    for (let i=0; i<iteration_table.animation_roster.length; i++)
    {
        iteration_table.animation_roster[i].increment(1);
    }
    //tri1.check_mouse();
    //tri1.increment(1);
}

let triangles =[];
for (let i = 0; i < 3; i++)
{
    triangles[i]=new Triangle(250+50*i,250,50,1);
}

/*let tri1 = new Triangle(250,250,50,1);
tri1.draw();
let tri2 = new Triangle(300,250,50,1);
tri2.draw();
let tri3 = new Triangle(350,250,50,1);
tri3.draw();*/
/*
let tri2 = new Triangle(275,250,50,-1);
tri2.draw();
let tri3 = new Triangle(300,250,50,1);
tri3.draw();
*/