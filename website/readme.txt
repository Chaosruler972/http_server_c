
		In our game, we help our hero to skip across the endless-sky, the longer we help our friend, the better the score we have
		our friend has to evade obstacles along it's way by fitting in the gap inside them - in order to do so, our friend has to fly
		high and low as required, which is done by -Clicking the game screen-, the longer the click the higher our friend go, also multiple
		small clicks DO count.
		
		* (click on the screen in order to raise the bird)
		
		I could've decided to make the game more difficult as more time goes by simple equation, however I found it too hard
		of a game due to the change of pace and hard predicitbility
		
		** GAME SUPPORTS TOUCH! works on Android ;)!
		
	all of our game implentation is inside a variable named game
	
	initModule: inside of it, the initation process is in initModule (Shay...), initModule is responsible of initation on default parameters that defines our hero and the arena and the background
	
	scrollingBackground: this is a function that has an endless call to itself until indication by the game that scrolling background animation should stop
						 the idea is similar to Reyman's integral implentation only on image rendering, rendering only a part of the image across difference X values
						 the effect is a clear "scroll" on an image that makes it seems as though the hero is moving right, though the image is moving left
						 the function is modular for two different types of scrolling background I had an idea of, one of which renders the score table
						 
						 
	arena: 				generally a class to hold our canvas and render our hero (which I learnt in the hard way that it HAS to be done at the same time)
						it also holds our default parameters for more convient call
						
	componenet:     	a generalized graphical component (I realized a lot of parameters between rendering is saved such as it's cordinates,
						render rate etc), it's based on an example found on stackoverflow, though its been modified to serve our game better
						
						it acts as a class variable (javascript...) for both the obstacles, and the hero, and the score....
						it's also responsible for intersection indication, updating the cordinates and all the rest of the general graphical components
						
	animate, draw pegasus : a cute function I added that on per "level up" event, it draws a pegasus with a blinking effect (similar to Legends of Zelda rupee animation)
							the idea is to give a user a sense of accomplishment per level up event, even though I didn't raise difficulty in (for computation reasons)
							
	crashed:			upon crashing, it indicates the game that we should not proceed with the hero,obstacle and background rendering
						and prompts the user to enter his name for highscore status....
						
						function has a second part that after getting a name from the user, it renders a background image (scrolling again) of mario level 1-3 (Nintendo reference)
						with the top 5 score displayed on the middle
						upon intersection this function is called
						
	replay_button:      a simple refresh button actually... too lazy to default all variables again and clean data...
	
	
	