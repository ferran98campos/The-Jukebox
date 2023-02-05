import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';


@Component({
  selector: 'app-spotify-playback',
  templateUrl: './spotify-playback.component.html',
  styleUrls: ['./spotify-playback.component.css']
})


export class SpotifyPlaybackComponent implements OnInit {

  constructor(private storage: LocalStorageService) { }

  ngOnInit(): void {


  };


}
