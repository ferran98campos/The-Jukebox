import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallbackComponent } from './callback/callback.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import {WrapComponent} from './wrap/wrap.component'

const routes: Routes = [
  { path: '**', component: SpotifyLoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
