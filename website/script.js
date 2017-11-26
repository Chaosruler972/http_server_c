
const ball = (function ()
{

	/*
		canvas properties
	*/
	const line_width = 15;
	const floor_color = 'green';
	const wall_color = 'blue';
	const canvas_width = 1920;
	const canvas_height = 1080;

	let canvas = document.createElement("canvas"); // initates canvas
	/*
		states canvas size
	*/
	canvas.width = canvas_width;
	canvas.height = canvas_height;

	let ctx = canvas.getContext('2d'); // gets canvas 2d context to work with

	window.onload = () => document.body.appendChild(canvas); // adds canvas to html, waits for window to load to do it
																														// uses the () => ES6 syntax



	const a = 9.8; // accleration constant
	const FAC = 0.8 // lose speed at rate of 80% when "hitting" the floor
	const radius = 30; // 30px ball radius
	const color = 'orange'; // color, basketball = orange

	const x_movement = true; // just a parameter to x movement at all
	/*
		initation of ball place
	*/
	let x = (x_movement) ? line_width/2: radius+line_width/2; // if theres no X movement, place the ball at the start of the screen width width 0 radius, else place it at the corner
	let y = line_width/2;

	/*
		initation of ball velocity
	*/
	const v_x_direction = (x_movement) ? 2 : 0; // just the direction the ball will "roll" into, if states that if there's no direction, speed will be 0 (no movement)
	let v_y_direction = 0;

	const sync_time = 1000/60; // being sync 1 "sec", at 60 "frames per second" in ms
	const ms_to_second_factor = 0.01; // multiply any ms in this to convert it to seconds, for physics



	const initModule = () => setInterval(draw_ball,sync_time); // sets up a timer () =>  function example

	const draw_ball = () => // () => {} function exmaple
	{
		clear_scren();
		update();
		ctx.fillStyle = color;
		/*
			ball drawing
		*/
		ctx.beginPath();
		ctx.arc(x,y,radius,0,2*Math.PI,true);
		ctx.fill();
		ctx.closePath();

		/*
			walls
		*/
		draw_line(0,0,0,canvas.height,wall_color);
		draw_line(canvas.width,0,canvas.width,canvas.height,wall_color);

		/*
			floor
		*/
		draw_line(0,canvas.height,canvas.width,canvas.height,floor_color);
	}

	const update = () => // () => {} function example!
	{
		const t = sync_time*ms_to_second_factor; // grab the time (dt)
		/*
			handle y coridnates update
		*/
		y+=v_y_direction*t + 0.5*a*Math.pow(t,2); // y=y0 + v0*t + a(t^2)/2
		v_y_direction += a*t; // new speed calculation



		if(y>canvas.height - radius - line_width/2) // case ball "hits" the floor
		{
			y = canvas.height - radius - line_width/2; // put the ball on the floor
			v_y_direction*=-FAC; // "changes direction" AND "reduces speed" by predefined factor
		}

		/*
			handle x cordinates update
		*/
		x+=v_x_direction; // new X cordinates
		wrap();


	}

	const wrap = () => (x > canvas.width + radius + line_width/2) ? x=radius+line_width/2: x=x;  // parameter => ( if statement) true:false example!

	/*
		simple subroutine to draw a line with color parameter, I wrote it with (parameter) => {} ES6 example
	*/
	const draw_line = (start_x,start_y,end_x,end_y,color) =>
	{
		ctx.strokeStyle = color;
		ctx.lineWidth = line_width;
		ctx.beginPath();
		ctx.moveTo(start_x,start_y);
		ctx.lineTo(end_x,end_y);
		ctx.stroke();
		ctx.closePath();
	}

	const clear_scren = () => ctx.clearRect(0,0,canvas.width,canvas.height); // the () => function syntax example
	return { initModule}
}
());


$( document ).ready(function()
{
		ball.initModule();
});
