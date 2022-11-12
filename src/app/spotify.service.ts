import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from 'angular-2-local-storage';
import * as CryptoJS from 'crypto-js';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SpotifyService {

  private scope : string;

  constructor(private router: Router, private route: ActivatedRoute, private storage: LocalStorageService, private http: HttpClient) { 
    this.scope = "";
    this.getCallback();
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

  getCallback() : void {
    //Gets the code and state returned from the Spotify Login page only in case we are in the /callback route
    if(window.location.href.indexOf(environment.spotify_redirect_url) > -1){
      
      this.route.queryParams
      .subscribe(
        params => {
          if(params['code'] == null || params['state'] == null ){
            //Redirect to error page
            this.router.navigate(['/#'], { queryParams: { error: 'Callback Error'}});        
          }else{
            //Store code and state
            this.storage.set('code', params['code']);
            this.storage.set('state', params['state']); 
            this.router.navigate(['/wrap-up']);  
          }
        },
        error => {
          this.router.navigate(['/#'], { queryParams: { error: error}});  
        }
      );
    }
  }

  getToken(): Observable<any> {
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

    return this.http.post<any>(environment.spotify_token_url, this.JSONStringfy(body), { headers });
  }

  //Used to stringfy the bodies from the requests 
  JSONStringfy (object : {[key:string]: string}) : string{
      //Stringfy the JSON object so it can be used in a URL
      return Object.keys(object).map(function(key) {
        return key + '=' + object[key]
      }).join('&');
  }
}
