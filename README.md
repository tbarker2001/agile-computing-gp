# agile-computing-gp

## Deployment

I recommend using Visual Studio Code to develop the site, and its built-in terminals to run commands.

#### Prerequisites

- Install mongodb - https://www.mongodb.com/try/download/community
- and node - https://nodejs.org/en/download/

#### Setup instructions

1. Extract the site contents :) and navigate to the folder in a terminal.

2. **npm install** to install site dependencies such as express, etc.

3. **npm start** to start the nodejs web server. This will probably be hosted at localhost:3000. You can go to localhost:3000/taskslist to view the main page.

4. In a seperate terminal pointing at the same folder, **mongodb --dbpath "./data"** to launch the mongodb database server.

If you want to interact with the database server through the command line (e.g. manually adding entries, altering schema, listing data), you can open a new terminal and simply use the command **mongo** to load a shell through which you can send commands.

## Todo
- Finish porting existing database code to use mongoose (which let's us more easily embed database documents within one another)
- Work out a proper document-based schema now that we're using mongodb
