import React, { Component } from 'react';


export default class AboutUs extends Component{

	render () {
		return (

			<div class = "aboutcontainer">
				<div class="top">
				<br></br>
				<br></br>
					<h2 class="aboutus">
						About Us
					</h2>
				</div>
				<div class="bottom">
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
					<p fontsize="10em">
						Privacy statement etc
					</p>
				</div>
			</div>
		)
	}
}