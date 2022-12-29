import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import { CallbackComponent } from './callback/callback.component';
import { HttpClientModule } from '@angular/common/http';
import { LocalStorageModule } from 'angular-2-local-storage';
import { TimeMachineComponent } from './time-machine/time-machine.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    SpotifyLoginComponent,
    CallbackComponent,
    TimeMachineComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    LocalStorageModule.forRoot({
      prefix: 'tutorial',
      storageType: 'localStorage'
  }),
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
