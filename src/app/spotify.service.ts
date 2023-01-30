import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'angular-2-local-storage';
import * as CryptoJS from 'crypto-js';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SpotifyService {

  private scope : string;

  constructor(private router: Router, private route: ActivatedRoute, private storage: LocalStorageService, private http: HttpClient) { 
    this.scope = "user-top-read user-modify-playback-state user-modify-playback-state";

    //This needs to be asked to the user 
    this.storage.set('device_id', "72d6cafe2c92d7925375215f741823585db6d19f");

    this.router.events.subscribe((data) =>
    {
        if (data instanceof NavigationEnd)
        {
            this.getCallback();
        }
    });
    
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
    //Only login if user has still not logged in
    if(this.storage.get('state') == null || this.storage.get('code') == null){
        //Set all the parameters required on the Spotify Login Process
        var state = this.generateRandomString(16);
        const codeVerifier = this.generateRandomString(128);

        this.storage.set('state', state);
        this.storage.set('codeVerifier', codeVerifier);

        const codeVerifierHash = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64);
        const codeChallenge = codeVerifierHash
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const queryParameters : {[key:string]: string} = ({
          response_type: 'code',
          client_id: environment.client_id,
          scope: this.scope,
          redirect_uri: environment.spotify_redirect_url,
          state: state,
          code_challenge_method: environment.code_challenge_method,
          codeChallenge: codeChallenge
        });

        //Redirect to Spotify Login
        window.location.href = environment.spotify_login_url_template + this.JSONStringfy(queryParameters);
    }

  }

  getCallback() : void {
    //Gets the code and state returned from the Spotify Login page only in case we are in the /callback route
    
    if(window.location.href.length > environment.spotify_redirect_url.length){

    this.route.queryParams.pipe(
      take(1))
      .subscribe(
        params => {
          const code = params['code'];
          const state = params['state'];
          this.storage.set('code', code);
          this.storage.set('state', state);
          this.router.navigate(['/']);
        },
        error => {
          this.router.navigate(['/#'], { queryParams: { error: error}});  
        }
      );
    }  
  }

  //Gets a Token from Spotify API. If 'Invalid Authorization code' is obtained, then that means we already have a token.
  requestToken(): Promise<void> {
    const headers = { 
      'Authorization': 'Basic ' + (btoa(environment.client_id + ':' + environment.client_secret)) , 
      'Content-Type' : 'application/x-www-form-urlencoded'
    };

    const body : {[key:string]: string} = { 
      grant_type : 'authorization_code',
      code : this.storage.get('code'),
      redirect_uri : environment.spotify_redirect_url,
      clientId : environment.client_id,
      code_verifier : this.storage.get('codeVerifier')
    }
    

    return new Promise<void>((resolve, reject) => {
      this.http.post<any>(environment.spotify_token_url, this.JSONStringfy(body), { headers }).subscribe({
        next: data => {
          console.log('Token obtained!');
            this.storage.set('refresh_token', data['refresh_token']);
            this.storage.set('token', data['access_token']);
            resolve();
        },
        error: async error => {
          const error_description = error['error']['error_description'];
          if( error_description== 'Invalid authorization code' || error_description == 'Authorization code expired'){
            await this.refreshToken(); 
            resolve(); 
          }
          else{
            console.error('There was an error!', error);
            reject();
          }
        }
      });

    });

  }

  refreshToken(): Promise<void> {
    const headers = { 
      'Authorization': 'Basic ' + (btoa(environment.client_id + ':' + environment.client_secret)) , 
      'Content-Type' : 'application/x-www-form-urlencoded'
    };

    const body : {[key:string]: string} = { 
      grant_type : 'refresh_token',
      refresh_token : this.storage.get('refresh_token'),
      redirect_uri : environment.spotify_redirect_url,
      clientId : environment.client_id,
      code_verifier : this.storage.get('codeVerifier')
    };

    return new Promise<void>((resolve, reject) => {
      this.http.post<any>(environment.spotify_token_url, this.JSONStringfy(body), { headers }).subscribe({
        next: data => {
            console.log('Token was refreshed');
            this.storage.set('token', data['access_token'])
            resolve();
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });
  }


  //Used to stringfy the bodies from the requests 
  JSONStringfy (object : {[key:string]: string}) : string{
      //Stringfy the JSON object so it can be used in a URL
      return Object.keys(object).map(function(key) {
        return key + '=' + object[key]
      }).join('&');
  }

  //Sets track as next in the queue and plays it
  async playTrack(song_uri:string, addToQueue:boolean) : Promise<void>{
    await this.requestToken();

    if(addToQueue){
      await this.addTrackToQueue(song_uri);
      await this.jumpToNextTrack();
    }
      
    const headers = { 
      'Accept': 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.storage.get('token')
    };
    
    return new Promise<void>((resolve, reject) => {
      this.http.put<any>(environment.play_track_url  + "?device_id=" + this.storage.get('device_id'), null, { headers }).subscribe({
        next: () => {
            console.log('Song Paused!');
            resolve();
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });

  }

  async pauseTrack() : Promise<void>{
    const headers = { 
      'Accept': 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.storage.get('token')
    };
    
    return new Promise<void>((resolve, reject) => {
      this.http.put<any>(environment.pause_track_url  + "?device_id=" + this.storage.get('device_id'), null, { headers }).subscribe({
        next: () => {
            console.log('Song Paused!');
            resolve();
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });
  }

  async addTrackToQueue(song_uri:string) : Promise<void>{
    const headers = { 
      'Accept': 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.storage.get('token')
    };
    
    return new Promise<void>((resolve, reject) => {
      console.log(headers);
      this.http.post<any>(environment.queue_url + "?uri=" + song_uri + "&device_id=" + this.storage.get('device_id'), null, { headers }).subscribe({
        next: () => {
            console.log('Song was added to queue!');
            resolve();
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });
  }

  async jumpToNextTrack() : Promise<void>{
    const headers = { 
      'Accept': 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + this.storage.get('token')
    };
    
    return new Promise<void>((resolve, reject) => {
      this.http.post<any>(environment.next_track_url + "?device_id=" + this.storage.get('device_id'), null, { headers }).subscribe({
        next: () => {
            console.log('Skipped to Next Song!');
            resolve();
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });
  }
  

  //Gets top 50 most listened tracks in the last months
  async getTopListenedTracks(term:string) : Promise<Array<any>>{

    await this.requestToken();

    const headers = { 
      'Authorization': 'Bearer ' + this.storage.get('token') , 
      'Content-Type' : 'application/json'
    };

    return new Promise<Array<any>>((resolve, reject) => {
       this.http.get<any>(environment.top_tracks_url+term+'&limit=50', { headers }).subscribe({
        next: data => {
            console.log('TopListenedTracks received!');
            resolve(data['items']);
        },
        error: error => {
          console.error('There was an error!', error);
          reject();
        }
      })
    });
  }
}