import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'The-Jukebox';

  private lights:Boolean;
  private scrollInterval:number;
  private lastHover:Date;
  private songPlaying:Boolean;

  constructor(){
    this.lights = false;
    this.scrollInterval = 0; 
    this.lastHover = new Date();
    this.songPlaying = false;
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

    //Scrolling throughplaylist
    const leftArrow = document.getElementById('queue-left-arrow');
    leftArrow?.addEventListener('mouseover', this.scrollPlaylist.bind(this, false));
    leftArrow?.addEventListener('mouseout', this.stopScroll.bind(this));

    const rightArrow = document.getElementById('queue-right-arrow');
    rightArrow?.addEventListener('mouseover', this.scrollPlaylist.bind(this, true));
    rightArrow?.addEventListener('mouseout', this.stopScroll.bind(this));

    //Show Next Song Info
    const queueElements = this.getAllSpanElementsFromElement('songs-queue');
    if(queueElements!=null){
      for (var i = 0; i < queueElements.length; i++) {
        queueElements[i]?.addEventListener('mouseover', this.showNextSongInfo.bind(this, queueElements[i]));
        queueElements[i]?.addEventListener('mouseout', this.notShowNextSongInfo.bind(this, queueElements[i]));
        queueElements[i]?.addEventListener('click', this.selectSong.bind(this, queueElements[i]));
      }
    }

    //Pause/Play song functionality
    const songImage = document.getElementById('playing-song-image');
    songImage?.addEventListener('click', this.playSong.bind(this, songImage));
  }

  getAllInputElementsFromElement(parentId: string){
    return document.getElementById(parentId)?.getElementsByTagName('input');
  }

  getAllSpanElementsFromElement(parentId: string){
    return document.getElementById(parentId)?.getElementsByTagName('span');
  }

  turnLights(): void{
    //Define variables
    var array;
    var addingClass;
    var deletingClass;

    
    if(this.lights){
      //If lights are on, then change their class to light-off
      array = document.getElementsByClassName("light-on");
      addingClass = "light-off";
      deletingClass = "light-on";
    }else{
      //If lights are off, then change their class to light-on
      array = document.getElementsByClassName("light-off");
      addingClass = "light-on";
      deletingClass = "light-off";
    }

    //Delete the last class, and add the new one
    while(array.length > 0){
      array[0].classList.add(addingClass);
      array[0].classList.remove(deletingClass);
    }

    //Change the boolean value of this.lights to the new one
    this.lights = !this.lights;
  }
  
  selectLabel(value: string): void{
    const inputs = this.getAllInputElementsFromElement('select-menu');
    if(inputs!=null){
      for (var i = 0; i < inputs.length; i++) {
        if(inputs[i].value == value){
          inputs[i].parentElement!.id = "selected-label";
        }else{
          inputs[i].parentElement!.id = "";
        }
      }
    }
  }

  //Scroll playlist. Direction: true moves it to right, Direction: false moves it left
  scrollPlaylist(direction: boolean): void{
    if(this.lights){
      var playlist = document.getElementById('songs-queue');
      playlist!.classList.remove("not-moving");
      playlist!.classList.add("moving");
  
        this.scrollInterval = window.setInterval(() => {
          var playlist = document.getElementById('songs-queue');
          var amount = ((direction) ? 5 : -5);
            playlist!.scrollLeft +=  amount;
        }, 3);
    }
  }
  
  stopScroll(): void{
    if(this.lights){
      var playlist = document.getElementById('songs-queue');
      playlist!.classList.remove("moving");
      playlist!.classList.add("not-moving");
      window.clearInterval(this.scrollInterval);
    }
  }

  showNextSongInfo(element: HTMLSpanElement): void{
    if(this.lights){
      var nextSongInfo = document.getElementById('next-song-info');
      nextSongInfo!.classList.remove("not-showing");
      nextSongInfo!.classList.add("showing");
      this.lastHover = new Date();
    }
  }

  async checkHoverStatus(): Promise<Boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        var seconds = (now.getTime() - this.lastHover.getTime()) / 1000;
        resolve(seconds > 2);
      }, 2000);
    });
  }

  async notShowNextSongInfo(element: HTMLSpanElement){
    var nextSongInfo = document.getElementById('next-song-info');

    if(await this.checkHoverStatus()){
      nextSongInfo!.classList.remove("showing");
      nextSongInfo!.classList.add("not-showing");
    }
  }

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

  selectSong(element: HTMLSpanElement): void{
    if(this.lights){
      const currentlyPlayingSongImage = document.getElementById('playing-song-image');
      const currentSelectedElement = document.getElementById('selected-song');

      //set id to the selected song
      if(currentSelectedElement != null)
        currentSelectedElement.id = "";
      element.id = "selected-song";

      //Change info
      currentlyPlayingSongImage!.style.backgroundImage ="url('https://m.media-amazon.com/images/I/61YeJkzhAYL._SL1200_.jpg')";

      //Activate Speaker Animation
      this.setSpeakerAnimation(true);
    }
  }

  playSong(image: HTMLElement): void{
    if(this.lights){
      if(this.songPlaying){
        image.classList.remove('paused');
      }else{
        image.classList.add('paused');
      }

      //Deactivate Speaker Animation
      this.setSpeakerAnimation(this.songPlaying);
      
      this.songPlaying = !this.songPlaying;
    }
  }
}
