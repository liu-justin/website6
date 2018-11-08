// need to fix the hard code at increment, right now its hard coded at direction 2 ---> Done!
// need to figure out event hover stuff, the event that activates the flip
//  first idea (for optimization): when hover is first noticed, calculate perpendicular distance
//  from all sides, and mark the side with the smallest distance
//  when hover is first not active, do the same
//  flip along the axis of the side that is not marked

//10-1: had problem where it was only mouse checking the last one in array
//      because the checker is checking is point in path, the last drawn path
//      need to draw and check, draw and check

//10-2; two options for wall check, either gather all wall checks for all frames and only take the first and last
//                                  or make check_mouse if function unique

// 10-9: have to fix check_mouse_new, right now its confused

"use strict"

var canvas;
var ctx;
var timer;
var fps = 100;

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
		this.all_pt = [this.midx, this.midy, this.leftx, this.lefty, this.rightx, this.righty];
	    // this is updating the sinusoidal increment
	    this.angle_x = 0;
	    this.angle_y = 0;

	    // [initial set, final set] will be fixed points, will not update
	    this.runner_pt = [0,0,0,0];

	    // midpoint of the anchor line, the line created by the two points that are not moving
	    // will not update after the first point moving
	    this.radius = [0,0];

	    // this array stores the closest wall when entering and exiting the triangle
	    // walls are labeled by the point across from it; 0 is bot, etc;
	    this.wall = [0,0,0];

	    // stores the previous bool for when checkMouse case
	    this.mouse_capt = false;

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

		// based off all_pt
		ctx.moveTo(this.all_pt[0], this.all_pt[1]);
        ctx.lineTo(this.all_pt[2], this.all_pt[3]);
        ctx.lineTo(this.all_pt[4], this.all_pt[5]);

		ctx.closePath();

		ctx.stroke();
		ctx.fillStyle="black";
		ctx.fill();


        // if the flip is halfway through its animation, fill it
        // if (this.step_count >= this.number_of_steps/2)
        // {
        //     ctx.fillstyle="white";
        //     ctx.fill();
        // }

  //       ctx.font = "10px Arial";
		// ctx.fillStyle="red";
  //       ctx.fillText(iteration_table.drawn_roster.indexOf(this),this.center_pt_x-10,this.center_pt_y+this.flip*10);
		// ctx.fillStyle="white";
	}

    // only for debugging, this highlights the triangles about to be checked; the triangles intersecting the previous current mouse pos
    draw_checked_ts() {
        canvas = document.getElementById("title_canvas");
        ctx = canvas.getContext("2d");
        ctx.beginPath();

        // based off all_pt
        ctx.moveTo(this.all_pt[0], this.all_pt[1]);
        ctx.lineTo(this.all_pt[2], this.all_pt[3]);
        ctx.lineTo(this.all_pt[4], this.all_pt[5]);

        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "pink";
        ctx.fill();

        ctx.fillText(iteration_table.drawn_roster.indexOf(this),this.center_pt_x-10,this.center_pt_y+this.flip*10);
    }

    check_mouse_new() {
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[0], this.all_pt[1], this.all_pt[2], this.all_pt[3])) this.wall[2] = 1;
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[2], this.all_pt[3], this.all_pt[4], this.all_pt[5])) this.wall[0] = 1;
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[4], this.all_pt[5], this.all_pt[0], this.all_pt[1])) this.wall[1] = 1;

        //console.log("wall " + iteration_table.drawn_roster.indexOf(this) + ": " + this.wall);

        if (this.wall[0]+this.wall[1]+this.wall[2] == 2)
        {
            iteration_table.add_ani(this);
            this.point_moving(this.wall.indexOf(0));

            // now I dont need to check_mouse anymore, just make check_mouse nothing
            this.check_mouse_new = function() {};
        }
    }

	point_moving(direction) {
        //console.log(direction);
        switch(direction)
        // {
        //     case 0: // across the horizontal
        //         this.runner_pt[0] = this.all_pt[0]; // initial x of runner
        //         this.runner_pt[1] = this.all_pt[1]; // initial y of runner
        //         this.runner_pt[2] = this.all_pt[0]; // final x of runner
        //         this.runner_pt[3] = this.all_pt[1]+this.flip*Math.sqrt(3)*this.side; // final y of runner
        //         break;
        //     case 1: // flipping from left to right
        //         this.runner_pt[0] = this.all_pt[2]; // initial x of runner
        //         this.runner_pt[1] = this.all_pt[3]; // initial y of runner
        //         this.runner_pt[2] = this.all_pt[0]+this.side; // final x of runner
        //         this.runner_pt[3] = this.all_pt[1]; // final y of runner
        //         break;
        //     case 2:
        //         this.runner_pt[0] = this.all_pt[4]; // initial x of runner
        //         this.runner_pt[1] = this.all_pt[5]; // initial y of runner
        //         this.runner_pt[2] = this.all_pt[0]-this.side; // final x of runner
        //         this.runner_pt[3] = this.all_pt[1]; // final y of runner
        //         break;
        // }

				{
						case 0: // across the horizontal
								this.runner_pt[0] = this.all_pt[0]; // initial x of runner
								this.runner_pt[1] = this.all_pt[1]; // initial y of runner
								this.runner_pt[2] = this.all_pt[0]; // final x of runner
								this.runner_pt[3] = this.all_pt[3]; // final y of runner
								break;
						case 1: // flipping from left to right
								this.runner_pt[0] = this.all_pt[2]; // initial x of runner
								this.runner_pt[1] = this.all_pt[3]; // initial y of runner
								this.runner_pt[2] = (this.all_pt[0]+this.all_pt[4])/2; // final x of runner
								this.runner_pt[3] = (this.all_pt[1]+this.all_pt[5])/2;; // final y of runner
								break;
						case 2:
								this.runner_pt[0] = this.all_pt[4]; // initial x of runner
								this.runner_pt[1] = this.all_pt[5]; // initial y of runner
								this.runner_pt[2] = (this.all_pt[0]+this.all_pt[2])/2;; // final x of runner
								this.runner_pt[3] = (this.all_pt[1]+this.all_pt[3])/2;; // final y of runner
								break;
				}

        this.radius[0] = (this.runner_pt[2] - this.runner_pt[0])/2;
        this.radius[1] = (this.runner_pt[3] - this.runner_pt[1])/2;
	}

    increment(direction) {
        // need to make it sinusoidal, increment angle linearly and grab the sine of it

        // triangle goes through angle 0-PI, but need to shift it so zero point is midpoint

        // not -=, need to grab the starting value from movingcoord

        this.all_pt[2*direction] = this.runner_pt[0] + this.radius[0]*(1-Math.cos(this.angle_x));
        this.all_pt[2*direction+1] = this.runner_pt[1] + this.radius[1]*(1-Math.cos(this.angle_y));

        this.angle_x += this.step_size;
        this.angle_y += this.step_size;
        this.step_count += 1;
        //console.log("step count: " + this.step_count);
        if (this.step_count >= this.number_of_steps-1)
        {
            iteration_table.remove_ani(this);
			this.draw = function() {};
            this.increment = function() {};

        }
    }

}

// outputs an array containing the mouse position [x, y]
function get_mouse_position(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left,evt.clientY - rect.top];
}

let iteration_table = {
    drawn_roster: [],
    animation_roster: [],
    length: 1,
    number_of_steps: function() {return this.length*fps;},
    add_ani: function(x) {
        // this is a efficiency move, i believe; not checking for dups and instead removing from the first list
        // this doesnt work, drawing is messed up

        //this.animation_roster.push(x);

        let index = this.animation_roster.indexOf(x);
        if(typeof this.animation_roster[index] === 'undefined') this.animation_roster.push(x);
    },
    remove_ani: function(x) {
        let index = this.animation_roster.indexOf(x);
        this.animation_roster.splice(index,1);
    },

    remove_undug: function(x) {
        let index = this.drawn_roster.indexOf(x);
        //this.drawn_roster.splice(index,1);
				//drawn_roster[index]=null;
    }
}

// any way to make this not global?
var previous_mouse_pt = [];
var current_mouse_pt = [];

function init() {
    canvas = document.getElementById("title_canvas");
    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight;
    ctx = canvas.getContext("2d");

    //let side_length = 50;
    //let height = Math.sqrt(3)/2*side_length;
    //let canvas_width = 500;
    //let width_ct = 2*canvas_width/(side_length);

    for (let i = 0; i < 260; i++)
    {
        // for the flip, need to convert 0->1, 1-> -1 --> *-2+1
        let tri=new Triangle(0+side_length*(i%width_ct)/2, // for every side length there is two triangles, so iterate by half tri
                             0+height *~~(i/width_ct), // use the big triangle to find height of each triangle
                             side_length, // length of the side, just a parameter we need to put in
                             ((i%2)^((i/width_ct)%2))*-2+1); // how to flip, distinction between even and odd rows
        iteration_table.drawn_roster.push(tri); // (i/20)%2
    }

    canvas.addEventListener("mousemove", function(evt) {
        previous_mouse_pt = current_mouse_pt;
        current_mouse_pt = get_mouse_position(canvas, evt);
        console.log(current_mouse_pt);
    }, false);


    timer = setInterval(draw_main, 1000/fps);
    return timer;
}

// want to keep number of triangles even across platforms and different aspect ratios
let total_triangles = 240;
let vertical_scale = window.innerHeight/(Math.sqrt(3)/2);
let horizontal_scale = window.innerWidth/2;

let scaler = Math.sqrt(total_triangles/(horizontal_scale*vertical_scale));

let horizontal_triangles = horizontal_scale*scaler;


let side_length = window.innerWidth/horizontal_triangles*1.1;
let height = Math.sqrt(3)*side_length/2;
let width_ct = 2*Math.floor(horizontal_triangles);

function draw_main() {
    // clear the screen first
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // loop through all triangles in the drawn_roster, draw them and check_mouse
    for (let i=0; i<iteration_table.drawn_roster.length; i++)
    {
        iteration_table.drawn_roster[i].draw();

        //iteration_table.drawn_roster[i].check_mouse();
    }

    let left_pt = ((previous_mouse_pt[0]<current_mouse_pt[0]) ? previous_mouse_pt : current_mouse_pt );
    let right_pt = ((previous_mouse_pt[0]>current_mouse_pt[0]) ? previous_mouse_pt : current_mouse_pt );;



    // to determine which row the points lie, have to subtract y coord from the topmost level
    // first term is the ycoord with respect to the top of the row;
    let left_row = ~~((left_pt[1] + Math.sqrt(3)*side_length/4)/height);
    let left_column = ~~(left_pt[0]/(side_length/2));

    let right_row = ~~((right_pt[1] + Math.sqrt(3)*side_length/4)/height);
    let right_column = ~~((right_pt[0]+side_length/2)/(side_length/2));

    // declaring the triangle indexes
    let left_index = width_ct*left_row + left_column;
    let right_index = width_ct*right_row + right_column;

    // establishing the topleft index, from which we will iterate
    let lefttop_index = Math.min(left_row, right_row)*width_ct + left_column;

    // +1 because it needs to check the row the bottom coord is on, and the column the rightmost is on
    let x_range = (right_column-left_column)+1;
    let y_range = Math.abs(left_row-right_row) + 1;

    //console.log(x_range + ":" + y_range);

    // now need to run through the indexes established by the square of the tri indexes
    // IN THIS LOOP, I NEED TO DO MOUSE_CHECKING_NEW
    for (let i = 0; i<x_range*y_range; i++)
    {
        //console.log("mouse_check index: " + (leftmost_index + i%x_range + ~~(i/x_range)));
        //iteration_table.drawn_roster[lefttop_index + i%x_range + ~~(i/x_range)*width_ct].draw_checked_ts();
        iteration_table.drawn_roster[lefttop_index + i%x_range + ~~(i/x_range)*width_ct].check_mouse_new();
    }

    ctx.beginPath();
    ctx.moveTo(previous_mouse_pt[0], previous_mouse_pt[1]);
    ctx.lineTo(current_mouse_pt[0], current_mouse_pt[1]);
    ctx.closePath();
    ctx.stroke();

    //console.log("ppo");


    // loop through all triangles in the animation_roster(dugup roster), and increment them
    // can just draw them in here as well --> didnt work
    for (let i=0; i<iteration_table.animation_roster.length; i++)
    {
        iteration_table.animation_roster[i].increment(iteration_table.animation_roster[i].wall.indexOf(0));

    }
}

function index_from_point(arr) {
    return width_ct*~~((arr[1]+Math.sqrt(3)*side_length/4)/height) +
                    ~~(arr[0]/(side_length/2));
}

// line segment intersection code
// implement with mouse pos functions, past and current?

// checks if point q lies on line segment qr if collinear
function on_segment(px,py,qx,qy,rx,ry)
{
    if (qx <= Math.max(px, rx) && qx >= Math.min(px,rx) &&
        qy <= Math.max(py, ry) && qy >= Math.min(py,ry))
        return true;
    return false;
}

function orientation(px,py,qx,qy,rx,ry) {
    let val = (qy-py)*(rx-qx)-
              (qx-px)*(ry-qy);

    if (val==0) return 0;
    return (val >0)?1:2;
}

function do_intersect(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
    // first find orientations
    let o1 = orientation(p1x,p1y,q1x,q1y,p2x,p2y);
    let o2 = orientation(p1x,p1y,q1x,q1y,q2x,q2y);
    let o3 = orientation(p2x,p2y,q2x,q2y,p1x,p1y);
    let o4 = orientation(p2x,p2y,q2x,q2y,q1x,q1y);

    if (o1 != o2 && o3 != o4)
        return true;

    if (o1 == 0 && on_segment(p1x,p1y,p2x,p2y,q1x,q1y)) return true;
    if (o2 == 0 && on_segment(p1x,p1y,q2x,q2y,q1x,q1y)) return true;
    if (o3 == 0 && on_segment(p2x,p2y,p1x,p1y,q2x,q2y)) return true;
    if (o4 == 0 && on_segment(p2x,p2y,q1x,q1y,q2x,q2y)) return true;

    return false;

}
