
#include "main.h"
#define DEBUG 1
int main(int argc, char** argv)
{
    int i,port,listenfd,newfd,fdmax;
    size_t length;
    socklen_t sock_length;
    static struct sockaddr_in serv_addr;
    struct sockaddr_in clientaddr;
    fd_set master;
    fd_set read_fds;
    char buf[BUFFER_SIZE];
    client** arr = malloc (sizeof(client*));
    Stack* stack=0;


    if( argc!=3 || strcmp(argv[1],"-help")==0 || strcmp(argv[1],"-h")==0 || strcmp(argv[1],"-?")==0 )
    {
        printf("Usage: server <port> <server directory>/ &");
        printf("\n Example: server 80 ~/Desktop/server/ &\n\n");
        printf("Server supports format of: ");
        for(i=0; extensions[i].ext != 0; i++)
            printf(" %s",extensions[i].ext);

        printf("\n\n Not supported root directories and linux master directories\n");
        exit(ERROR_CODE_USAGE_FORMAT); // error code - usage error
    }

    if(argv[2][strlen(argv[2]-1)]!='/')
    {
        printf("You forgot the / in the end of the file path!\n");
         exit(ERROR_CODE_USAGE_FORMAT); // error code - usage error
    }

    char* linux_root_directories[] = {/*"/" ,*/"/etc","/bin","/lib","/tmp","/usr","/dev","/sbin",NULL};

    for(i=0; linux_root_directories[i] != NULL; i++)
    {
        if(strncmp(linux_root_directories[i] , argv[2] , strlen(linux_root_directories[i])/sizeof(char) )==0)
        {
            printf("ERROR: Bad directory, see usage (server -h)\n");
            exit(ERROR_CODE_BAD_DIRECTORY); // error code - bad directory
        }
    }

    if(chdir(argv[2]) == -1)
    {
        printf("ERROR: must work in this current working directory\n\n");
        exit(ERROR_CODE_DO_NOT_CHANGE_DIRECTORY); // error code, work on this directory
    }
    printf("directory - OK\n");

    if(verify_port(argv[1])!=FUNCTION_OK)
        return FUNCTION_ERROR;

    printf("Server starting\n");


    if(  ( listenfd=socket(AF_INET,SOCK_STREAM,0)  ) <0   )
    {
        printf("Sys call failed: socket\n");
        exit(FUNCTION_ERROR);
    }
    printf("socket() - OK\n");
    port = atoi(argv[1]);

    if(port<=0 || port>=65535)
    {
        printf("Invalid port number\n");
        exit(FUNCTION_ERROR);
    }
    printf("port number - OK\n");

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    serv_addr.sin_port = htons(port);
    memset(&(serv_addr.sin_zero),'\0',8);

    if(bind(listenfd, (struct sockaddr *)&serv_addr,sizeof(serv_addr)  )<0  )
    {
        printf("ERROR: sys call bind\n\n");
        exit(FUNCTION_ERROR);
    }
    printf("bind() - OK\n");
    if(listen(listenfd,LISTENERS)<0)
    {
        printf("ERROR: sys call listen\n\n");
        exit(FUNCTION_ERROR);
    }
    printf("listen() - OK\n");

    fdmax = listenfd;
    arr = realloc(arr,sizeof(client*) * fdmax);
    if(arr == 0)
    {
        printf("ERROR - realloc\n\n");
        exit(FUNCTION_ERROR);
    }
    FD_ZERO(&master);
    FD_SET(listenfd, &master);
    init_stack(&stack);
    while(1==1)
    {
        FD_ZERO(&read_fds);
        read_fds = master;
        if(select(fdmax+1,&read_fds,NULL,NULL,NULL)== -1)
        {
            printf("ERROR - select()\n\n");
            exit(FUNCTION_ERROR);
        }
        printf("Select - Ok\n");
        for(i=0; i<=fdmax; i++)
        {
            if(FD_ISSET(i,&read_fds))
            {
                if(i == listenfd)
                {
                    #if DEBUG == 1
                    printf("New client! : ");
                    #endif
                    sock_length = sizeof(clientaddr);
                    if( (newfd = accept(listenfd, (struct sockaddr*) &clientaddr, &sock_length)) == -1  )
                    {
                        printf("ERROR - accept()\n\n");
                        exit(FUNCTION_ERROR);
                    }
                    FD_SET(newfd,&master);
                    if(newfd> fdmax)
                    {
                        fdmax = newfd;
                        arr = realloc(arr,sizeof(client*) * fdmax);
                        if(arr == 0)
                        {
                            printf("ERROR - realloc\n\n");
                            exit(FUNCTION_ERROR);
                        }
                    }
                    client* c = calloc(1,sizeof(client));
                    c->client_addr.sin_family = clientaddr.sin_family;
                    c->client_addr.sin_port = clientaddr.sin_port;
                    c->client_addr.sin_addr.s_addr = clientaddr.sin_addr.s_addr;
                    memset(&(c->client_addr.sin_zero),'\0',8);
                    c->request = 0;
                    arr[newfd] = c;
                    #if DEBUG == 1
                    printf("%s: New connection from %s on socket %d\n", argv[0], inet_ntoa(c->client_addr.sin_addr), newfd);
                    #endif
                }
                else
                {
                    if( (length = recv(i,buf,BUFFER_SIZE,0) )<=0  )
                    {
                        if(length == 0)
                        {
                            #if DEBUG == 1
                            printf("%s: socket %d hung up\n", argv[0], i);
                            #endif
                        }
                        else
                        {
                            printf("ERROR - recv()\n\n");
                        }
                        close(i);
                        if(arr[i]->request != 0)
                            free(arr[i]->request);
                        free(arr[i]);
                        FD_CLR(i,&master);
                        printf("Hanging up complete\n");
                    }
                    else
                    {
                        #if DEBUG == 1
                        printf("Push start mechanism on socket %d\n",i);
                        #endif
                        client* c = arr[i];
                        if(c->request != 0)
                        {
                            free(c->request);
                            c->request = 0;
                        }
                        c->request = calloc(length+1, sizeof(char) );
                        strncpy(c->request,buf,length);
                        c->request[length] = '\0';
                        push(&stack,i);
                        #if DEBUG == 1
                        printf("Pushed new request on socket %d\n",i);
                        #endif
                    }
                }
            }
        }
        int sock_to_reply;
        if( (sock_to_reply=pop(&stack))!=-1 )
        {
            #if DEBUG == 1
            printf("Processing response\n");
            #endif
            char* reqline[3];
            char path[BUFFER_SIZE],data_to_send[BYTES];
            int fd=0,bytes_read=0;
            reqline[0] = strtok(arr[sock_to_reply]->request, " \t\n");
            printf("%x\n",reqline[0]);
            if(strncmp(reqline[0], "GET\0",4)==0)
            {
              reqline[1]= strtok(NULL," \t");
              reqline[2] = strtok (NULL, " \t\n");

              if ( strncmp( reqline[2], "HTTP/1.0", 8)!=0 && strncmp( reqline[2], "HTTP/1.1", 8)!=0 )
        			{
        				write(sock_to_reply, "HTTP/1.0 400 Bad Request\n", 25);
        			}
              else
              {
                if ( strncmp(reqline[1], "/\0", 2)==0 )
					          reqline[1] = "/index.html";
                strcpy(path, argv[2]);
    				    strcpy(&path[strlen(argv[2])], reqline[1]);
    				    printf("file: %s\n", path);
                if ( (fd=open(path, O_RDONLY))!=-1 )    //FILE FOUND
                {
                		send(sock_to_reply, "HTTP/1.0 200 OK\r\n\r\n", 17, 0);
                		while ( (bytes_read=read(fd, data_to_send, BYTES))>0 )
                		    write (sock_to_reply, data_to_send, bytes_read);
                }
                else
                  write(sock_to_reply,"HTTP/1.0 404 Not Found\n", 23);
              }
            }

            free(arr[sock_to_reply]->request);
            arr[sock_to_reply]->request = 0;
        }
    }
    destroy_stack(&stack);
    free(arr);
    printf("Buh bye\n");
    exit(FUNCTION_OK);
}



int verify_port(char* port)
{
    if(port==NULL)
        return FUNCTION_ERROR;

    int size = strlen(port)/sizeof(char), i;

    for(i=0; i<size; i++)
    {
        if(port[i]<'0' || port[i] > '9')
            return FUNCTION_ERROR;
    }

    return FUNCTION_OK;
}


int pop(Stack** stackptr)
{
    Stack* stack = stackptr[0];
    int value;
    if(stack->entry)
        return -1; // error code, empty stack
    *stackptr =  stack->next;
    value = stack->value;
    free(stack);
    return value;
}

void push(Stack** stackptr, int value)
{
    Stack* stack = stackptr[0];
    Stack* new_stack = malloc(sizeof(Stack));
    new_stack->value = value;
    new_stack->next =  stack;
    new_stack->entry = 0;
    *stackptr = new_stack;
}

void init_stack(Stack** stackptr)
{

    Stack* new_stack = malloc(sizeof(Stack));
    new_stack->entry = 1;
    *stackptr = new_stack;
}

void destroy_stack(Stack** stackptr)
{
    Stack* stack = stackptr[0];
    while(stack->entry == 0)
    {
        Stack* next = stack->next;
        free(stack);
        stack=next;
    }
    free(stack);
}

char* readFile(char *filename)
{
    FILE *f = fopen(filename, "r");
    fseek(f, 0, SEEK_END);
    long length = ftell(f);
    fseek(f, 0, SEEK_SET);
    char *buffer = (char *) malloc(length + 1);
    buffer[length] = '\0';
    fread(buffer, 1, length, f);
    fclose(f);
    return buffer;
}
