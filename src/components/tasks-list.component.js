import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

import Editabletitle from "./editable-title.component";


const Project = props =>(
  <div> 
      <p onClick={ props.TasksList.state.projectname }>{props.TasksList.state.projectname} !</p>
      <input type="text" onChange = {props.TasksList.state.projectname} value={props.TasksList.state.projectname}/>
  </div>
)


const Task = props => (
  <tr>
    <td>{props.task.creator_username}</td>
    <td>{props.task.title}</td>
    <td>{props.task.description}</td>
    <td>{props.task.state.text}</td>
    <td>{props.task.date.substring(0,10)}</td>
    <td>
      {props.task.assigned_users.length} 
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
    {props.task.assigned_users.length} 
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

    var username = Cookies.get("username");
    var logged_in = (username !== undefined);

    this.state = {
      all_tasks: [],
      assigned_tasks: [],
      open_tasks: [],
      closed_tasks: [],
      username: username,
      user_id: '',
      is_admin:false,
      logged_in: logged_in,
      scores: {},
      projectname:'Project',
      projectid:0
    }

  }


  componentDidMount() {
    console.log(`Set username to: ${this.state.username}`)
    console.log(`Set logged_in to: ${this.state.logged_in}`)

    let set_state = this.setState.bind(this);

    axios.get('http://localhost:5000/tasks/')
      .then(response => {
        set_state({
	  all_tasks: response.data.map(task =>
	    <Task task={task} deleteTask={this.deleteTask} key={task._id}/>)
	})
      })
      .then(this.getAssignedTaskList.bind(this))
      .then(this.getOpenTaskList.bind(this))
      .then(this.getClosedTaskList.bind(this))
      .catch((error) => {
        console.log(error);
      })
    //TODO:merge these into 1 axios request if the second request is correct subject to testing.
    if (this.state.logged_in){                                 // If logged in, store user_id in this.state
      axios.get('http://localhost:5000/users/get_id_by_username/' + this.state.username)
	.then(res => set_state({
	  user_id: res.data
	}))
	.catch(console.error);
  axios.get('http://localhost:5000/users/get_by_id' + +this.state.user_id)
	.then(res => this.setState({
	  is_admin: res.data.is_admin
	}))
	.catch(console.error);
    axios.get('http://localhost:5000/projects/'+this.state.projectid)
	.then(res => this.setState({
	  projectname: res.data.title
	})).catch(console.error);
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



  getAssignedTaskList() {
    const username = this.state.username;
    this.setState({
      assigned_tasks: this.state.all_tasks.filter(el =>
	      el.props.task.state.text !== "CLOSED" &&            // are there not meant to be brackets around this?
	      el.props.task.assigned_users
	  .filter(user => {
	    if (user === null) {
	      console.error("Null assigned user in task:", el.props.task);
	      return false;
	    }
	    return true;
	  })
	  .map(user => user.username)
	  .includes(username))
    })
  }



  getOpenTaskList() {                           //   want to return a list of OpenTask objects                            
    this.setState({
      open_tasks: this.state.all_tasks
		    .filter(id => id.props.task.state.text === "OPEN" )
		      .map(id => <OpenTask task={id.props.task} score={this.state.scores[id.props.task._id]}
					   deleteTask={this.deleteTask} key={id.props.task._id}/>)
    });
    return;
    // TODO delete this stuff or fix this function??
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



  getClosedTaskList() {                                              
    this.setState({
      closed_tasks: this.state.all_tasks.filter(id => id.props.task.state.text === "CLOSED")
    });
    return;
    // TODO delete this stuff
    this.state.all_tasks.forEach(function (currenttask) {    
      if (currenttask.state.text == "CLOSED") {  
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
      if (currenttask.state.text == "OPEN") {
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
    axios.get('http://localhost:5000/users/get_by_username/' + this.state.username)
      .then(user => {
        let userInfo = {
          username: this.state.username,
          links: user.links,
          freeText: user.free_text
        }
        axios.post('http://localhost:5000/nlptest/processProfile', userInfo)
          .then(response => {
            const modelOutput = response.data.model_output;
            labelledUsers[this.state.user_id] = modelOutput;
          })
      })
    return labelledUsers;
  }


  changeProjectnameHandler = (event) => {
    this.setState({
      projectname: event.target.value           
  })
  const newtitle = {
    title: this.state.projectname
  }
  console.log(newtitle);

  axios.post('http://localhost:5000/projects/update'+this.state.projectid,newtitle)
    .then(res => console.log(res.data));
    
}


  render() {
    
    return (
      <div>
      <div > 
	 <h3 >{(this.state.logged_in).toString()}{(this.state.is_admin).toString()}</h3>

      <div style = {{float:'left'}}>
      <h3>  <Editabletitle
      text={this.state.projectname+" "}
      placeholder="Project "
      type="input"
      loggedin = {(this.state.logged_in).toString()}
      isadmin = {(this.state.is_admin).toString()}
      >
      
      <input
        type="text"
        name="task"
        placeholder={this.state.projectname+" "}
        loggedin = {(this.state.logged_in).toString()}
        isadmin = {(this.state.is_admin).toString()}
        value={this.state.projectname}
        onChange={(event) => this.setState({projectname: event.target.value })}
        onBlur={this.changeProjectnameHandler}
      />
    </Editabletitle></h3>
    </div>
    <div style = {{float:'left'}}>
    <span class="glyphicon">&#x270f;</span>
    </div>
    <div style = {{float:'left'}}>
    <h3>Tasks -{this.state.logged_in ?  this.state.username : "(logged out)"} </h3>
      </div>
      </div>
        <article style = {{clear:'both'}}>
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
                    { this.state.assigned_tasks }
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
                      <th>Date</th>
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
