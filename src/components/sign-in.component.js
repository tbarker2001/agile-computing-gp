import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../App.css";

export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      password: '',
      surname: '',
      email: '',
      tasks: []
    }
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const login = {
      username: this.state.username,
      forename: this.state.forename,
      surname: this.state.surname,
      email: this.state.email
    }

    console.log(login);

 //   axios.get('http://localhost:5000/users/add', login)
  //    .then(res => console.log(res.data));

    window.location = '/signincomplete';
  
  }

  render() {
    return (
        <div>
            <div className="pairBoxes">
                <div className="personalBoxView">
                    <h3>Sign in</h3>
                    <br></br>
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group"> 
                            <label>Username: </label>
                            <input  type="text"
                                required
                                className="form-control"
                                value={this.state.username}
                                onChange={this.onChangeUsername}
                                />
                            <label>Password: </label>
                            <input  type="text"
                                required
                                className="form-control"
                                value={this.state.password}
                                onChange={this.onChangePassword}
                                />
                        </div>
                        <div className="form-group">
                        <input type="submit" value="Log in" className="btn btn-primary" />
                        <br></br>
                        <br></br>
                        <Link to="/user" className="nav-link">Not made an account with us yet?</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
  }
}