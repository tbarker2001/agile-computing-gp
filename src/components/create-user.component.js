import React, {Component} from 'react';
import axios from 'axios';

//let linkSchema = require('./link.schema');

export default class CreateUser extends Component {
    constructor(props) {
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeStackOverflowProfile = this.onChangeStackOverflowProfile.bind(this);
        this.onChangeGithubProfile = this.onChangeGithubProfile.bind(this);


        this.state = {
            username: '',
            password: '',
            email: '',
            //assigned_tasks: '',
            links: [], // currently not set on signup
            stackOverflowProfileLink: '',
            free_text: '',
            githubProfileLink: '',
            //nlp_labels: ''
        }
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        })
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        })
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
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

    onChangeFreeText(e) {
      this.setState({
        free_text: e.target.value
      })
    }


    onSubmit(e) {
        e.preventDefault();

        const user = {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
            assigned_tasks: [],
            links: this.state.links,
            free_text: this.state.free_text,
            nlp_labels: []
        }

        console.log(user);

        // todo: find out why this request isn't setting cookie???
        axios.post('http://localhost:5000/users/signup', user, {withCredentials: true, credentials: 'include'})
            .then(function (response) {
                console.log(response.data);
                window.location = '/signupcomplete';
            })
	    .catch(console.error);
	    
        //todo: check if success

    }

    render() {
        return (
            <div>
                <div className="pairBoxes">
                    <div className="personalBoxView">
                        <h3>Create your profile</h3>
                        <form onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <label>Username: </label>
                                <input type="text"
                                       required
                                       className="form-control"
                                       value={this.state.username}
                                       onChange={this.onChangeUsername}
                                />
                                <label>Password: </label>
                                <input type="text"
                                       required
                                       className="form-control"
                                       value={this.state.password}
                                       onChange={this.onChangePassword}
                                />
                                <label>Email: </label>
                                <input type="text"
                                       required
                                       className="form-control"
                                       value={this.state.email}
                                       onChange={this.onChangeEmail}
                                />
                                <label>Stack Overflow Profile</label>
                                <input type="text"
                                       className="form-control"
                                       value={this.state.stackOverflowProfileLink}
                                       onChange={this.onChangeStackOverflowProfile}
                                />
                                <label>Github Profile</label>
                                <input type="text"
                                       className="form-control"
                                       value={this.state.githubProfileLink}
                                       onChange={this.onChangeGithubProfile}
                                />
                                <label>Free text: </label>
                                <textarea  type="text"
                                    className="form-control"
                                    value={this.state.free_text}
                                    onChange={this.onChangeFreeText}
                                    />
                            </div>
                            <div className="form-group">
                                <input type="submit" value="Create User" className="btn btn-primary"/>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
