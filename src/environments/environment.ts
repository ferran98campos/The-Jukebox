// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  spotify_token_url: 'https://accounts.spotify.com/api/token',
  spotify_login_url_template: 'https://accounts.spotify.com/authorize?',
  spotify_redirect_url: 'http://localhost:4200/callback',
  client_id: '79fa0e07e3d24ada94f19386d8f089c6',
  client_secret: 'c19f3f714868476c99752a067a1a915b',
  code_challenge_method:'S256'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
