import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GeolocationManagerService,
  TLocation,
  TLocationHistory,
  provideGeolocationManager,
} from 'angular-haversine-geolocation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Location History</h1>

    <ul>
      <li *ngFor="let loc of history().locations">
        Latitude: {{ loc.coords.latitude }}, Longitude: {{ loc.coords.longitude }} - Time:
        {{ getFormattedTimestamp(loc.timestamp) }}
      </li>
    </ul>

    <h2>Add a Position Manually</h2>
    <label>
      Latitude:
      <input type="number" [(ngModel)]="latitude" step="0.0001" />
    </label>
    <label>
      Longitude:
      <input type="number" [(ngModel)]="longitude" step="0.0001" />
    </label>
    <button [disabled]="!initialized" (click)="addManualLocation()">Add Position</button>
  `,
  providers: [
    provideGeolocationManager({
      distanceThreshold: 50,
      loadHistory: async () => JSON.parse(localStorage.getItem('geo-history') || 'null'),
      saveHistory: async (h) => localStorage.setItem('geo-history', JSON.stringify(h)),
    }),
  ],
})
export class AppComponent {
  private geo = inject(GeolocationManagerService);

  history = signal<TLocationHistory>({ locations: [] });

  // Inputs for coordinates
  latitude = 48.8566;
  longitude = 2.3522;

  // Flag to know if init() is completed
  initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Initialize the service and retrieve existing history
    await this.geo.init();
    this.geo.history$.subscribe((h) => this.history.set(h));
    this.initialized = true;
  }

  async addManualLocation() {
    // Create a new location with the current timestamp
    const newLocation: TLocation = {
      coords: {
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 1,
        heading: 0,
        latitude: this.latitude,
        longitude: this.longitude,
        speed: 0,
      },
      mocked: false,
      timestamp: Date.now(),
    };

    // Add the location via the service with await for persistence
    await this.geo.addLocation(newLocation);
  }

  getFormattedTimestamp(ts: number): string {
    // Convert to local string taking into account the user's timezone
    return new Date(ts).toLocaleString();
  }
}
