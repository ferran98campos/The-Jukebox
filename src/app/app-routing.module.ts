import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpotifyPlaybackComponent } from './spotify-playback/spotify-playback.component';

const routes: Routes = [
  { path: '**', component: SpotifyPlaybackComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
