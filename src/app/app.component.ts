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

  constructor(){
    this.lights = false;
    this.scrollInterval = 0; 
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
  }

  getAllInputElementsFromElement(parentId: string){
    return document.getElementById(parentId)?.getElementsByTagName('input');
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
    
      this.scrollInterval = window.setInterval(() => {
        var playlist = document.getElementById('songs-queue');
        var amount = ((direction) ? 150 : -150);
        if(document.getElementById('songs-queue') != null && document.getElementById('songs-queue')?.scrollLeft != null){
          document.getElementById('songs-queue')!.scrollLeft = document.getElementById('songs-queue')!.scrollLeft + amount;
          console.log(document.getElementById('songs-queue')?.scrollLeft);
      }}, 120);
    }
  

  stopScroll(): void{
    console.log('left');
    window.clearInterval(this.scrollInterval);
  }
}
