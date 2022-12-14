import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify.service';

@Component({
  selector: 'app-spotify-login',
  templateUrl: './spotify-login.component.html',
  styleUrls: ['./spotify-login.component.css']
})

export class SpotifyLoginComponent implements OnInit {

  constructor(private spotifyService:SpotifyService) {}

  //Adds an event listener to the Spotify Button
  ngOnInit(): void {
    const button = document.getElementById('login-spotify');
    button?.addEventListener('click', this.platformLogin.bind(this));
  }

  //We only use Spotify, so no need to check the platform for the moment
  platformLogin(){
    this.spotifyService.login();
  }

}
