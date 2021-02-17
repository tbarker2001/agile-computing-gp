import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.onChangeCreatorUsername = this.onChangeCreatorUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      creator_username: '',
      title: '',
      description: '',
      state: '',
      date: new Date(),
      users: []
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            creator_username: response.data[0].username
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }

  onChangeCreatorUsername(e) {
    this.setState({
      creator_username: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onChangeTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  onChangeState(e) {
    this.setState({
      state: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const task = {
      creator_username: this.state.creator_username,
      description: this.state.description,
      title: this.state.title,
      state: this.state.state,
      date: this.state.date
    }

    console.log(task);

    axios.post('http://localhost:5000/tasks/add', task)
      .then(res => console.log(res.data));

    window.location = '/';
  }

  render() {
    return (
    <div>
      <h3>Create New Task</h3>
      <form onSubmit={this.onSubmit}>
        <div className="form-group"> 
          <label>Creator Username: </label>
          <select ref="userInput"
              required
              className="form-control"
              value={this.state.creator_username}
              onChange={this.onChangeCreatorUsername}>
              {
                this.state.users.map(function(user) {
                  return <option 
                    key={user}
                    value={user}>{user}
                    </option>;
                })
              }
          </select>
        </div>
        <div className="form-group">
          <label>Title: </label>
          <input 
              type="text" 
              className="form-control"
              value={this.state.title}
              onChange={this.onChangeTitle}
              />
        </div>
        <div className="form-group"> 
          <label>Description: </label>
          <input  type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
              />
        </div>
        <div className="form-group"> 
          <label>State: </label>
          <input type="text"
              required
              className="form-control"
              value={this.state.state}
              onChange={this.onChangeState}
          />
        </div>
        <div className="form-group">
          <label>Date: </label>
          <div>
            <DatePicker
              selected={this.state.date}
              onChange={this.onChangeDate}
            />
          </div>
        </div>

        <div className="form-group">
          <input type="submit" value="Create Task Log" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}