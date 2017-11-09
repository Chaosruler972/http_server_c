server: main.c main.h
	gcc -Wall -Wvla main.c -o server
clear: 
	rm server
