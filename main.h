#ifndef MAIN_H
#define MAIN_H

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <fcntl.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define BUFFER_SIZE 2048
#define BYTES 1024

#define ERROR_CODE_USAGE_FORMAT 1
#define ERROR_CODE_BAD_DIRECTORY 2
#define ERROR_CODE_DO_NOT_CHANGE_DIRECTORY 3

#define FUNCTION_OK 0
#define FUNCTION_ERROR -1
#define LISTENERS 64

struct
{
    char* ext;
    char* filetype;
} extensions [] = {
	{"gif", "image/gif" },
	{"jpg", "image/jpeg"},
	{"jpeg","image/jpeg"},
	{"png", "image/png" },
	{"zip", "image/zip" },
	{"gz",  "image/gz"  },
	{"tar", "image/tar" },
	{"htm", "text/html" },
	{"html","text/html" },
	{"php", "image/php" },
	{"cgi", "text/cgi"  },
	{"asp","text/asp"   },
	{"jsp", "image/jsp" },
	{"xml", "text/xml"  },
	{"js","text/js"     },
        {"css","test/css"   },
        {"mp3","audio/mpeg"},
        {"wav","audio/wav"},
        {"flac","audio/mpeg"},
         {0,0} };

int main(int argc, char** argv);

void hostweb(int fd, int hit);

int verify_port(char* port);

typedef struct
{
    struct sockaddr_in client_addr;
    char* request;
}client;

typedef struct Stack{
  int value;
  struct Stack* next;
  int entry;
}Stack;

int pop(Stack** stackptr);

void push(Stack** stackptr, int value);

void init_stack(Stack** stackptr);

void destroy_stack(Stack** stackptr);

char *readFile(char *filename);

#endif
