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

        // will update midx
		this.all_pt = [[this.midx, this.midy], [this.leftx, this.lefty], [this.rightx, this.righty]];
        // this is updating the sinusoidal increment
        this.angle_x = 0;
        this.angle_y = 0;

        // [initial set, final set] will be fixed points, will not update
        this.runner_pt = [[0,0], [0,0]];

        // midpoint of the anchor line, the line created by the two points that are not moving
        // will not update after the first point moving
        this.radius = [0,0];

        // this array stores the closest wall to the mouse every single frame
        // ways to improve, only store when checkMouse turns from false to true, and true to false
        //this.closest_wall_to_mouse_pos = [];

        // this array stores the closest wall when entering and exiting the triangle
        // walls are labeled by the point across from it; 0 is bot, etc;
        this.wall = [];

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
		ctx.moveTo(this.all_pt[0][0], this.all_pt[0][1]);
		ctx.lineTo(this.all_pt[1][0], this.all_pt[1][1]);
		ctx.lineTo(this.all_pt[2][0], this.all_pt[2][1]);
		
		ctx.closePath();
		ctx.stroke();
	}

    check_mouse() {
        // need to check the second wall, need to keep a bool to mark how many times this occurs
        let current_mouse_capt = ctx.isPointInPath(current_mouse_pt.x, current_mouse_pt.y);
        if (current_mouse_capt == !this.mouse_capt)
        {  
            //iteration_table.add_ani(this);
            ////iteration_table.remove_undug(this);

            // if current = true when previous = false, then add; vice versa
            
            this.wall.push(this.check_wall());
            console.log(this.wall);

            // if the current mouse position is not in the tri when the previous one is, then the mouse has left
            // add the triangle to the animation roster, and calc its moving point from the 2 walls
            if (!current_mouse_capt && this.mouse_capt)
            {
                iteration_table.mod_ani(true, this);
                this.point_moving(3-this.wall[0]-this.wall[1]);

                // now I dont need to check_mouse anymore, just make check_mouse nothing
                this.check_mouse = function() {};
            }
            
        }
        this.mouse_capt = current_mouse_capt;
    }

    check_mouse_new() {

    }

    check_wall() {
        // all need to do is calc distances from the 3 points; whichever point is furthest away, the corresponding wall is closest
        let distances = [Math.sqrt(Math.pow(current_mouse_pt.x-this.all_pt[0][0],2)+Math.pow(current_mouse_pt.y-this.all_pt[0][1],2)),
                         Math.sqrt(Math.pow(current_mouse_pt.x-this.all_pt[1][0],2)+Math.pow(current_mouse_pt.y-this.all_pt[1][1],2)),
                         Math.sqrt(Math.pow(current_mouse_pt.x-this.all_pt[2][0],2)+Math.pow(current_mouse_pt.y-this.all_pt[2][1],2))];

        let max = distances[0];

        for (let i = 1; i < distances.length; i++)
        {
            if (distances[i]>max) max = distances[i];
        }

        return distances.indexOf(max);
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
        if (this.step_count >= this.number_of_steps)
        {
            iteration_table.remove_ani();
            this.step_size=0;
        }
    }

}

function get_mouse_position(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
        //[evt.clientX - rect.left,evt.clientY - rect.top]
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
        // this is a efficiency move, i believe; not checking for dups and instead removing from the first list
        // this doesnt work, drawing is messed up

        //this.animation_roster.push(x);

        let index = this.animation_roster.indexOf(x);
        if(typeof this.animation_roster[index] === 'undefined') this.animation_roster.push(x);
    },
    remove_ani: function() {
        this.animation_roster.shift();
    },

    mod_ani: function(b, x) {
        if (b) this.add_ani(x);
        else this.remove_ani();
    },

    remove_undug: function(x) {
        let index = this.undug_roster.indexOf(x);
        this.undug_roster.splice(index,1);
    }
}

// any way to make this not global?
var past_mouse_pt;
var current_mouse_pt;

function init() {
    canvas = document.getElementById("title_canvas");
    ctx = canvas.getContext("2d");
    
    //let side_length = 50;
    //let height = Math.sqrt(3)/2*side_length;
    //let canvas_width = 500;
    //let width_ct = 2*canvas_width/(side_length);

    for (let i = 0; i < 200; i++)
    {
        // for the flip, need to convert 0->1, 1-> -1 --> *-2+1
        let tri=new Triangle(0+side_length*(i%width_ct)/2, // for every side length there is two triangles, so iterate by half tri
                             0+height *~~(i/width_ct), // use the big triangle to find height of each triangle
                             side_length, // length of the side, just a parameter we need to put in
                             ((i%2)^((i/width_ct)%2))*-2+1); // how to flip, distinction between even and odd rows
        iteration_table.undug_roster.push(tri); // (i/20)%2
    }

    canvas.addEventListener("mousemove", function(evt) {
        past_mouse_pt = current_mouse_pt;
        current_mouse_pt = get_mouse_position(canvas, evt);
    }, false);

    timer = setInterval(draw_main, 1000/fps);
    return timer;  
}

let side_length = 50;
let height = Math.sqrt(3)*side_length/2;
let canvas_width = 500;
let width_ct = 2*canvas_width/(side_length);

function draw_main() {
    // clear the screen first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // loop through all triangles in the undug_roster, draw them and check_mouse
    for (let i=0; i<iteration_table.undug_roster.length; i++)
    {
        iteration_table.undug_roster[i].draw();
        iteration_table.undug_roster[i].check_mouse();
    }

    // initializing the leftmost mouse point between current and past
    let leftmost;
    let rightmost;

    // declaring the leftmost mouse point
    if (past_mouse_pt.x < current_mouse_pt.x) {
        leftmost = past_mouse_pt;
        rightmost = current_mouse_pt;
    }
    else {
        leftmost = current_mouse_pt;
        rightmost = past_mouse_pt;
    }

    // declaring the triangle indexes
    let leftmost_index = width_ct*~~((leftmost.y+Math.sqrt(3)*side_length/4)/height) +
                    ~~(leftmost.x/(side_length/2));;
    let rightmost_index = width_ct*~~((rightmost.y+Math.sqrt(3)*side_length/4)/height) +
                    ~~((rightmost.x+side_length/2)/(side_length/2));

    // endcase condition
    if(rightmost_index == length(iteration_table.undug_roster)) rightmost_index -= 1;
    console.log("min: " + leftmost_index%width_ct);
    console.log("max: " + rightmost_index%width_ct);

    console.log("x coord: " + leftmost_index%width_ct);

    let x_range = (rightmost_index%width_ct)-(leftmost_index%width_ct);
    let y_range = Math.abs(~~(rightmost_index/width_ct)-~~(leftmost_index/width_ct));

    // now need to run through the indexes established by the square of the tri indexes
    for (let i = 0; i<x_range*y_range; i++)
    {
        iteration_table.undug_roster[leftmost_index + i%x_range + ~~(i/x_range)];
    }

    // loop through all triangles in the animation_roster(dugup roster), and increment them
    // can just draw them in here as well --> didnt work
    for (let i=0; i<iteration_table.animation_roster.length; i++)
    {
        iteration_table.animation_roster[i].increment(3-iteration_table.animation_roster[i].wall[0]-iteration_table.animation_roster[i].wall[1]);
        
    }
}

function index_from_point(point) {
    return width_ct*~~((point.y+Math.sqrt(3)*side_length/4)/height) +
                    ~~(point.x/(side_length/2));
}

// line segment intersection code
// implement with mouse pos functions, past and current?

// checks if point q lies on line segment qr if collinear
function on_segment(p,q,r)
{
    if (qx <= max(p[0], r[0]) && qx >= min(p[0],r[0]) &&
        qy <= max(p[1], r[1]) && qy >= min(p[1],r[1]))
        return true;
    return false;
}

function orientation(p,q,r) {
    let val = (q[1]-p[1])*(r[0]-q[0])-
              (q[0]-p[0])*(r[1]-q[1]);

    if (val==0) return 0;
    return (val >0)?1:2;
}

function do_interest(p1, q1, p2, q2) {
    // first fine orientations
    let o1 = orientation(p1,q1,p2);
    let o2 = orientation(p1,q1,q2);
    let o3 = orientation(p2,q2,p1);
    let o4 = orientation(p2,q2,p1);

    if (o1 != o2 && o3 != o4)
        return true;

    if (o1 == 0 && on_segment(p1,p2,q1)) return true;
    if (o2 == 0 && on_segment(p1,q2,q1)) return true;
    if (o3 == 0 && on_segment(p2,p1,q2)) return true;
    if (o4 == 0 && on_segment(p2,q1,q2)) return true;

    return false;

}