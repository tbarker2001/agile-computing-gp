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

export default class EditTask extends Component {
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
     axios.get('http://localhost:5000/tasks/'+this.props.match.params.id)
      .then(response => {
        this.setState({
          creator_username: response.data.creator_username,
          title: response.data.title,
          description: response.data.description,
          state: response.data.state,
          date: new Date(response.data.date),
          assigned_users: response.data.assigned_users,
          nlp_labels: response.data.nlp_labels,
          users: response.data.users,
          manually_added: response.data.manually_added
        })   
      })
      .catch(function (error) {
        console.log(error);
      })

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
  }

  findUsers(){
    // TODO: take in this.state.labels, match with users and output users with their scores, stored in this.state.users
  }

  labelList() {
    return this.state.labels        // TODO: input labels list from this.state.labels, output Label list suitable for a table (tbody) (similar to taskList() function in tasks-list.component.js)
  }

  currentUsersList() {
    
    //return this.state.users.map(currentuser => {
    //    return <User user={currentuser} key={currentuser._id}/>
   // })
    return this.state.users;      // TODO: same as labelList above, but for putting recommended users into its table from this.state.users
  }

  onSubmit(e) {
    e.preventDefault();

    const usersToAdd = this.state.assigned_users // TODO: concatted with manually added users (after checking for validity)

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

    axios.post('http://localhost:5000/tasks/update' + this.props.match.params.id, task)
      .then(res => console.log(res.data));

    window.location = '/';
  }

  render() {
    return (
    <div>
      <h3>Edit task details</h3>
      <div className="pairBoxes">
          <div className="personalBoxView">
            <article>
              <form onSubmit={this.onSubmit}>
                <div className="form-group"> 
                  <label>Creator Username: </label>
                   <input type="text"
                      className="form-control"
                      value={this.state.creator_username}
                      onChange={this.state.creator_username}
                      readonly="readonly">
                      
                  </input>
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
                  <input type="submit" value="Update" className="btn btn-primary" />
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