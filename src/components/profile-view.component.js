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
      <a href="#" onClick={() => { 
        props.deleteLabel(props.label._id) 
      }}>X</a>       
    </td>
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
      links: [],
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
        this.setState({
          username: response.data.username,
          free_text: response.data.free_text,
          email: response.data.email,
          links: response.data.links,
          stackOverflowProfileLink: response.data.links[0].url,
          githubProfileLink: response.data.links[1].url,
          labels: response.data.nlp_labels,
          assigned_tasks: response.data.assigned_tasks,
          is_admin: response.data.is_admin,
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

  onChangeLink1(e) {
    const link1Updated = this.state.link1;
    link1Updated.url = e.target.value;
      this.setState({
          link1: link1Updated
      })
  }

  onChangeLink2(e) {
    const link2Updated = this.state.link2;
    link2Updated.url = e.target.value;
    this.setState({
        link2: link2Updated
    })
  }

  onChangeStackOverflowProfile(e) {
//        this.state.links.push(new linkSchema({link_type: 'stack_profile', url: e.target.value}))
    let newLinks = []
    if (e.target.value !== "") {
        newLinks.push({
          link_type: 'stack_profile',
          url: e.target.value
        });
    }
    if (this.state.githubProfileLink !== "") {
        newLinks.push({
          link_type: 'github_profile',
          url: this.state.githubProfileLink
        });
    }
    this.setState({
        stackOverflowProfileLink: e.target.value,
        links: newLinks
    })
  }
    
  onChangeGithubProfile(e) {
//        this.state.links.push(new linkSchema({link_type: 'github_profile', url: e.target.value}))
    let newLinks = []
    if (e.target.value !== "") {
        newLinks.push({
      link_type: 'github_profile',
      url: e.target.value
        });
    }
    if (this.state.stackOverflowProfileLink !== "") {
        newLinks.push({
      link_type: 'stack_profile',
      url: this.state.stackOverflowProfileLink
        });
    }
    this.setState({
        githubProfileLink: e.target.value,
        links: newLinks
    })
  }

  labelList() {
    return this.state.labels.sort(this.labelSort).slice(0,5).map(currentlabel => {
 //     return <Label label={currentlabel} deleteLabel={this.deleteLabel} key={currentlabel._id}/>;
        return <Label label={currentlabel} key={currentlabel._id}/>; // got rid of the delete
    })
  }

  labelSort(a, b) {
    return a.probability - b.probability;
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
      .then(res => console.log(res.data));

    window.location = '/';
  }

  findLabels() {
    let userInfo = {
        text: this.state.free_text,
        link1: this.state.link1,
        link2: this.state.link2
    };
    axios.post('http://localhost:5000/nlptest/processProfile', userInfo)
      .then(response => {
        const modelOutput = response.data.modelOutput;
        const labels = modelOutput.map(x => <Label label={{
            string: x.label,
            score: x.probability
        }}/>);
        this.setState({
            labels: labels
        })
      })
  }

  currentAssignedTasks(){
    return this.state.assigned_tasks.map(currenttask => {
        return <Task task={currenttask} viewTask={this.viewTask} key={currenttask._id} />
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const links = [];
    links.push(this.state.link1);
    links.push(this.state.link2);
    

    const user = {
      username: this.state.username,
      email: this.state.email,
      links: links,
      free_text: this.state.free_text,
      nlp_labels: this.state.nlp_labels,
      assigned_tasks: this.state.assigned_tasks,
      is_admin: this.state.is_admin
    }

    console.log(user);

    axios.post('http://localhost:5000/users/update/' + this.props.match.params.id, user)
      .then(res => console.log(res.data));

    window.location = '/';
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
                <label>Link 1: </label>
                  <input  type="text"
                      className="form-control"
                      value={this.state.stackOverflowProfileLink}
                      onChange={this.onChangeStackOverflowProfile}
                      />
                </div>
                <div className="form-group"> 
                  <label>Link 2: </label>
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
                      onChange={this.state.is_admin}
                      readonly="readonly"
                      />
                </div>
                <div className="form-group">
                  <input type="submit" value="Update your information" className="btn btn-primary" />
                </div>
                <div className="form-group">
                  {
                    this.state.is_alive ? React.Children.toArray ([
                      <button type="button" id="red" onClick={ () => {
                        axios.post('http://localhost:5000/users/deactivate', this.state.username)
                      }}>Deactivate account</button>
                    ]) : React.Children.toArray([
                      <button type="button" id="red" onClick={ () => {
                        axios.post('http://localhost:5000/users/activate', this.state.username)
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
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                          <th>String</th>
                          <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.labelList() }
                    </tbody>
              </table>
            </div>
            <div className="form-group">
              <br></br>
              <label>Currently assigned tasks: </label>
                <table className="table">
                    <tbody>
                        
                        { this.currentAssignedTasks() }
                    </tbody>
              </table>
            </div>
            </article>
          </div>
      </div>
    </div>
    )
  }
}