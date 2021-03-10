import React, { Component } from 'react';
import axios from 'axios';
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

export default class ViewTask extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      creator_username: '',
      assigned_users: '',
      title: '',
      description: '',
      state: '',
      date: new Date(),
      labels: []
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/tasks/'+this.props.match.params.id)
      .then(response => {
        this.setState({
          creator_username: response.data.creator_user.username,
          assigned_users: response.data.assigned_users,
          title: response.data.title,
          description: response.data.description,
          state: response.data.state.text,
          date: new Date(response.data.date),
          labels: response.data.nlp_labels
        })   
      })
      .catch(function (error) {
        console.log(error);
      })

    axios.get('http://localhost:5000/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            labels: response.data.map(user => user.username),
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })

  }

  labelList() {
    return this.state.labels.map(currentlabel => {
      return <Label label={currentlabel} deleteLabel={this.deleteLabel} key={currentlabel._id}/>;
    })
  }

  currentUsersList() {
    return ( ["Bob", ", Max"])
   // return this.state.users;
  }

  deleteLabel(label){
        if (this.state.labels.contains(label)){
            this.state.labels.delete(label);
        }
  }

  onSubmit() {
   

    window.location = '/edit/' + this.props.match.params.id;
  }

  render() {
    return (
    <div>
      <h3>View Task Details</h3>        
      <div className="pairBoxes">
          <div className="personalBoxView">
            <article>
              <form onSubmit={this.onSubmit}>
                <div className="form-group"> 
                  <label>Creator username: </label>
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
                      onChange={this.state.title}
                      readonly="readonly"
                      />
                </div>
                <div className="form-group"> 
                  <label>Description: </label>
                  <textarea  type="text"
                      required
                      className="form-control"
                      value={this.state.description}
                      onChange={this.state.description}
                      readonly="readonly"
                      />
                </div>
                <div className="form-group">
                  <label>State: </label>
                  <input 
                      type="text" 
                      className="form-control"
                      value={this.state.state}
                      onChange={this.state.state}
                      readonly="readonly"
                      />
                </div>
                <div className="form-group">
                  <label>Date: </label>
                  <div>
                    <DatePicker
                      selected={this.state.date}
                      onChange={this.state.date}
                      readonly="readonly"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <input type="submit" value="Edit Task Details" className="btn btn-primary" />
                </div>
              </form>
            </article>
          </div>
          <div className="tagBoxView">
            <article>
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
              <label>Currently assigned users: </label>
                <table className="table">
                    <tbody>
                        { this.currentUsersList() }
                    </tbody>
              </table>
            </article>
          </div>
      </div>
    </div>
    )
  }
}