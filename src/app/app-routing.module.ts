import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import {WrapComponent} from './wrap/wrap.component'

const routes: Routes = [
  { path: '', component: SpotifyLoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'wrap-up', component: WrapComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
