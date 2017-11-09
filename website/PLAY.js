const game = function() 
{
   let test; // ignore this
   let hero; // mr. birdie
   let obstacles = []; // poles "obstacles"
   let score; // NOT SCORE INT VARIABLE, AN ACTIVE GUI COMPONET
   let level = 1; // starting level
   let audio = new Audio('sfx/03. Hyrule Overworld Theme (The Legend of Zelda - a Link to the Past).flac'); // default music
   let level_up_text = false; // have I recently leveled up? should I show level up text?
   let done_with_reguler_background = false; // switch between backgrounds indicator
   let background_loop_call; // helps me link inner function with external functions 
   let cheat = false; // CHEAT MODE, use at your own risk
   const bg_refresh_rate = 50; // instead of FPS control, since there is only one canvas a simple recall to refresh rate is sufficient
   const arena_refresh_rate = 20;
   let crashed_once = 0; // behavior variable
   const text_overlay = 30; // text overlay diff, calculated
   const gravity_down = 0.05; // how much gravity affects going down
   const gravity_up = -0.2; // how much gravity affects when going up (minus gravity)
   
   const canvas_play_width = 720; //self explaining
   const canvas_play_height = 480; //self explaining
   
   const canvas_highscore_width = 480; //self explaining
   const canvas_highscore_height = 224; //self explaining
   
   const how_many_top_scores = 5; //self explaining
   
   const play_font_size = 10; //self explaining
   const highscore_font_size = 8; //self explaining
   const arena_frame_speed = 1; // arena move speed
   
   const obstacle_width = 10; // self explaining
   
   const obstacle_min_height = 30; // self explaining
   const obstacle_max_height = 200; // self explaining
   const obstacle_gap_min = 70; // self explaining
   const obstacle_gap_max = 200; // self explaining
   
   const amount_of_level_up_sounds = 8; // self explaining
	audio.addEventListener('play',function() 
	{
		const time = 55; // predefined for loop
		setTimeout(() => {audio.pause();audio.currentTime=0; audio.play()}, time*1000); // 1000 = second
	},false);
   audio.play();
   let flap; // wings flap at the press of a mouse.... plays only when mouse is played
   flap = new Audio("sfx/flap.mp3");
   flap.addEventListener('ended',function() // adds an endless loop to the flapping, so when long press is there I won't have to replay it, meaning only manage pause-play scenerio
   {
		this.currentTime = 0;
		this.play();
   },false);
   const initModule = function() // game start...
   {
	    hero = new component(40, 40, "red", 30, 120, "hero"); // define a graphical dimensions for birdy, // 30 is the margin left from the starting position
		hero.gravity = gravity_down; // so birdy will fall at default. (newton was right?)
		hero.img.onload = function() // setting animation "squares" on the image
		{
			hero.frameWidth = hero.img.width / 4; // 4 across images
			hero.frameHeight = hero.img.height / 2; // 2 rows of images
		};
		score = new component("30px", "Consolas", "GoldenRod", 280, 40, "text"); // define a graphical implentation for the score...
		arena.start();
		const press = function(e) // on "lifts mouse" aka click released, gravity is back
		{
			e.preventDefault();
			if(crashed_once == 0)
			{
				flap.pause();
				accelerate(gravity_down);
			}
		};
		const released =  function(e) // other case, gravity kicks in on click
		{
			e.preventDefault();
			if(crashed_once == 0)
			{
				flap.play();
				accelerate(gravity_up);
			}
		};
		
		arena.canvas.addEventListener("mouseup", press, false);
		arena.canvas.addEventListener("mousedown", released, false);
		arena.canvas.addEventListener("touchstart", released, false);
		arena.canvas.addEventListener("touchend", press, false);
		
		scrolling_background("animations/_sky2.png",false);
		window.onkeypress = (e) =>
		{
			if(e.which == 99 || e.keyCode == 99) // button C
				cheat = !cheat;
		};
   };
	const scrolling_background = function(path, shouldreq, functocover) // scrolling background "function"
	{
		const default_speed = 90;
		let canvas = arena.canvas; // reference
		let ctx = arena.context;
		let totalSeconds = 0; // from shay's idea
		let looping = false;
		let img = new Image(); // the image
		img.src = path;
		let deltaseconds=0,lastframetime=0; // from shay's idea
		img.onload = function() // workaround that works in chrome for image load parameter overloading
		{
			draw(0);
			startStop();
		};
		const loop = function() // the loop that calls draw and gathers time information
		{
			if(shouldreq)
				requestAnimationFrame(loop);
			deltaseconds = (Date.now() - lastframetime)/1000;
			lastframetime = Date.now();
			draw(deltaseconds);
		};
		const startStop = function()  // wanted to implement sine effect of the image, turned out ugly
		{
			looping = !looping;

			if (looping) 
			{
				lastFrameTime = Date.now();
				if(shouldreq)
					requestAnimationFrame(loop);
			}
		};
		const draw = function(delta)
		{
			totalSeconds += delta;
			let v = default_speed;
			let num = Math.ceil(canvas.width / img.width) + 1;
			let xpos = totalSeconds * v % img.width;
			ctx.save();
			ctx.translate(-xpos, 0);
			for (let i = 0; i < num; i++) 
			{
				ctx.drawImage(img, i * img.width, 0);
			}
			ctx.restore();
			if(shouldreq)
				functocover();
			
		};
		background_loop_call = loop;
	};
   let arena = 
   {
	    canvas : document.createElement("canvas"), 
		start : function()  // arena init...
		{
			this.canvas.width = canvas_play_width;
			this.canvas.height = canvas_play_height;
			this.canvas.id = "canvas";
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas, document.body.childNodes[0]);
			this.frameNo = 0;  // for animation
			this.interval = setInterval(update, arena_refresh_rate); // pace the stuff moves left
			this.framesWidth = 4; // animation stuff -> hero rendering, which MUST be done WITH the arena rendering
			this.frameHeight = 2;
			this.currentFrame = 0;
			this.currentFrameHeight = 0;
			this.maxticks = 4;
			this.currenttick = 0;
        },
		clear: function()
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
		}
		,
		update: function()
		{
			this.currenttick++;
			if(this.currenttick == this.maxticks)
			{
				this.currenttick = 0;
				this.currentFrame++;
				if(this.currentFrame == this.framesWidth)
				{
					this.currentFrame = 0;
					this.currentFrameHeight++;
					if(this.currentFrameHeight >= this.frameHeight)
						this.currentFrameHeight = 0;
					
				}
			}
		}
   };
   
   let component = function(width, height, color, x, y, hero_or_foe)  // general class (sorta) to hold all obstacles, heroes and score graphical compononets
   {
	this.type = hero_or_foe;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
	if(this.type == "hero")
	{
		this.img = new Image();
		this.img.src = "animations/bird.png";
		this.frameWidth;// = 2392 / 4; // because firefox hates to deal with image width and height before loading it
		this.frameHeight;// = 804 / 2;// because firefox hates to deal with image width and height before loading it 
	}
    this.update = function() 
	{
        ctx = arena.context;
        if (this.type == "hero") // case is a hero, draw the effing bird
		{
			ctx.drawImage(this.img, arena.currentFrame * this.frameWidth, arena.currentFrameHeight*this.frameHeight, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
			
        } 
		else if(this.type == "text") // mainly score
		{
			ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
		}
		else if(this.type == "foe") // obstacle, just big lines of a color I will choose later
		{
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
		if(level_up_text == true)
		{
			arena.context.font = play_font_size + " " + play_font_size;
            arena.context.fillStyle = 'green';
            arena.context.fillText("Leveled up! יופי שי :]", arena.canvas.width/2,(arena.canvas.height/2) - text_overlay );
		}
    };
    this.newPos = function() // position compute
	{
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.grounded(); // makes sure I won't reach the skies lol
		if(this.y < 0) // makes sure I won't go below ground...
		{
			this.y=0;
			this.gravitySpeed = 0; // how does newton explain that gravity pushes you down but when you are down.. something must resist you going more down than the ground? Normal force.
		}
    };
    this.grounded = function() 
	{
        let diff_height = arena.canvas.height - this.height; 
        if (this.y > diff_height) {
            this.y = diff_height;
            this.gravitySpeed = 0;
        }
    };
    this.intersect = function(otherobj) // square thinking of computation on my part, for intersectoin between birdie and poles
	{
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        let otherleft = otherobj.x;
        let otherright = otherobj.x + (otherobj.width);
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + (otherobj.height);
        let crash = true; // relaized thinking about it the other way around is smarter... if I managed to not evade EACH obstacle, I did manage to crash.
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) 
		{
            crash = false;
        }
        return crash;
    };	 
   };
   let update = function()
   {
			let x, height, gap, minHeight, maxHeight, minGap, maxGap;
			for (i = 0; i < obstacles.length; i++)  
			{
				if (hero.intersect(obstacles[i])) 
				{
					if(!cheat)
					{	
						crashed();
						return;
					}
				} 
			}
				
			arena.clear();
			background_loop_call();
			arena.frameNo += arena_frame_speed;
			if (arena.frameNo == 1 || framefilter(150)) // generally some kind of interval that I will spawn a new pole (obstacle)
			{
				x = arena.canvas.width; // precomputed variables down, the current X width here
				height = Math.floor(Math.random()*(obstacle_max_height-obstacle_min_height+1)+obstacle_min_height); // random height, must be above minHeight defines (or equal)
				gap = Math.floor(Math.random()*(obstacle_gap_max-obstacle_gap_min+1)+obstacle_gap_min);
				obstacles.push(new component(obstacle_width, height, "green", x, 0,"foe"));
				obstacles.push(new component(obstacle_width, x - height - gap, "green", x, height + gap,"foe"));
			}
			for (i = 0; i < obstacles.length; i ++) 
			{
				obstacles[i].x += -1; // moves left
				obstacles[i].update();
			}
			if(arena.frameNo >= level*1000)
			{
				level++; // level up!
				animate();
			}
			score.text="SCORE: " + arena.frameNo;
			score.update();
			hero.newPos();
			hero.update();
			arena.update();
			
	};  
	const animate = function() // could make the game more difficult per level, don't really want to.
	{
		level_up_text = true;
		let random_sound_decision_is;
		// = Math.floor(Math.random() * amount_of_level_up_sounds); // --> Used to be that, simply fair.. but games aren't fair
		
		const p = Math.random();
		if(p>=0 && p<=0.2)
			random_sound_decision_is=0;
		else if(p>0.2 && p<=0.4)
			random_sound_decision_is=1;
		else if(p>0.4 && p<=0.6)
			random_sound_decision_is=2;
		else if(p>0.6 && p<=0.8)
			random_sound_decision_is=3;
		else
			random_sound_decision_is = Math.floor(Math.random() * (amount_of_level_up_sounds-4)) + 3;
		let zelda_puzzle_solved = new Audio('sfx/lvlup_'+random_sound_decision_is + '.wav');
		zelda_puzzle_solved.play();
		draw_pegasus();
	}
	const draw_pegasus = function()
	{
		let img = new Image();
		img.src = "animations/pegasus.png";
		let frames = 4;
		let fw;// = 1024/frames; // Firefox has problems with reading image dimensions straight
		let fh;// = 751/4; // Firefox has problems with reading image dimensions straight
		img.onload = function()
		{
			fw = img.width / frames;
			fh = img.height / frames;
		};
		let currentwidth = 0;
		let currentheight = 0;
		let ticks = 2; // yes kind of pointless, added for modularity at testing phase
		let currentTick = 0;
		let interval;
		
		const f = () => update();
		const update = function()
		{
			currentTick++;
			if(currentTick == ticks)
			{
				currentTick = 0;
				currentwidth++;
				if(currentwidth == frames)
				{
					currentwidth=0;
					currentheight++;
					if(currentheight == 4)
					{
						clearInterval(interval);
						level_up_text = false;
					}
					
				}
				
			}
			draw();
		};
		
		const draw = () => arena.context.drawImage(img,currentwidth*fw, currentheight*fh, fw,fh,arena.canvas.width/2,arena.canvas.height/2,arena.canvas.width/7, arena.canvas.height/7);
		interval = setInterval(f, bg_refresh_rate); // keep high score animated
	};
	
	const framefilter = (n) => {return (arena.frameNo / n) % 1 == 0;};	
	const accelerate = (n) => hero.gravity = n;
	const crashed = function() // when crashed
	{
		if(crashed_once != 0) // ensures single call
			return;
		audio.pause(); // stops previous music, highscore music start
		audio = new Audio('sfx/Ttrs - GB Scores.mp3');
		audio.addEventListener('ended',function() 
		{
			this.currentTime = 0;
			this.play();
		},false);
		audio.play();
		crashed_once = 1; // flags indicator
		arena.clear(); // clears screen
		let name = "";
		input = new CanvasInput({ // to grab user name via canvas // copied from stack overflow...
		  canvas: document.getElementById('canvas'),
		  fontSize: 18,
		  fontFamily: 'Arial',
		  fontColor: '#212121',
		  fontWeight: 'bold',
		  width: 300,
		  padding: 8,
		  borderWidth: 1,
		  borderColor: '#000',
		  borderRadius: 3,
		  boxShadow: '1px 1px 0px #fff',
		  innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
		  placeHolder: 'Enter name here...',
		  onsubmit: function()
		  {
			  name = this.value();
			  rest_of_function();
			 
			  return true;
		  }
		});
		const rest_of_function = function()
		{
			document.body.removeChild(document.body.firstChild); // removes canvas with input
			arena.canvas = document.createElement("canvas"); // reinserts canvas as a clean new one
			arena.canvas.width = canvas_highscore_width;
			arena.canvas.height = canvas_highscore_height;
			arena.canvas.id = "canvas";
			arena.context = arena.canvas.getContext("2d");
			document.body.insertBefore(arena.canvas, document.body.childNodes[0]);
			let highscore = localStorage.getItem("highscore"); // grabs local storage
			let arr = JSON.parse(highscore);
			if(arr !== null) // case local storage had previous values
			{
				if(arr instanceof Array)
				{
				}
				else // case only one value in local storage (therefore not an array)
				{
					let arr2 = [];
					arr2.push(JSON.stringify(arr));
					arr = arr2;
				}
				let obj = new Object();
				obj.name = name;
				obj.score = arena.frameNo; // push current highscore + name
				arr.push(JSON.stringify(obj));
				arr.sort((a,b) => {return JSON.parse(b).score - JSON.parse(a).score;}); // resorts to make sure top 10...
				localStorage.setItem("highscore",JSON.stringify(arr));
			}
			else // case no high score
			{
				let arr2 = [];  // creates new one
				let obj = new Object();
				obj.name = name;
				obj.score = arena.frameNo;
				arr2.push(JSON.stringify(obj)); // pushes current score
				localStorage.setItem("highscore", arr2); // sets it
				arr = arr2;
			}
			const draw_table = function()
			{
				const starting_position_text_y = 20;
				const starting_position_text_x = 10;
				let i;
				let txt = "Highscore";
				ctx = arena.context;
				ctx.font = highscore_font_size + " " + highscore_font_size;
				ctx.fillStyle = 'black';
				ctx.fillText(txt, arena.canvas.width/2 + starting_position_text_x, starting_position_text_y);
				let w = text_overlay;
				for(i=0; i<arr.length && i<how_many_top_scores; i++) // prints top 5 scores, retracted from the original 10 thought (not clear what screen Shay tests it on)
				{
					let item = JSON.parse(arr[i]);
					if(item instanceof Array) // a fixed bug... still here?
					{
						let j=0;
						for(j=0; j<item.length; i++)
						{
							console.log("is arr");
						}
					}
					else
					{
						if(item.name) // case Stringfy managed to corrupt item for some weird ass reason
						{
							txt="Name: " + item.name + " Score: " + item.score;
							switch(i)
							{
								case 0:
										ctx.fillStyle = 'Gold';
										break;
								case 1:
										ctx.fillStyle = 'Indigo';
										break;
								case 2:
										ctx.fillStyle = 'Olive';
										break;
								case 3:
										ctx.fillStyle = 'Silver';
										break;
								case 4:
										ctx.fillStyle = 'Violet';
										break;
								default:
										ctx.fillStyle = 'Black';
										break;
							}
							ctx.fillText(txt, arena.canvas.width/2, starting_position_text_y + w);
							w+=text_overlay; // difference in height, so fonts wont overlap
						}
					}
				}
				
			};		
			scrolling_background("animations/mario.gif",true,draw_table); // calls to animate a scrolling background of a mario level and to also render the table
			replay_button();
		};
	};
	
	const replay_button = function()
	{
		let btn = document.createElement("BUTTON");
		btn.value = "Replay the game";
		btn.innerHTML = btn.value;
		btn.onclick = function()
		{
			location.reload();
		};
		btn.height = "50px";
		btn.width = "70px";
		btn.style.backgroundColor = "yellow";
		btn.align = "center";
		document.body.appendChild(btn);
	}
   return {initModule};
}();


$( document ).ready(function() 
{	
	game.initModule();	
});
