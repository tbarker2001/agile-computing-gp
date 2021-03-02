# agile-computing-gp

## Deployment

I recommend using Visual Studio Code to develop the site, and its built-in terminals to run commands.

#### Prerequisites

- Install mongodb - https://www.mongodb.com/try/download/community
- and node - https://nodejs.org/en/download/

#### Setup instructions

Automatic:

WINDOWS:

1. Extract the site contents :)
2. Run install.bat to install dependencies.
3. Ready the python virtual environment: py -m venv "./agilecompenv"
4. Activate the python virtual environment (running agilecompenv/activate.bat in cmd prompt)
5. Install the python requirements (py -m pip install -r backend/scraper/requirements.txt)
6. If on Windows, change `const python = virtualEnvDir + "/bin/python";` in nlp_interface.js to `const python = virtualEnvDir + "/Scripts/python";`

Now you can run run.bat to run the frontend (react), backend (express), and database servers.

This hosts the frontend on localhost:3000, and backend on localhost:5000. The servers will refresh if you change any files.

#### Database interaction

If you want to interact with the database server through the command line (e.g. manually adding entries, altering schema, listing data), you can open a new terminal and simply use the command **mongo** to load a shell through which you can send commands.

Examples:
```
- use task-management-site
      switch to database
      
- show tables
      show all tables in database
      
- db.tasks.insert([{“title”: “Test Task”, “description”: “Lmao test”}])
      insert record to table
      NOTE: creates new table if doesn’t exist, inserts _id field automatically
      
- db.tasks.find().pretty()
      print table contents
```

#### Common Errors
```
Frontend: nodemon.ps1 cannot be loaded because running scripts is disabled on this system
      -> Fix: delete nodemon.ps1, kill all node background processes, retry
          
Frontend: 'react-scripts' is not recognised as an internal or external command
      -> Fix: delete package-lock and node-modules, run npm clean cache, then npm install
```
