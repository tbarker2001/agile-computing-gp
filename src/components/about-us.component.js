import React, { Component } from 'react';


export default class AboutUs extends Component{

	render () {
		return (

			<div className="aboutcontainer">
				<div className="top">
				<br></br>
				<br></br>
					<h2 className="aboutus">
						About Us
					</h2>
				</div>
				<div className="bottom">
					<br></br>
					<br></br>
					<p>
						This is our about us page.		
						Here you will learn why we are doing this.		
					</p>
					<p>
						Here you will learn why we are doing this.		
						Please see more text for details.
					</p>
					<p>		
						Please see more text for details.
						This is our about us page.
					</p>
					<br></br>
					<br></br>
					<p fontSize="10em">
						Privacy statement etc
					</p>
				</div>
			</div>
		)
	}
}
