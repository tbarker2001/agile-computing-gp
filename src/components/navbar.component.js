import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

export default class Navbar extends Component {

  render() {
    var username = Cookies.get("username");
    var logged_in = (username !== undefined);

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">Task Manager</Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
          <Link to="/" className="nav-link">Tasks</Link>
          </li>
          <li className="navbar-item">
          <Link to="/create" className="nav-link">Create Task</Link>
          </li>
          {
            logged_in
            ? [
                <li className="navbar-item">
                  <a href="#" onClick={() => {
                    Cookies.remove("username");
                    window.location = '/';
                    }}>Log Out</a>
                </li>
            ]
            : [
                <li className="navbar-item">
                <Link to="/signup" className="nav-link">Sign Up</Link>
                </li>,
                <li className="navbar-item">
                <Link to="/signin" className="nav-link">Log In</Link>
                </li>
            ]
          }
          
          <li className="navbar-item">
          <Link to="/about" className="nav-link">About Us</Link>
          </li>
        </ul>
        </div>
      </nav>
    );
  }
}