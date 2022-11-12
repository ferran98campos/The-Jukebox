import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import { TimeMachineComponent } from './time-machine/time-machine.component';

const routes: Routes = [
  { path: '', component: SpotifyLoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'time-machine', component: TimeMachineComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
