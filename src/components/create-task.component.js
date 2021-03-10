import React from 'react';
import axios from 'axios';
import ClockLoader from 'react-spinners/ClockLoader';
import Cookies from 'js-cookie';
import DatePicker from 'react-datepicker';
import Link from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
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
    <td>{props.probability == undefined ? null : props.probability.toFixed(4)}</td>
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
      <td>{props.matchScore.toFixed(4)}</td>
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


// CSS override for spinners
const spinnerCss = `
  display: block;
  margin: 0 auto;
  border-color: red;
`;

/// @param props {
///   users: {
///     <username>: {
///       score: <real>,
///       is_assigned: <boolean>
//      },
///     ...
///   },
///   onToggleAssignment: <username> => {...},
///   isLoading: <boolean> for spinner state
/// }
const RecommendedUserList = props => {
  // TODO display only top N & add search bar to filter by username
  const displayedUsers = React.Children.toArray(
    Object.entries(props.users)
      .sort((a, b) => a[1].score < b[1].score)
      .map(([username, attr]) =>
	<User
	  username={username}
	  matchScore={attr.score}
	  isAssigned={attr.is_assigned}
	  onToggleAssignment={() => props.onToggleAssignment(username)}
	/>)
  );

  return (
    <article>
      <label>Recommended users: </label>
      <LoadingOverlay
	active={props.isLoading}
	spinner={<ClockLoader css={spinnerCss} />}
	text='Waiting for users...'
	>
	<table className="table">
	  <thead className="thead-light">
	    <tr>
	      <th>User</th>
	      <th>Score</th>
	      <th>Assign</th>
	    </tr>
	  </thead>
	  <tbody>
	    { displayedUsers }
	  </tbody>
	</table>
      </LoadingOverlay>
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

export default class CreateTask extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onBlurDescription = this.onBlurDescription.bind(this);
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
      state: 'OPEN',
      deadline: null,
      model_output: {},		// output of the NLP model (containing all identified labels)
      top_labels: [], 		// top labels in format {label: <string>, probability: <real>}
      add_label_field: '',
      manual_added_labels: [],  // [<string>]
      manual_deleted_labels: [],// [<string>]
      labels_is_outdated: false,// <boolean> not allowing submit when labels are outdated
      labels_is_loading: false, // <boolean> spinner state for retrieving labels
      recommended_users: {}, 	// {<username>: {score: <real>, is_assigned: <boolean>}, ...}
      users_is_loading: false,  // <boolean> spinner state for retrieving users
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

  onBlurDescription(e) {
    this.setState({
      labels_is_outdated: true
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
    if (label in this.state.manual_added_labels) {
      this.setState({
	add_label_field: ''
      })
    } else {
      this.setState({
	top_labels: [...this.state.top_labels, {label: label, probability: null}],
	manual_added_labels: [...this.state.manual_added_labels, label],
	add_label_field: ''
      })
    }
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
    this.setState({
      labels_is_loading: true
    });
    const taskInfo = {
      text: this.state.description
    };
    axios.post('http://localhost:5000/nlptest/processTask', taskInfo)
      .then(response => this.setState({
        model_output: response.data.model_output,
        top_labels: [
          ...response.data.top_labels
            .filter(label => !this.state.manual_deleted_labels.includes(label.label)),
          ...this.state.manual_added_labels.map(label => ({label: label, probability: null}))
        ],
        labels_is_loading: false,
        labels_is_outdated: false
      }))
      .catch(err => {
        console.error(err);
        this.setState({
          labels_is_loading: false
        });
        alert(`Error retrieving labels`);
      })
  }


  findUsers() {
    this.setState({
      users_is_loading: true
    });
    const taskInfo = {
      model_output: this.state.model_output,
      manual_added_labels: this.state.manual_added_labels,
      manual_deleted_labels: this.state.manual_deleted_labels
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
	  recommended_users: newUsers,
	  users_is_loading: false
	})
      })
      .catch(err => {
	console.error(err);
	this.setState({
	  users_is_loading: false
	});
	alert(`Error retrieving recommended users`);
      })
  }


  onSubmit(e) {
    e.preventDefault();

    if (this.state.labels_is_outdated) {
      alert("Your labels are outdated.  Please evaluate labels before submitting.");
      return;
    }

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
                      onBlur={this.onBlurDescription}
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
              <button
		            type="button"
		            onClick={this.findLabels.bind(this)}>
		            (Re)evaluate labels
		          </button>
              <br></br>
              <br></br>
		          <article>
                <label>Top labels for this task: </label>
                <LoadingOverlay
                  active={this.state.labels_is_loading}
                  spinner={<ClockLoader css={spinnerCss} />}
                  text='Waiting for labels...'
                  >
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>String</th>
                        <th>Score</th>
                        <th></th>
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
                      {
                        this.state.manual_deleted_labels.length > 0
                        ? <tr>Manually removed: {this.state.manual_deleted_labels.join()}</tr>
                        : null
                      }
                    </tbody>
                  </table>
                </LoadingOverlay>
              </article>
              <br></br>
              <br></br>
              <button type="button" onClick={ this.findUsers.bind(this) }>(Re)evaluate recommended users</button>
              <br></br>
              <br></br>
              <RecommendedUserList
                users={this.state.recommended_users}
                onToggleAssignment={this.onToggleAssignment.bind(this)}
                isLoading={this.state.users_is_loading}
              />
            </article>
          </div>
      </div>
    </div>
    )
  }
}
