import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyPlaybackComponent } from './spotify-playback.component';

describe('SpotifyPlaybackComponent', () => {
  let component: SpotifyPlaybackComponent;
  let fixture: ComponentFixture<SpotifyPlaybackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpotifyPlaybackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyPlaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
