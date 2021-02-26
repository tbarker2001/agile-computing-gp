@ECHO OFF
start nodemon server
cd backend
start nodemon server
call mongod --dbpath %0\..\backend\mongodata
PAUSE