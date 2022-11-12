import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wrap',
  templateUrl: './wrap.component.html',
  styleUrls: ['./wrap.component.css']
})
export class WrapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    
    //Progress Bar event listener
    /*
    const button = document.getElementById('progress-button');
    button?.addEventListener('click', this.initProgressBar.bind(this));
    */
  }

  //Progress Bar animation
  /* 
  initProgressBar(){
    var elem = document.getElementById('progress-line');   
    
      var width = 0;
      var id = setInterval(frame, 10);
      function frame() {
          if(elem != null){
            if (width >= 100) {
              clearInterval(id);
            } else {
              width++; 
              elem.style.width = width + '%'; 
            }
        }
      }
  }
  */

}
