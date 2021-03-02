import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import cookie from 'react-cookies'
import axios from 'axios';

const Task = props => (
  <tr>
    <td>{props.task.creator_username}</td>
    <td>{props.task.title}</td>
    <td>{props.task.description}</td>
    <td>{props.task.state}</td>
    <td>{props.task.date.substring(0,10)}</td>
    <td>
      <Link to={"#"}>view (1)</Link> 
    </td>
    <td>
      <Link to={"/view/"+props.task._id}>view</Link> | <Link to={"/edit/"+props.task._id}>edit</Link> | <a href="#" onClick={() => { props.deleteTask(props.task._id) }}>delete</a>
    </td>
  </tr>
)
                                            //     {if (props.task.score > 0.24){style={background-colour: #4DED30}}
const OpenTask = props => (                 //    OpenTask is the same, but with the recommendation score
  <tr>                                      
    <td>{props.task.creator_username}</td>
    <td>{props.task.title}</td>
    <td>{props.task.description}</td>
    <td>{props.task.date.substring(0,10)}</td>
    <td>
      <Link to={"#"}>view (1)</Link> 
    </td>
    <td>{props.task.score}</td>
    <td>
      <Link to={"/view/"+props.task._id}>view</Link> | <Link to={"/edit/"+props.task._id}>edit</Link> | <a href="#" onClick={() => { props.deleteTask(props.task._id) }}>delete</a>
    </td>
  </tr>
)

export default class TasksList extends Component {
  constructor(props) {
    super(props);

    this.deleteTask = this.deleteTask.bind(this)

    this.state = {all_tasks: [], assigned_tasks: [], open_tasks: [], closed_tasks: [], 
                  username: '', user_id: '', logged_in: false, scores: {}}
  }



  componentDidMount() {
    this.setState({ username: cookie.load('username') });
       //   this.setState({ logged_in: (typeof this.state.username === 'undefined') })
    this.setState({ logged_in: true });                      //to test the view of when logged in

    axios.get('http://localhost:5000/tasks/')
      .then(response => {
        this.setState({ all_tasks: response.data})
      })
      .catch((error) => {
        console.log(error);
      })
    
    if (this.state.logged_in){                                 // If logged in, store user_id in this.state
      axios.get('http://localhost:5000/users/')            
        .then(response => {
          response.data.forEach(function (user) {
            if (user.username == this.state.username) {  
              this.setState({ user_id: user._id });
              return;
            }
          })
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }



  deleteTask(id) {
    axios.delete('http://localhost:5000/tasks/'+id)
      .then(response => { console.log(response.data)});

    this.setState({
      all_tasks: this.state.all_tasks.filter(el => el._id !== id)
    })
  }
  


  taskList() {
    return this.state.all_tasks.map(currenttask => {
      return <Task task={currenttask} deleteTask={this.deleteTask} key={currenttask._id}/>;
    })
  }



  assignedTaskList() {                                      //   go through all Tasks in all_tasks,                          
    this.state.all_tasks.forEach(function (currenttask) {   //          every one which contains an assigned_user with matching username  
        currenttask.assignedUsers.forEach(function (user) { //          must be added to assigned_tasks, then returned as a
            if (user.username == this.state.username  && currenttask.state.ext !== "Closed"){
                this.state.assigned_tasks.add(currenttask);
            }
        })                        
    })
    return this.state.assigned_tasks.map(currenttask => {
      return <Task task={currenttask} deleteTask={this.deleteTask} key={currenttask._id}/>;
    })
  }



  openTaskList() {                           //   want to return a list of OpenTask objects                            
    const request = {                                            //   map all_tasks to taskswithscores 
        labelled_user: this.labelled_user(),                     //   need scores for each task
        labelled_tasks: this.labelled_open_tasks()                   //   run topTasksForUser to run calculateMatchScores on this user, and all tasks
     };                                                         
    
    axios.post('http://localhost:5000/nlptest/topTasksForUser', request)
      .then(response => {
        this.setState({
            scores: response.data               // scores - is a mapping of task_id to score when matched with current user.
        })
      });

    const openTaskObjectsList = this.state.all_tasks.map(currenttask => {
      return <OpenTask task={currenttask} score={this.state.scores[currenttask._id]} deleteTask={this.deleteTask} key={currenttask._id}/>;
    });

    return openTaskObjectsList;              // TODO: work out how to sort
  }



  closedTaskList() {                                              
    this.state.all_tasks.forEach(function (currenttask) {    
      if (currenttask.state.text == "Closed") {  
        this.state.closed_tasks.add(currenttask);
      }
    })
    return this.state.closed_tasks.map(currenttask => {
      return <Task task={currenttask} deleteTask={this.deleteTask} key={currenttask._id}/>;
    })
  }

  
  
  labelled_open_tasks() {
    let labelledTasks = {};                                    
    this.state.all_tasks.forEach(function (currenttask) {
      if (currenttask.state.text == "Open") {
        let taskInfo = {
          text: currenttask.description
        };
        axios.post('http://localhost:5000/nlptest/processTask', taskInfo)
          .then(response => {
            const modelOutput = response.data.model_output;
            labelledTasks[currenttask._id] = modelOutput;
          })
      }
    })
    return labelledTasks;
  }


      
  labelled_user() {
    let labelledUsers = {};                                 // will be a list of size one
    let userInfo = {
      text: 'an'                                            // hoping for a free text field in the user schema to fill this
    };                                                      // other solutions include finding a way to convert a Label list to something of the same form as model output
    axios.post('http://localhost:5000/nlptest/processProfile', userInfo)
      .then(response => {
        const modelOutput = response.data.model_output;
        labelledUsers[this.state.user_id] = modelOutput;
      })
    
    return labelledUsers;
  }



  render() {
    return (
      <div>
        <h3>Project Tasks - {this.state.logged_in ? this.state.username : "(logged out)"}</h3>
        
        {this.state.logged_in ?

            <div>

                <br></br>
                <h3>Assigned tasks</h3>
                <table className="table">       
                  <thead className="thead-light">
                    <tr>
                      <th>Creator</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>State</th>
                      <th>Date</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.assignedTaskList() }
                  </tbody>
                </table>
                <br></br>

                <br></br>
                <h3>Open tasks</h3>
                <table className="table">       
                  <thead className="thead-light">
                    <tr>
                      <th>Creator</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Recommendation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.openTaskList() }
                  </tbody>
                </table>
                <br></br>

                <br></br>
                <h3>Closed tasks</h3>
                <table className="table">       
                  <thead className="thead-light">
                    <tr>
                      <th>Creator</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>State</th>
                      <th>Date</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.taskList() }
                  </tbody>
                </table>
                <br></br>
            </div>

        : <div> <br></br> <h3>Please log in above to view your tasks</h3> </div>}
      </div>
    )
  }     // want to return obj of type {taskid: [{label: 'git', probability: 0.4}]}

 
}