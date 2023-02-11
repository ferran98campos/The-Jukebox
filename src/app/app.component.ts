import { Component } from '@angular/core';
import { SpotifyService } from './spotify.service';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'The-Jukebox';

  //Variables related to CSS
  private lights:Boolean;
  private scrollInterval:number;
  private songInterval:number;
  private actualSong:String;
  private actualSongTimeLeft:number;
  private lastHover:Date;
  private songPlaying:Boolean;
  private showSongDetails:Boolean;

  //Variables related to playlist
  private playlist:Array<Track>;

  constructor(private spotifyService:SpotifyService, private storage: LocalStorageService){
    //CSS Variables initialization
    this.lights = false;
    this.scrollInterval = 0; 
    this.songInterval = 0; 
    this.actualSong = "";
    this.actualSongTimeLeft=0;
    this.lastHover = new Date();
    this.songPlaying = false;
    this.showSongDetails = false;

    this.playlist = new Array<Track>;
  }

  //Adds an event listener to the Spotify Button
  ngOnInit(): void {

    //Home Button
    const button = document.getElementById('home-button');
    button?.addEventListener('click', this.turnLights.bind(this));

    //Color changing in label form
    const inputs = this.getAllInputElementsFromElement('select-menu');
    if(inputs!=null){
      for (var i = 0; i < inputs.length; i++) {
        inputs[i]?.addEventListener('click', this.selectLabel.bind(this, inputs[i].value));
      }
    }

    //Scrolling throughplaylist. Move elements to the left/right depending on which arrow the user hovers
    const leftArrow = document.getElementById('queue-left-arrow');
    leftArrow?.addEventListener('mouseover', this.scrollPlaylist.bind(this, false));
    leftArrow?.addEventListener('mouseout', this.stopScroll.bind(this));

    const rightArrow = document.getElementById('queue-right-arrow');
    rightArrow?.addEventListener('mouseover', this.scrollPlaylist.bind(this, true));
    rightArrow?.addEventListener('mouseout', this.stopScroll.bind(this));

    //Show Next Song Info
    this.addNextSongFunctionality();

    //Pause/Play song functionality
    const songImage = document.getElementById('playing-song-image');
    songImage!.addEventListener('click', this.playSong.bind(this, songImage!));
  }

  addNextSongFunctionality() : void{
    const queueElements = this.getAllSpanElementsFromElement('songs-queue');
    for (var i = 0; i < queueElements!.length; i++) {
      queueElements![i].addEventListener('mouseover', this.showNextSongInfo.bind(this, queueElements![i], i));
      queueElements![i].addEventListener('mouseout', this.notShowNextSongInfo.bind(this, queueElements![i]));
      queueElements![i].addEventListener('click', this.selectSong.bind(this, queueElements![i], i));
    }
  }

  //Methods that return all elements under the selected tag
  getAllInputElementsFromElement(parentId: string){
    return document.getElementById(parentId)!.getElementsByTagName('input');
  }

  getAllSpanElementsFromElement(parentId: string){
    return document.getElementById(parentId)!.getElementsByTagName('span');
  }


  //This method changes the CSS for the Jukebox's lights to be on/off
  async turnLights(): Promise<void>{
    //Define variables
    var array;
    var addingClass;
    var deletingClass;
    
    if(this.lights){
      //If lights are on, then change their class to light-off
      array = document.getElementsByClassName("light-on");
      addingClass = "light-off";
      deletingClass = "light-on";
      if(this.songPlaying)
        await this.spotifyService.pauseTrack();

    }else{
      //If lights are off, then change their class to light-on
      await this.spotifyService.requestToken();
      array = document.getElementsByClassName("light-off");
      addingClass = "light-on";
      deletingClass = "light-off";
      if(this.songPlaying)
        await this.spotifyService.playTrack('', false);
    }

    //Delete the last class, and add the new one
    while(array.length > 0){
      array[0].classList.add(addingClass);
      array[0].classList.remove(deletingClass);
    }



    //Change the boolean value of this.lights to the new one
    this.lights = !this.lights;
  }
  
  //Controls the form's (buttons at the very beginning) CSS. Whenever a button is pressed, it changes the tag's id for it CSS to be changed (color will turn purple)
  selectLabel(value: string): void{
    const inputs = this.getAllInputElementsFromElement('select-menu');
    for (var i = 0; i < inputs.length; i++) {
      //Changes the selected tag's id to 'selected-label' and the others are set to '' (empty)
      ((inputs[i].value == value) ? inputs[i].parentElement!.id = "selected-label" : inputs[i].parentElement!.id = "");
    }

    //Loads the playlist depending on the selected option on the button form
    this.loadPlaylist(value);
  }

  //Scroll playlist left or right when the user hovers one of the arrows. Inputted variable --> Direction: true moves it to right, Direction: false moves it left
  scrollPlaylist(direction: boolean): void{
    //Only is executed when this.lights is TRUE
    if(this.lights){
      var playlist = document.getElementById('songs-queue');
      //Change class to 'moving' for CSS to change (background will change to pruple when moving)
      playlist!.classList.remove("not-moving");
      playlist!.classList.add("moving");
  
      //Scrolls left/right 5 pixels (Note line 123) every 3 miliseconds (Note line 125). This is done thanks to setInterval() which executes the code repetitively until stopScroll() is called
      this.scrollInterval = window.setInterval(() => {
        var playlist = document.getElementById('songs-queue');
        var amount = ((direction) ? 5 : -5);
          playlist!.scrollLeft +=  amount;
      }, 3);
    }
  }
  
  //Changes the playlist's CSS 'back to normal' when the user stops hovering the arrows
  stopScroll(): void{
    //Only is executed when this.lights is TRUE
    if(this.lights){
      var playlist = document.getElementById('songs-queue');
      playlist!.classList.remove("moving");
      playlist!.classList.add("not-moving");
      //Delete the interval we set in scrollPlaylist() so its not executed anymore
      window.clearInterval(this.scrollInterval);
    }
  }

  //The following three methods allow a purple box (containing a song details) to appear, and dissapear after 2 seconds (more or less) whenever a song cover is hovered

  //This method makes the purple box visible. Called when a song cover is hovered
  showNextSongInfo(element: HTMLSpanElement, position:number): void{
    //Only is executed when this.lights is TRUE
    if(this.lights){
      var nextSongInfo = document.getElementById('next-song-info');

      nextSongInfo!.firstElementChild!.setAttribute('src', this.playlist[position].getImg());
      nextSongInfo!.lastElementChild!.innerHTML = this.playlist[position].getName();

      nextSongInfo!.classList.remove("not-showing");
      nextSongInfo!.classList.add("showing");
      //Saves the current time, so that checkHoverStatus() can know when 2 seconds have passed and make the box invisible
      this.lastHover = new Date();
    }
  }

  //This method is used in notShowNextSongInfo(), and resolves the promise once 2 seconds have passed since showNextSongInfo() was executed (the song cover was hovered)
  async checkHoverStatus(): Promise<Boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        var seconds = (now.getTime() - this.lastHover.getTime()) / 1000;
        resolve(seconds > 2);
      }, 2000);
    });
  }

  //Makes the box dissapear once checkHoverStatus() is resolved
  async notShowNextSongInfo(element: HTMLSpanElement){
    var nextSongInfo = document.getElementById('next-song-info');

    if(await this.checkHoverStatus()){
      nextSongInfo!.classList.remove("showing");
      nextSongInfo!.classList.add("not-showing");
    }
  }

  //Plays and stops the speakers' animation. Plays the animation whenever a song is selected, and stops it when the song is paused or the jukebox is off
  setSpeakerAnimation(activate:Boolean){
    const speaker = document.getElementsByClassName("speaker");

    if(activate){
      for (var i = 0; i < speaker.length; i++) {
        speaker[i].classList.add('playing');
        speaker[i].classList.remove('not-playing');
      }
    }else{
      for (var i = 0; i < speaker.length; i++) {
        speaker[i].classList.add('not-playing');
        speaker[i].classList.remove('playing');
      }
    }

  }

  //Sets the proper CSS whenever a song is selected (shows new details, changes cover, activates speaker animation)
  selectSong(element: HTMLSpanElement, position:number): void{
    //Only is executed when this.lights is TRUE
    if(this.lights){
      const currentlyPlayingSongImage = document.getElementById('playing-song-image');
      const currentSelectedElement = document.getElementById('selected-song');
      const currentlyPlayingSongDetails = document.getElementById('playing-song-info')?.querySelectorAll("p");
      const nextSongDetails = document.getElementById('next-song-info');

      //If no song is playing, and one is selected, then its details must be shown. We do so by adding the class 'playing' to all <p> elements under the tag 'playing-song-info'
      if(!this.showSongDetails){
        for (var i = 0; i < currentlyPlayingSongDetails!.length; i++) {
          currentlyPlayingSongDetails![i].classList.add("selected");
        }
        currentlyPlayingSongImage!.classList.add("selected");
        this.showSongDetails = true;
      }
      //set id to the selected song
      if(currentSelectedElement != null)
        currentSelectedElement.id = "";
      element.id = "selected-song";

      //Change info
      currentlyPlayingSongImage!.style.backgroundImage ="url('" + this.playlist[position].getImg() + "')";
      currentlyPlayingSongDetails!.item(0).innerHTML = this.playlist[position].getName();
      currentlyPlayingSongDetails!.item(1).innerHTML = this.playlist[position].getArtist();
      currentlyPlayingSongDetails!.item(2).innerHTML = this.playlist[position].getAlbum();

      //Activate Speaker Animation
      this.setSpeakerAnimation(true);

      //Play Song
      this.spotifyService.playTrack(this.playlist[position].getUri(), true);

      //This parts controls how much time is left for the song to finish. Once it finishes, a random song is selected so that the jukebox can contnue playing songs
      if(this.actualSong != ""){
        window.clearInterval(this.songInterval);
      }
        
      this.actualSong = this.playlist[position].getUri();
      this.actualSongTimeLeft = this.playlist[position].getDuration();
      this.songInterval = window.setInterval(() => {
        if(this.actualSongTimeLeft <= 0){
          const queueElements = this.getAllSpanElementsFromElement('songs-queue');
          i = Math.floor(Math.random() * queueElements.length);
          //New song randomly selected
          console.log("End of Song, next one is being randomly selected from playlist");
          this.selectSong(queueElements![i], i);
        }else if(this.lights && this.songPlaying)
          this.actualSongTimeLeft -= 100;
      }, 100);

      currentlyPlayingSongImage!.classList.remove('paused');

      this.songPlaying = true;
    }
  }

  //Pauses or plays a song. Changes the CSS by adding or removing the class 'paused'
  playSong(image: HTMLElement): void{
    if(this.lights){
      if(!this.songPlaying){
        image.classList.remove('paused');
        this.spotifyService.playTrack('', false);
      }else{
        image.classList.add('paused');
        this.spotifyService.pauseTrack();
      }

      //Deactivate Speaker Animation
      this.setSpeakerAnimation(this.songPlaying);
      
      this.songPlaying = !this.songPlaying;
    }
  }


  //Executes a playlist builder algorithm depending on user option
  loadPlaylist(value: string): void{

    if(value=="surprise"){
      var random : number = Math.floor(Math.random() * (2 - 0 + 1) + 0);
      ((random==0) ? value="most_listened" : (random==1) ? value="playlist_mix" : value="artist")
    }

    if(value == "most_listened"){
      //Most listened songs in the last months
      this.spotifyService.getTopListenedTracks("long_term").then(tracks=> {
        this.modifyPlaylist(tracks);
      });
    }else if(value == "playlist_mix"){
      //Song mix from some of the user playlist
      this.spotifyService.getPlaylistMix().then(tracks => this.modifyPlaylist(tracks));
    }else if(value== "artist"){
      //Top listened tracks from a random artist the user is following
      this.spotifyService.getOneArtistPlaylist().then(tracks => this.modifyPlaylist(tracks));
    }
  }

  //Loads tracks data into the playlist view
  modifyPlaylist(tracks:Array<any>):void{
    const playlistTag = document.getElementById('songs-queue');

        playlistTag!.innerHTML = "";
        var span, img;

        //Empty the playlist array
        this.playlist = new Array();
        //And fill it again with the received tracks
        for(let track of tracks){
          //Adding tracks to array
          this.playlist.push(new Track(track))

          //Add images to playlist HTML tag
          span = document.createElement("span");
          img = document.createElement("img");
          img.src = track['album']['images'][0]['url'];
          span.appendChild(img);
          playlistTag!.appendChild(span);
        }
        this.addNextSongFunctionality();
  }

}

class Track{
  private name : string;
  private artist : string;
  private album : string;
  private img : string;
  private uri : string;
  private duration:number;

  constructor(track : any){
    this.name = track['name'];
    this.artist = track['album']['artists'][0]['name'];
    this.album = track['album']['name'];
    this.img = track['album']['images'][0]['url'];
    this.uri = track['uri'];
    this.duration = track['duration_ms'];
  }

  getName() : string{
    return this.name;
  }

  getArtist() : string{
    return this.artist;
  }

  getAlbum() : string{
    return this.album;
  }

  getImg() : string{
    return this.img;
  }

  getUri() : string{
    return this.uri;
  }

  getDuration():number{
    return this.duration;
  }
}