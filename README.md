# agile-computing-gp

## Deployment

I recommend using Visual Studio Code to develop the site, and its built-in terminals to run commands.

#### Prerequisites

- Install mongodb - https://www.mongodb.com/try/download/community
- and node - https://nodejs.org/en/download/
- and python 3 - https://www.python.org/downloads/
- and anaconda - https://www.anaconda.com/products/individual#windows

#### Setup instructions

Automatic ish:

WINDOWS:
```
1. Extract the site contents :)
2. Run install.bat to install npm dependencies.
3. Create the python virtual environment in ./agilecompenv: conda create -n agilecompenv anaconda
4. Activate the python virtual environment: conda activate
5. Install python scraper requirements in ./backend/scraper: conda install --file requirements.txt
   NOTE: if packages can't be found by installer, try first running: conda config --append channels conda-forge
   If they still can't be found, install with pip instead, e.g.: py -m pip install fasttext
6. Install python nlp model requirements in ./backend/nlp_models: conda install --file requirements.txt
7. If on Windows, change `const python = virtualEnvDir + "/bin/python";` in nlp_interface.js to `const python = virtualEnvDir + "/Scripts/python";`
```
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
