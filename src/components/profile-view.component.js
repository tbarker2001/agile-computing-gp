import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingOverlay from 'react-loading-overlay';
import ClockLoader from 'react-spinners/ClockLoader';
import "../App.css";


const Label = props => (
  <tr>
    <td>{props.label}</td>
    <td>{props.probability}</td>
  </tr>
)

const Task = props => (
  <tr>
    <td>{props.task.title}</td>
    <td>
      <Link to={"/view/"+props.task._id}>View</Link>
    </td>
  </tr>
)

// CSS override for spinners
const spinnerCss = `
display: block;
margin: 0 auto;
border-color: red;
`;
  

export default class ProfileView extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeFreeText = this.onChangeFreeText.bind(this);
    this.onChangeStackOverflowProfile = this.onChangeStackOverflowProfile.bind(this);
    this.onChangeGithubProfile = this.onChangeGithubProfile.bind(this);

    this.state = {
      username: '',
      email: '',
      stackOverflowProfileLink: '',
      githubProfileLink: '',
      free_text: '',
      assigned_tasks: [],
      labels: [],
      is_admin: false,
      is_alive: true
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/users/get_by_id/'+this.props.match.params.id)
      .then(response => {
	let stackLink = "";
	let githubLink = "";
	for (var i in response.data.links) {
	  const link = response.data.links[i];
	  if (link.link_type == "stack_profile") stackLink = link.url;
	  if (link.link_type == "github_profile") githubLink = link.url;
	}

        this.setState({
          username: response.data.username,
          free_text: response.data.free_text,
          email: response.data.email,
          stackOverflowProfileLink: stackLink,
          githubProfileLink: githubLink,
          labels: response.data.nlp_labels,
          assigned_tasks: response.data.assigned_tasks,
          is_admin: response.data.is_admin,
          labels_is_loading: false,
          is_alive: response.data.is_alive
        })   
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeFreeText(e) {
    this.setState({
      free_text: e.target.value
    })
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value
    })
  }

  onChangeStackOverflowProfile(e) {
    this.setState({
      stackOverflowProfileLink: e.target.value
    });
  }
    
  onChangeGithubProfile(e) {
    this.setState({
      githubProfileLink: e.target.value
    });
  }

  labelList() {
    let topLabels = this.state.labels.map(x => x);
    topLabels.sort(this.labelSort);
    topLabels = topLabels.splice(0, 10);

    return React.Children.toArray(topLabels.map(currentLabel => 
      <Label 
        label={currentLabel.label}
        probability={currentLabel.probability}
        />
      ));
  }

  labelSort(a, b) {
    return b.probability - a.probability;
  }

  deleteLabel(label){
    if (this.state.labels.contains(label)){
        this.state.labels.delete(label);
    }
  }

  deleteUser(){
    let userInfo = {
      username: this.state.username
    }
    axios.post('http://localhost:5000/users/delete', userInfo)
      .then(res => {
	console.log(res.data);
	window.location = '/';
      })
      .catch(err => {
	console.error(err);
	alert("Error deleting user.");
      });
  }

  findLabels() {
    this.setState({
      labels_is_loading: true
    });
    let nonEmptyLinks = [];
    if (this.state.stackOverflowProfileLink !== "")
      nonEmptyLinks.push({
	  link_type: 'stack_profile',
	  url: this.state.stackOverflowProfileLink
      });
    if (this.state.githubProfileLink !== "")
      nonEmptyLinks.push({
	  link_type: 'github_profile',
	  url: this.state.githubProfileLink
      });
    let userInfo = {
      username: this.state.username,
      links: nonEmptyLinks,
      freeText: this.state.free_text
    };
    axios.post('http://localhost:5000/nlptest/processProfile', userInfo)
      .then(response =>
	this.setState({
	  labels: response.data.model_output,
	  labels_is_loading: false
	}))
      .catch(err => {
        console.error(err);
        this.setState({
          labels_is_loading: false
        });
        alert('Error retrieving labels');
      })
  }

  currentAssignedTasks(){
    return this.state.assigned_tasks.map(currenttask => 
        <Task task={currenttask} key={currenttask._id} />
    );
  }

  onSubmit(e) {
    e.preventDefault();

    let nonEmptyLinks = [];
    if (this.state.stackOverflowProfileLink !== "")
      nonEmptyLinks.push({
	  link_type: 'stack_profile',
	  url: this.state.stackOverflowProfileLink
      });
    if (this.state.githubProfileLink !== "")
      nonEmptyLinks.push({
	  link_type: 'github_profile',
	  url: this.state.githubProfileLink
      });

    const user = {
      username: this.state.username,
      email: this.state.email,
      links: nonEmptyLinks,
      free_text: this.state.free_text,
      nlp_labels: this.state.labels,
    }

    console.log(user);

    axios.post('http://localhost:5000/users/update/' + this.props.match.params.id, user)
      .then(res => {
	console.log(res.data);
	window.location = '/';
      })
      .catch(err => {
	console.error(err);
	alert("Error saving user.");
      });
  }

  render() {
    return (
    <div>
      <h3>Profile Details</h3>        
      <div className="pairBoxes">
          <div className="personalBoxView">
            <article>
              <form onSubmit={this.onSubmit}>
                <div className="form-group"> 
                  <label>Username: </label>
                  <input type="text"
                      className="form-control"
                      value={this.state.username}
                      onChange={this.onChangeUsername}>
                  </input>
                </div>
                <div className="form-group"> 
                  <label>Email: </label>
                  <input type="text"
                      className="form-control"
                      value={this.state.email}
                      onChange={this.onChangeEmail}>
                  </input>
                </div>
                <div className="form-group"> 
                <label>StackOverflow Account: </label>
                  <input  type="text"
                      className="form-control"
                      value={this.state.stackOverflowProfileLink}
                      onChange={this.onChangeStackOverflowProfile}
                      />
                </div>
                <div className="form-group"> 
                  <label>GitHub Account: </label>
                  <input  type="text"
                      className="form-control"
                      value={this.state.githubProfileLink}
                      onChange={this.onChangeGithubProfile}
                      />
                </div>
                <div className="form-group"> 
                  <label>Free text: </label>
                  <textarea  type="text"
                      className="form-control"
                      value={this.state.free_text}
                      onChange={this.onChangeFreeText} />
                </div>
                <div className="form-group">
                  <label>Admin: </label>
                  <input  type="text"
                      className="form-control"
                      value={this.state.is_admin}
                      readOnly="readonly"
                      />
                </div>
                <div className="form-group">
                  <input type="submit" value="Update your information" className="btn btn-primary" />
                </div>
                <div className="form-group">
                  {
                    this.state.is_alive ? React.Children.toArray ([
                      <button type="button" id="red" onClick={ () => {
                        axios.post('http://localhost:5000/users/deactivate/' + this.state.username)
			  .then(res => {console.log(res); window.location = '/';})
			  .catch(err => {console.error(err); alert("Error deactivating user.");})
                      }}>Deactivate account</button>
                    ]) : React.Children.toArray([
                      <button type="button" id="red" onClick={ () => {
                        axios.post('http://localhost:5000/users/activate/' + this.state.username)
			  .then(res => {console.log(res); window.location = '/';})
			  .catch(err => {console.error(err); alert("Error activating user.");})
                      }}>Activate account</button>
                    ])
                  }
                </div>
                <div className="form-group">
                  <button type="button" id="red" onClick={ this.deleteUser.bind(this) }>Delete user</button>
                </div>
              </form>
            </article>
          </div>
          <div className="tagBoxView">
            <article>
              <div className="form-group">
                <button type="button" onClick={ this.findLabels.bind(this) }>Re-evaluate tags</button>
              </div> 
              <div className="form-group">
                <label>Biggest tags we identified from your links and free text: </label>
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
                      { this.labelList() }
                    </tbody>
                  </table>
                </LoadingOverlay>
              </div>
            </article>
          </div>
      </div>
    </div>
    )
  }
}
