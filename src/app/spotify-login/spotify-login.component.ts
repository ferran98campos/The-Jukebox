import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-spotify-login',
  templateUrl: './spotify-login.component.html',
  styleUrls: ['./spotify-login.component.css']
})

export class SpotifyLoginComponent implements OnInit {

  //Define some private variables used to store spotify login parameters
  private client_id : string;
  private redirect_uri : string;
  private scope : string;

  constructor() { 
    //Set values to private variables.
    this.client_id = '79fa0e07e3d24ada94f19386d8f089c6'; 
    this.redirect_uri = 'http://localhost:4200/'; 
    this.scope = 'user-read-private user-read-email';
  }

  //Adds an event listener to the Spotify Button
  ngOnInit(): void {
    const button = document.getElementById('login-spotify');
    button?.addEventListener('click', this.login.bind(this));
  }

  //Generates a random string. Its length matches the one passed to the function
  generateRandomString(length : number) : string {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  login() : void{
    //Set all the parameters required on the Spotify Login Process
    var state = this.generateRandomString(16);
    this.scope = "";

    const queryParameters : {[key:string]: string} = ({
      response_type: 'code',
      client_id: this.client_id,
      scope: this.scope,
      redirect_uri: this.redirect_uri,
      state: state
    });

    //Stringfy the JSON object so it can be used in a URL
    var queryString = Object.keys(queryParameters).map(function(key) {
      return key + '=' + queryParameters[key]
    }).join('&');

    //Redirect to Spotify Login
    window.location.href = 'https://accounts.spotify.com/authorize?' + queryString;
  }

}
