import { TestBed } from '@angular/core/testing';
import {
  GeolocationManagerService,
  provideGeolocationManager,
} from '../geolocation-manager.service';
import { TLocation, TLocationHistory } from '../types';

describe('GeolocationManagerService', () => {
  let service: GeolocationManagerService;
  const storageKey = 'geo-history-test';

  const mockLoad = async (): Promise<TLocationHistory | null> => {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as TLocationHistory) : null;
  };
  const mockSave = async (h: TLocationHistory) => {
    localStorage.setItem(storageKey, JSON.stringify(h));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        GeolocationManagerService,
        provideGeolocationManager({
          distanceThreshold: 100,
          loadHistory: mockLoad,
          saveHistory: mockSave,
        }),
      ],
    }).compileComponents();

    service = TestBed.inject(GeolocationManagerService);
    localStorage.removeItem(storageKey);
  });

  it('init loads existing history if present', async () => {
    const existing = { locations: [] } as TLocationHistory;
    await mockSave(existing);
    await service.init();
    expect(service.historySnapshot).toEqual(existing);
  });

  it('addLocation pushes location when none exists', async () => {
    const loc: TLocation = {
      coords: {
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 1,
        heading: 0,
        latitude: 48.0,
        longitude: 2.0,
        speed: 0,
      },
      mocked: false,
      timestamp: Date.now(),
    };

    await service.addLocation(loc);
    expect(service.historySnapshot.locations.length).toBe(1);
    expect(service.historySnapshot.locations[0]).toEqual(loc);
  });

  it('addLocation updates timestamp if same coord (within threshold)', async () => {
    const loc1: TLocation = {
      coords: {
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 1,
        heading: 0,
        latitude: 48.0,
        longitude: 2.0,
        speed: 0,
      },
      mocked: false,
      timestamp: 1000,
    };
    const loc2: TLocation = { ...loc1, timestamp: 2000 };

    await service.addLocation(loc1);
    await service.addLocation(loc2);

    expect(service.historySnapshot.locations.length).toBe(1);
    expect(service.historySnapshot.locations[0].timestamp).toBe(2000);
  });

  it('addLocation adds new point if far enough', async () => {
    const loc1: TLocation = {
      coords: {
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 1,
        heading: 0,
        latitude: 48.0,
        longitude: 2.0,
        speed: 0,
      },
      mocked: false,
      timestamp: 1000,
    };
    const loc2: TLocation = {
      coords: {
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 1,
        heading: 0,
        latitude: 49.0,
        longitude: 2.0,
        speed: 0,
      },
      mocked: false,
      timestamp: 2000,
    };

    await service.addLocation(loc1);
    await service.addLocation(loc2);

    expect(service.historySnapshot.locations.length).toBe(2);
  });
});
