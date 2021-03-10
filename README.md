# agile-computing-gp

## Deployment

I recommend using Visual Studio Code to develop the site, and its built-in terminals to run commands.

#### Setup instructions

So far we have identified two possible ways to run this:
1. On mac
2. On WSL1 Ubuntu 18.04, but with the mongodb server on Windows 10

**On WSL1 Ubuntu + Windows:**
1. Download Ubuntu 18.04 from Windows store https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q?activetab=pivot:overviewtab, open in VSCode https://code.visualstudio.com/docs/remote/wsl
2. In the WSL terminal, install python and anaconda
3. git clone this repository somewhere
4. Create the conda python environment in agilecompenv, specifically with **conda create --prefix="/home/[your username]/agile-computing-gp/agilecompenv" --strict-channel-priority python**
5. "Activate" the environment in your terminal, with **conda activate /home/[your username]/agile-computing-gp/agilecompenv**
6. Install anaconda within the environment: **pip install anaconda**
7. Install fasttext within the environment: **pip install fasttext**
8. Add conda-forge channel to conda: **call conda config --append channels conda-forge**
9. Install scraper requirements: **call conda install --file backend/scraper/requirements.txt**
10. Install nlp model requirements: **call conda install --file backend/nlp_models/requirements.txt**
11. Run this: **python -m spacy download xx_ent_wiki_sm**
12. And this: **python -m spacy download en_core_web_sm**
13. On Windows, download the necessary files from Model Files as described in the folder's README https://drive.google.com/drive/u/1/folders/1P_-hKTWsxYOPcK0mThp28UQbNbGraGe7
14. Move the downloaded files from Windows into your subsystem's combined_model folder. On Windows, this folder is located at e.g. **[your AppData folder]\Local\Packages\CanonicalGroupLimited.Ubuntu18.04onWindows_79rhkp1fndgsc\LocalState\rootfs\home\[your unix username]\agile-computing-gp\backend\nlp_models\combined_model**
15. Now back in the WSL terminal, free the permissions on files in combined_model using **chmod -R 777 backend/nlp_models/combined_model**
16. Insert the line **fasttext.FastText.eprint = lambda x: None** to the top of predict.py and match.py in combined_model to prevent them from throwing warnings as errors.
17. Install npm and node by following these specific instructions: https://docs.microsoft.com/en-us/windows/nodejs/setup-on-wsl2
18. Install node dependencies with **npm install** in the project root
19. Install node dependencies with **npm install** in /backend
20. On Windows, install mondodb. https://www.mongodb.com/try/download/community
21. On Windows still, create a folder called "mongodata".

Running the site:
1. On Windows, run **mongod --dbpath [path to mongodata folder]**
2. Back on WSL, run the frontend server with **nodemon server** in the project root.
3. Run the backend server with **nodemon server** in /backend.
4. You should be done :)

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
      -> Fix: delete package-lock, yarn.lock, and node-modules, run npm clean cache, then npm install againS
```
