import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";

/// @param props {
///   label: <string>,
///   probability: <real>,
///   onManualDelete: (label) => {...}
/// }
const Label = props => (
  <tr>
    <td>{props.label}</td>
    <td>{props.probability}</td>
    <td>
      <a href="#" onClick={() => props.onManualDelete(props.label)}>X</a>       
    </td>
  </tr>
)


/// @param props {
///	username: <string>,
///	matchScore: <real>,
///	isAssigned: <boolean>,
///	onToggleAssignment: <function : username => {...}
/// }
const User = props => {
  const onChange = () => props.onToggleAssignment(props.username);
  return (
    <tr>
      <td>{props.username}</td>
      <td>{props.matchScore}</td>
      <td>
	<input
	  type="checkbox"
	  defaultChecked={props.isAssigned}
	  onChange={onChange}
	/>
      </td>
    </tr>
  );
}


/// @param props {
///   users: {
///     <username>: {
///       score: <real>,
///       is_assigned: <boolean>
//      },
///     ...
///   },
///   onToggleAssignment: <username> => {...}
/// }
const RecommendedUserList = props => {
  // TODO display only top N & add search bar to filter by username
  const displayedUsers = React.Children.toArray(
    Object.keys(props.users)
      .map(username =>
	<User
	  username={username}
	  matchScore={props.users[username].score}
	  isAssigned={props.users[username].is_assigned}
	  onToggleAssignment={() => props.onToggleAssignment(username)}
	/>)
  );

  return (
    <article>
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
	  { displayedUsers }
	</tbody>
      </table>
    </article>
  );
}



/*
    Create task fulfills the following:
        - create a task with description text
        - click '(Re)evaluate labels' to produce a list of labels stored in this.state.model_output
	  with the top labels (the ones actually shown) in this.state.top_labels
        - review top labels, click 'X' to set the label "manually removed",
	  type in new labels then click '+' to "manually add" labels
        - (Re)evaluate labels will cancel these manual changes
        - click '(Re)evaluate recommended users' to display all users with their matching score
           check in the box to set the user "assigned"
	- TODO make this list searchable and only display top N by default
        - add a task to task collection in db
*/

export default class CreateTask extends Component {
  constructor(props) {
    super(props);

    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);   
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeDeadline = this.onChangeDeadline.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeAddLabelField = this.onChangeAddLabelField.bind(this);

    var username = Cookies.get("username");
    var logged_in = (username !== undefined);

    this.state = {
      creator_username: username,
      title: '',
      description: '',
      state: '',
      deadline: null,
      model_output: {},		// output of the NLP model (containing all identified labels)
      top_labels: [], 		// top labels in format {label: <string>, probability: <real>}
      add_label_field: '',
      manual_added_labels: [],  // [<string>]
      manual_deleted_labels: [],// [<string>]
      recommended_users: {} 	// {<username>: {score: <real>, is_assigned: <boolean>}, ...}
    }
  }

  componentDidMount() {
    // Empty
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDeadline(date) {
    this.setState({
      deadline: date
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

  onChangeAddLabelField(e) {
    this.setState({
      add_label_field: e.target.value
    })
  }

  onManualAddLabel() {
    const label = this.state.add_label_field;
    this.setState({
      top_labels: [...this.state.top_labels, {label: label, probability: null}],
      manual_added_labels: [...this.state.manual_added_labels, label],
      add_label_field: ''
    })
  }

  onManualDeleteLabel(label) {
    if (label in this.state.manual_added_labels)
      this.setState({
	top_labels: this.state.top_labels.filter(el => el.label !== label),
	manual_added_labels: this.state.manual_added_labels.filter(el => el !== label)
      })
    else
      this.setState({
	top_labels: this.state.top_labels.filter(el => el.label !== label),
	manual_deleted_labels: [...this.state.manual_deleted_labels, label]
      })
  }

  onToggleAssignment(username) {
    let newUsers = Object.assign({}, this.state.recommended_users);
    if (!(username in newUsers))
      throw new Error(`Username ${username} is unexpected`);
    newUsers[username].is_assigned = !(newUsers[username].is_assigned);

    this.setState({
      recommended_users: newUsers
    })
  }

  getTopLabels() {
    return React.Children.toArray(this.state.top_labels.map(x =>
      <Label
	label={x.label}
	probability={x.probability}
	onManualDelete={this.onManualDeleteLabel.bind(this)}
      />));
  }

  getAssignedUsers() {
    return Object.entries(this.state.recommended_users)
      .filter(([username, attr]) => attr.is_assigned)
      .map(([username, attr]) => username)
  }


  findLabels() {
    const taskInfo = {
      text: this.state.description
    };
    axios.post('http://localhost:5000/nlptest/processTask', taskInfo)
      .then(response => this.setState({
	model_output: response.data.model_output,
	top_labels: response.data.top_labels,
	manual_added_labels: [],
	manual_deleted_labels: []
      }))
      .catch(err => {
	console.error(err);
	// TODO spinner off
	alert(`Error retrieving labels`);
      })
  }


  findUsers() {
    const taskInfo = {
      task_model_output: this.state.model_output
    };
    axios.post('http://localhost:5000/nlptest/topUsersForTask', taskInfo)
      .then(response => {
	// Transfer already assigned users from current user list
	let newUsers = {};
	Object.entries(response.data).forEach(([username, attr]) => {
	  const isAssigned =
	    username in this.state.recommended_users
	    && this.state.recommended_users[username].is_assigned;
	  newUsers[username] = {
	    score: attr.score,
	    is_assigned: isAssigned
	  };
	});

	this.setState({
	  recommended_users: newUsers
	})
      })
      .catch(err => {
	console.error(err);
	// TODO spinner off
	alert(`Error retrieving recommended users`);
      })
  }


  onSubmit(e) {
    e.preventDefault();

    const getAssignedUserIds =
      Promise.all(this.getAssignedUsers().map(username =>
	axios.get('http://localhost:5000/users/get_id_by_username/' + username)));
    const getCreatorUserId = axios.get('http://localhost:5000/users/get_id_by_username/' + this.state.creator_username)

    Promise.all([getAssignedUserIds, getCreatorUserId])
      .then(res => {
        const assigned_user_ids = res[0].map(attr => attr.data);
	const creator_user_id = res[1].data;

	const task = {
	  creator_user: creator_user_id,
	  description: this.state.description,
	  title: this.state.title,
	  state: this.state.state,
	  deadline: this.state.deadline,
	  assigned_users: assigned_user_ids,
	  nlp_labels: this.state.model_output,
	  manual_added_labels: this.state.manual_added_labels,
	  manual_deleted_labels: this.state.manual_deleted_labels
	}
    
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
                  <label>Deadline: </label>
                  <div>
                    <DatePicker
                      selected={this.state.deadline}
                      onChange={this.onChangeDeadline}
                    />
                  </div>
                </div>
		<div className="form-group">
		  <label>Currently assigned users: {this.getAssignedUsers().join()}</label>
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
		<article>
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
			  { this.getTopLabels() }
			  <tr>
			    <td>
			      <input
				type="text"
				placeholder="Add new label"
				value={this.state.add_label_field}
				onChange={this.onChangeAddLabelField}
			      />
			    </td>
			    <td></td>
			    <td>
			      <a href="#" onClick={this.onManualAddLabel.bind(this)}>+</a>
			    </td>
			  </tr>
		      </tbody>
		  </table>
		</article>
                <br></br>
                <br></br>
                <button type="button" onClick={ this.findUsers.bind(this) }>(Re)evaluate recommended users</button>
                <br></br>
                <br></br>
		<RecommendedUserList
		  users={this.state.recommended_users}
		  onToggleAssignment={this.onToggleAssignment.bind(this)}
		/>
            </article>
          </div>
      </div>
    </div>
    )
  }
}
