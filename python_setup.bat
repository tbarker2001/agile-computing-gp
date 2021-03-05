:: This batch file details python setup but may nto completely install everything
ECHO OFF
ECHO Setting up python code.
call conda create -n agilecompenv anaconda
call conda activate agilecompenv
call conda config --append channels conda-forge

call conda install --file backend/scraper/requirements.txt
call conda install --file backend/nlp_models/requirements.txt

call python -m spacy download xx_ent_wiki_sm
call python -m spacy download en_core_web_sm
PAUSE