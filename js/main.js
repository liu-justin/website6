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

        ctx.font = "10px Arial";
        ctx.fillText(iteration_table.undug_roster.indexOf(this),this.center_pt_x-10,this.center_pt_y+this.flip*10);
	}

    // only for debugging, this highlights the triangles about to be checked; the triangles intersecting the previous current mouse pos
    draw_fill() {
        canvas = document.getElementById("title_canvas");
        ctx = canvas.getContext("2d");
        ctx.beginPath();

        // based off all_pt
        ctx.moveTo(this.all_pt[0], this.all_pt[1]);
        ctx.lineTo(this.all_pt[2], this.all_pt[3]);
        ctx.lineTo(this.all_pt[4], this.all_pt[5]);
        
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
    }

    check_mouse_new() {
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[0], this.all_pt[1], this.all_pt[2], this.all_pt[3])) this.wall[2] = 1;
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[2], this.all_pt[3], this.all_pt[4], this.all_pt[5])) this.wall[0] = 1;
        if (do_intersect(previous_mouse_pt[0], previous_mouse_pt[1], current_mouse_pt[0], current_mouse_pt[1],
         this.all_pt[4], this.all_pt[5], this.all_pt[0], this.all_pt[1])) this.wall[1] = 1;

        //console.log("wall: " + this.wall);

        if (this.wall[0]+this.wall[1]+this.wall[2] == 2)
        {
            iteration_table.mod_ani(true, this);
            this.point_moving(this.wall.indexOf(0));

            // now I dont need to check_mouse anymore, just make check_mouse nothing
            this.check_mouse_new = function() {};
        }
    }

	point_moving(direction) {
        console.log(direction);
        switch(direction)
        {
            case 0: // across the horizontal
                this.runner_pt[0] = this.all_pt[0]; // initial x of runner
                this.runner_pt[1] = this.all_pt[1]; // initial y of runner
                this.runner_pt[2] = this.all_pt[0]; // final x of runner
                this.runner_pt[3] = this.all_pt[1]+this.flip*Math.sqrt(3)*this.side; // final y of runner
                break;
            case 1: // flipping from left to right
                this.runner_pt[0] = this.all_pt[2]; // initial x of runner
                this.runner_pt[1] = this.all_pt[3]; // initial y of runner
                this.runner_pt[2] = this.all_pt[0]+this.side; // final x of runner
                this.runner_pt[3] = this.all_pt[1]; // final y of runner
                break;
            case 2:
                this.runner_pt[0] = this.all_pt[4]; // initial x of runner
                this.runner_pt[1] = this.all_pt[5]; // initial y of runner
                this.runner_pt[2] = this.all_pt[0]-this.side; // final x of runner
                this.runner_pt[3] = this.all_pt[1]; // final y of runner
                break;
        }
        console.log(this.runner_pt);

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
        if (this.step_count >= this.number_of_steps)
        {
            iteration_table.remove_ani();
            this.increment = function() {};
        }
    }

}

// outputs an array containing the mouse position [x, y]
function get_mouse_position(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left,evt.clientY - rect.top];
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
var previous_mouse_pt = [];
var current_mouse_pt = [];

function init() {
    canvas = document.getElementById("title_canvas");
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
        iteration_table.undug_roster.push(tri); // (i/20)%2
    }

    let hori_a = [0,50];
    let hori_b = [100,50];
    let vert_a = [50,0];
    let vert_b = [50,100];

    console.log(do_intersect(hori_a, hori_b, vert_a, vert_b));


    
    canvas.addEventListener("mousemove", function(evt) {
        previous_mouse_pt = current_mouse_pt;
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

        //iteration_table.undug_roster[i].check_mouse();
    }

    // initializing the leftmost mouse point between current and past
    let leftmost;
    let rightmost;

    // declaring the leftmost mouse point
    if (previous_mouse_pt[0] < current_mouse_pt[0]) {
        leftmost = previous_mouse_pt;
        rightmost = current_mouse_pt;
    }
    else {
        leftmost = current_mouse_pt;
        rightmost = previous_mouse_pt;
    }
    

    // declaring the triangle indexes
    let leftmost_index = width_ct*~~((leftmost[1]+Math.sqrt(3)*side_length/4)/height) +
                    ~~(leftmost[0]/(side_length/2));
    
    let rightmost_index = width_ct*~~((rightmost[1]+Math.sqrt(3)*side_length/4)/height) +
                    ~~((rightmost[0]+side_length/2)/(side_length/2));
    if (rightmost_index == 0) rightmost_index = 1;

    // finding the y of both of the indices
    let leftmost_y = ~~(leftmost_index/width_ct);
    let rightmost_y = ~~(rightmost_index/width_ct);

    // establishing the topleft index, from which we will iterate
    let lefttop_index;
    if (leftmost_y <= rightmost_y) lefttop_index = leftmost_index;
    else lefttop_index = rightmost_index - ((rightmost_index%width_ct)-(leftmost_index%width_ct));

    // endcase condition
    if(rightmost_index == iteration_table.undug_roster.length) rightmost_index -= 1;

    let x_range = (rightmost_index%width_ct)-(leftmost_index%width_ct)+1;

    let y_range = Math.abs(~~(rightmost_index/width_ct)-~~(leftmost_index/width_ct))+1;

    // now need to run through the indexes established by the square of the tri indexes
    // IN THIS LOOP, I NEED TO DO MOUSE_CHECKING_NEW
    for (let i = 0; i<x_range*y_range; i++)
    {
        //console.log("mouse_check index: " + (leftmost_index + i%x_range + ~~(i/x_range)));
        iteration_table.undug_roster[lefttop_index + i%x_range + ~~(i/x_range)*width_ct].draw_fill();
        iteration_table.undug_roster[lefttop_index + i%x_range + ~~(i/x_range)*width_ct].check_mouse_new();
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

function index_from_point(point) {
    return width_ct*~~((point.y+Math.sqrt(3)*side_length/4)/height) +
                    ~~(point.x/(side_length/2));
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