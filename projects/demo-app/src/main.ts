import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import {
  provideGeolocationManager,
} from 'angular-haversine-geolocation';

bootstrapApplication(AppComponent, {
  providers: [
    provideGeolocationManager({
      distanceThreshold: 50,
      loadHistory: async () =>
        JSON.parse(localStorage.getItem('geo-history') || 'null'),
      saveHistory: async (h) =>
        localStorage.setItem('geo-history', JSON.stringify(h)),
    }),
  ],
});
