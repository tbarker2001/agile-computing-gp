import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";


const Label = props => (
  <tr>
    <td>{props.label.string}</td>
    <td>{props.label.score}</td>
    <td>
      <a href="#" onClick={() => { props.deleteLabel(props.label._id) }}>X</a>       
    </td>
  </tr>
)

const User = props => (
  <tr>
    <td>{props.user.username}</td>
    <td>{}</td>
    <td>
      <a href="#" onClick={() => { props.deleteLabel(props.label._id) }}>Y/N</a>       
    </td>
  </tr>
)

/*
    Create task fulfills the following:
        - create a task with decription text
        - click '(Re)evaluate labels' to produce a list of Labels stored in this.state.nlp_labels
        - review top labels, click 'delete' to remove label from list this.state.nlp_labels 
          ((Re)evaluate labels will cancel these manual changes)
        - click '(Re)evaluate recommended users' to display top profile and their matching score
            - maybe store these automatics in 'this.state.users' 
            and 
            if selected or manually assigned, then add to this.state.assigned_users
        - add a task to task collection in db
*/

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
      assigned_users: '',
      description: '',
      state: '',
      date: new Date(),
      nlp_labels: [],
      users: [],
      manually_added: ''
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

  onChangeManual(e) {
    this.setState({
      manually_added: e.target.value
    })
  }



  findLabels(){
    // TODO: take in task description text, store labels from this in state.labels
    const taskInfo = {
      text: this.state.description
    };
    axios.post('http://localhost:5000/nlptest/processTask', taskInfo)
      .then(response => {
	const modelOutput = response.data.model_output;
	const labels = modelOutput.map(x => Label({
	  label: {
	    string: x.label,
	    score: x.probability
	  }
	}));
	this.setState({
	  nlp_labels: labels
	})
      })
  }

  findUsers(){
    // TODO: take in this.state.labels, match with users and output users with their scores, stored in this.state.users
  }

  labelList() {
    // TODO: input labels list from this.state.labels, output Label list suitable for a table (tbody) (similar to taskList() function in tasks-list.component.js)
    return this.state.nlp_labels
  }

  currentUsersList() {
    
    return this.state.users.map(currentuser => {
        return <User user={currentuser} key={currentuser._id}/>
    })
   // return this.state.users;      // TODO: same as labelList above, but for putting recommended users into its table from this.state.users
  }

  onSubmit(e) {
    e.preventDefault();

    const usersToAdd = this.state.users // TODO: concatted with manually added users (after checking for validity)

    const task = {
      creator_username: this.state.creator_username,
      description: this.state.description,
      title: this.state.title,
      state: this.state.state,
      date: this.state.date,
      users: usersToAdd,
      nlp_labels: this.state.nlp_labels
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
      <div className="pairBoxes">
          <div className="personalBoxView">
            <article>
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
                  <textarea  type="text"
                      required
                      className="form-control"
                      value={this.state.description}
                      onChange={this.onChangeDescription}
                      id="descriptionBox"
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
                <br></br>
                <div className="form-group">
                  <input type="submit" value="Create Task" className="btn btn-primary" />
                </div>
              </form>
            </article>
          </div>
          <div className="tagBoxView">
            <article>
                <button type="button" onclick={ this.findLabels() }>(Re)evaluate labels</button>
                <br></br><br></br>
                <label>Biggest tags we identified: </label>
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                          <th>String</th>
                          <th>Score</th>
                          <th>action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.labelList() }
                    </tbody>
                </table>
                <br></br>
                <br></br>
                <button type="button" onclick={ this.findUsers() }>(Re)evaluate recommended users</button>
                <br></br>
                <br></br>
                <label>Recommended users: </label>
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th>User</th>
                            <th>Score</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.currentUsersList() }
                    </tbody>
                </table>
                <div className="form-group"> 
                  <label>Manually assign a user?</label>
                  <input type="text"
                      required
                      className="form-control"
                      value={this.state.manually_added}
                      onChange={this.onChangeManual}
                  />
                </div>
            </article>
          </div>
      </div>
    </div>
    )
  }
}
