import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
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

const User = props => {
  return (
  <tr>
    <td>{props.user.username}</td>
    <td>{props.user.match_score}</td>
    <td>
      <a href="#" onClick={() => { props.deleteLabel(props.label._id) }}>Y/N</a>       
    </td>
  </tr>
)}

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

    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);   
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeManual = this.onChangeManual.bind(this);

    var username = Cookies.get("username");
    var logged_in = (username !== undefined);

    this.state = {
      creator_username: username,
      title: '',
      assigned_users: [],
      description: '',
      state: '',
      date: new Date(),
      model_output: {}, // output of the NLP model (containing all identified labels)
      top_labels: [], // Label components for the top assigned labels
      top_users: [], // User components for the top matching users
      manually_added: ''
    }
  }

  componentDidMount() {

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
    const taskInfo = {
      text: this.state.description
    };
    axios.post('http://localhost:5000/nlptest/processTask', taskInfo)
      .then(response => {
	const modelOutput = response.data.model_output;
	const labels = React.Children.toArray(response.data.top_labels.map(x => <Label label={{
	  string: x.label,
	  score: x.probability
	}}/>));
	this.setState({
	  model_output: modelOutput,
          top_labels: labels
        })
      })
      .catch(err => {
	console.error(err);
	// TODO spinner off
	alert(`Error retrieving labels`);
      })
  }


  findUsers(){
    // TODO: take in this.state.labels, match with users and output users with their scores, stored in this.state.users
    const taskInfo = {
      task_model_output: this.state.model_output
    };
    axios.post('http://localhost:5000/nlptest/topUsersForTask', taskInfo)
      .then(response => {
	    this.setState({
	      top_users: React.Children.toArray(Object.keys(response.data).map(userId => 
		<User user={{
	          username: userId,
	          match_score: response.data[userId].score
	        }}/>))
	    });
      })
  }


  onSubmit(e) {
    e.preventDefault();

    // TODO deal with no assigned user here!
    
    var getManuallyAddedProfile = axios.get('http://localhost:5000/users/get_id_by_username/' + this.state.manually_added)
    var getCreatorProfile = axios.get('http://localhost:5000/users/get_id_by_username/' + this.state.creator_username)

    Promise.all([getManuallyAddedProfile, getCreatorProfile])
      .then(res => {
        const manually_added = res[0].data;
	const creator_user = res[1].data;

	const task = {
	  creator_user: creator_user,
	  description: this.state.description,
	  title: this.state.title,
	  state: this.state.state,
	  date: this.state.date,
	  assigned_users: [manually_added],
	  nlp_labels: this.state.model_output
	}
    
	console.log("Task: ", task);
      
        return axios.post('http://localhost:5000/tasks/add', task)
      })
      .then(res => {
	console.log(res.data)
	window.location = '/';
      })
      .catch(err => {
	console.error(err)
	// TODO spinner off
	alert(`Error saving the task.`);
      });
      
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
                <button type="button" onClick={ this.findLabels.bind(this) }>(Re)evaluate labels</button>
                <br></br><br></br>
                <label>Top labels for this task: </label>
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                          <th>String</th>
                          <th>Score</th>
                          <th>action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.state.top_labels }
                    </tbody>
                </table>
                <br></br>
                <br></br>
                <button type="button" onClick={ this.findUsers.bind(this) }>(Re)evaluate recommended users</button>
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
                        { this.state.top_users }
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
