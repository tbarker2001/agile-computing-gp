import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const Task = props => (
  <tr style={{"backgroundColor": props.task.state.colour}}>
    <td>{props.task.creator_user.username}</td>
    <td>{props.task.title}</td>
    <td>{props.task.description}</td>
    <td>{props.task.state.text}</td>
    <td>{props.task.deadline.substring(0,10)}</td>
    <td>{props.task.assigned_users.length}</td>
    <td>
      <Link to={"/view/"+props.task._id}>view</Link> | {
        props.alreadyAssigned ?
          <a href="#" onClick={() => { props.unassignSelfTask(props.task) }}>unassign</a>
        :
          <a href="#" onClick={() => { props.assignSelfTask(props.task) }}>self-assign</a>
      }
    </td>
  </tr>
)
                                            //    {if (0.5 > 0.24){style={background-colour: #4DED30}}}
const OpenTask = props => (                 //    OpenTask is the same, but with the recommendation score
  <tr style={{"backgroundColor": props.task.state.colour}}>                                      
    <td>{props.task.creator_user.username}</td>
    <td>{props.task.title}</td>
    <td>{props.task.description}</td>
    <td>{props.task.deadline.substring(0,10)}</td>
    <td>{props.score}</td>
    <td>{props.task.assigned_users.length}</td>
    <td>
      <Link to={"/view/"+props.task._id}>view</Link> | <a href="#" onClick={() => { props.assignSelfTask(props.task) }}>self-assign</a>
    </td>
  </tr>
)

export default class TasksList extends Component {
  constructor(props) {
    super(props);

    this.deleteTask = this.deleteTask.bind(this)

    var username = Cookies.get("username");
    var logged_in = (username !== undefined);

    this.state = {
      all_tasks: [],
      assigned_tasks: [],
      open_tasks: [],
      closed_tasks: [],
      created_tasks: [],
      username: username,
      user_id: '',
      logged_in: logged_in,
      scores: {}
    }
  }

  componentDidMount() {
    console.log(`Set username to: ${this.state.username}`)
    console.log(`Set logged_in to: ${this.state.logged_in}`)

    let set_state = this.setState.bind(this);

    axios.get('http://localhost:5000/tasks/')
      .then(response => {
        response.data.forEach(task =>
          task.state = task.state ?? {"text": "OPEN", "colour": "#FFFFFF"}
          );
        response.data.sort((t1, t2) => t1.deadline - t2.deadline)
        set_state({
	        all_tasks: response.data.map(task =>
	          <Task task={task} alreadyAssigned={this.isUserAssigned(task)} unassignSelfTask={(t) => this.unassignTask(this.state.username, t)} assignSelfTask={(t) => this.assignTask(this.state.username, t)} key={task._id}/>)
	      });
      })
      .then(this.getAssignedTaskList.bind(this))
      .then(this.getOtherOpenTaskList.bind(this))
      .then(this.getClosedTaskList.bind(this))
      .then(this.getCreatedTaskList.bind(this))
      .then(
        console.log("Set tasks to " + JSON.stringify(this.state.all_tasks)))
      .catch((error) => {
        console.log(error);
      })
    
    if (this.state.logged_in){                                 // If logged in, store user_id in this.state
      axios.get('http://localhost:5000/users/get_id_by_username/' + this.state.username)
	.then(res => set_state({
	  user_id: res.data
	}))
	.catch(console.error);
    }
  }


  deleteTask(id) {
    axios.delete('http://localhost:5000/tasks/'+id)
      .then(response => {
	console.log(response.data)
	this.setState({
	  all_tasks: this.state.all_tasks.filter(el => el.props.task._id !== id),
	  assigned_tasks: this.state.assigned_tasks.filter(el => el.props.task._id !== id),
	  open_tasks: this.state.open_tasks.filter(el => el.props.task._id !== id),
	  closed_tasks: this.state.closed_tasks.filter(el => el.props.task._id !== id)
	})
      })
      .catch(err => console.error("Couldn't delete task: ", err));

  }

  isUserAssigned(task) {
    return task.assigned_users.some(user => user.username === this.state.username);
  }

  getAssignedTaskList() {
    this.setState({
      assigned_tasks: this.state.all_tasks.filter(el =>
	      el.props.alreadyAssigned)
    });
  }

  // NOT YET TESTED (may be working though)
  loadTaskScores() {
    const request = {                                            //   map all_tasks to taskswithscores 
      username: this.state.username,                     //   need scores for each task
      labelled_tasks: this.labelled_open_tasks()                   //   run topTasksForUser to run calculateMatchScores on this user, and all tasks
    };                                                         
  
    axios.post('http://localhost:5000/nlptest/topTasksForUser', request)
    .then(response => {
      this.setState({
          scores: response.data               // scores - is a mapping of task_id to score when matched with current user.
      });
    });
  }

  assignTask(username, task){
    //post to API to assign user
    const request = {                                            //   map all_tasks to taskswithscores 
      username: username,                     //   need scores for each task
      task_id: task._id                  //   run topTasksForUser to run calculateMatchScores on this user, and all tasks
    };    
    axios.post('http://localhost:5000/tasks/assignUser', request)
    .then(response => {
      window.location = '/';
    })
  }

  unassignTask(username, task){
    //post to API to assign user
    const request = {                                            //   map all_tasks to taskswithscores 
      username: username,                     //   need scores for each task
      task_id: task._id                  //   run topTasksForUser to run calculateMatchScores on this user, and all tasks
    };    
    axios.post('http://localhost:5000/tasks/unassignUser', request)
    .then(response => {
      window.location = '/';
    })
  }

  getOtherOpenTaskList() {     
    this.loadTaskScores();                      //   want to return a list of OpenTask objects                            
    this.setState({
      open_tasks: this.state.all_tasks
		    .filter(id =>
          ! (id.props.task.state.text === "CLOSED")
          && ! (id.props.task.creator_user.username === this.state.username)
          && ! this.isUserAssigned(id.props.task))
		    .map(id => 
          <OpenTask task={id.props.task} score={this.state.scores[id.props.task._id]}
					assignSelfTask={(t) => this.assignTask(this.state.username, t)} key={id.props.task._id}/>)
    });
    return;
    // TODO: work out how to sort
  }


  getClosedTaskList() {                                              
    this.setState({
      closed_tasks: this.state.all_tasks.filter(id => id.props.task.state.text === "CLOSED")
    });
    return;
  }

  getCreatedTaskList() {                                              
    this.setState({
      created_tasks: this.state.all_tasks.filter(id => id.props.task.state.text !== "CLOSED" && id.props.task.creator_user.username === this.state.username)
    });
    return;
  }
  
  // The labels and propabilities of each task, ready for use with NLP api
  // Returns {task_id: [{"label": (String), "probability": (Real)}]}
  labelled_open_tasks() {
    let labelled_open_tasks = [];
    this.state.open_tasks.forEach(id => labelled_open_tasks[id.props.task.__id] = id.props.task.nlp_labels);
    return labelled_open_tasks;
  }


  render() {
    return (
      <div>
        <h3>Project Tasks - {this.state.logged_in ? this.state.username : "(logged out)"}</h3>
        <article>
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
                      <th>Deadline</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.assigned_tasks }
                  </tbody>
                </table>
                <br></br>

                <br></br>
                <h3>Created tasks</h3>
                <table className="table">       
                  <thead className="thead-light">
                    <tr>
                      <th>Creator</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>State</th>
                      <th>Deadline</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.created_tasks }
                  </tbody>
                </table>
                <br></br>

                <br></br>
                <h3>Other open tasks</h3>
                <table className="table">       
                  <thead className="thead-light">
                    <tr>
                      <th>Creator</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Deadline</th>
                      <th>Score</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.open_tasks }
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
                      <th>Deadline</th>
                      <th>Assignees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.closed_tasks }
                  </tbody>
                </table>
                <br></br>


            </div>

        : <div> <br></br> <h5>Please log in above to view your tasks.</h5> </div>}
      </article>
      </div>
    )
  }     // want to return obj of type {taskid: [{label: 'git', probability: 0.4}]}
}