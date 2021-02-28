import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from "react-router-dom";

import Navbar from "./components/navbar.component";
import TasksList from "./components/tasks-list.component";
import ViewTask from "./components/view-task.component";
import EditTask from "./components/edit-task.component";
import CreateTask from "./components/create-task.component";
import CreateUser from "./components/create-user.component";
import SignIn from "./components/sign-in.component";
import SignUpComplete from "./components/sign-up-complete.component";
import SignInComplete from "./components/sign-in-complete.component";
import AboutUs from "./components/about-us.component";

function App() {
  return (
    <Router>
      <div className="container">
      <Navbar />
      <br/>
      <Route path="/" exact component={TasksList} />
      <Route path="/view/:id" component={ViewTask} />
      <Route path="/edit/:id" component={EditTask} />
      <Route path="/create" component={CreateTask} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={CreateUser} />
      <Route path="/signincomplete" component={SignInComplete} />
      <Route path="/signupcomplete" component={SignUpComplete} />
      <Route path="/about" component={AboutUs} />
      </div>
    </Router>
  );
}

export default App;
