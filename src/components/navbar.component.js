import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {

  render() {
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
          <li className="navbar-item">
          <Link to="/user" className="nav-link">Sign Up</Link>
          </li>
          <li className="navbar-item">
          <Link to="/signin" className="nav-link">Log In</Link>
          </li>
          <li className="navbar-item">
          <Link to="/about" className="nav-link">About Us</Link>
          </li>
        </ul>
        </div>
      </nav>
    );
  }
}