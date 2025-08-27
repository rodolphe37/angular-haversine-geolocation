import { Injectable, InjectionToken, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getDistanceInMeters } from './utils';
import { GeolocationOptions, TLocation, TLocationHistory } from './types';

/**
 * Injection token pour fournir des options globales.
 */
export const GEO_MANAGER_OPTIONS = new InjectionToken<Partial<GeolocationOptions>>(
  'GEO_MANAGER_OPTIONS',
  {
    factory: () => ({ distanceThreshold: 100 }),
  }
);

@Injectable({ providedIn: 'root' })
export class GeolocationManagerService {
  private options: GeolocationOptions = {
    distanceThreshold: 100,
    loadHistory: async () => null,
    saveHistory: async (_: TLocationHistory) => {},
  };

  private historySubject = new BehaviorSubject<TLocationHistory>({ locations: [] });
  readonly history$ = this.historySubject.asObservable();

  constructor() {
    const injected = inject(GEO_MANAGER_OPTIONS, { optional: true });
    if (injected) {
      if (injected.distanceThreshold !== undefined) {
        this.options.distanceThreshold = injected.distanceThreshold;
      }
      if (injected.loadHistory) this.options.loadHistory = injected.loadHistory;
      if (injected.saveHistory) this.options.saveHistory = injected.saveHistory;
    }
  }

  /**
   * Initialise le service et charge l'historique depuis loadHistory
   */
  async init(custom?: Partial<GeolocationOptions>): Promise<void> {
    if (custom) {
      if (custom.distanceThreshold !== undefined)
        this.options.distanceThreshold = custom.distanceThreshold;
      if (custom.loadHistory) this.options.loadHistory = custom.loadHistory;
      if (custom.saveHistory) this.options.saveHistory = custom.saveHistory;
    }

    const existing = await this.options.loadHistory();
    if (existing) {
      this.historySubject.next(existing);
    }
  }

  /**
   * Ajoute une location ou met à jour le timestamp si la distance < threshold
   */
  async addLocation(newLocation: TLocation): Promise<void> {
    const current = this.historySubject.getValue();
    const last = current.locations.at(-1);

    let updated: TLocationHistory;

    if (last) {
      const distance = getDistanceInMeters(
        last.coords.latitude,
        last.coords.longitude,
        newLocation.coords.latitude,
        newLocation.coords.longitude
      );

      if (distance < (this.options.distanceThreshold ?? 100)) {
        // Même coords → remplacer le dernier élément avec timestamp mis à jour
        updated = {
          locations: [
            ...current.locations.slice(0, -1),
            { ...last, timestamp: newLocation.timestamp },
          ],
        };
      } else {
        // Coordonnées différentes → ajouter
        updated = { locations: [...current.locations, newLocation] };
      }
    } else {
      // Première position
      updated = { locations: [newLocation] };
    }

    // Met à jour le BehaviorSubject
    this.historySubject.next(updated);

    // Sauvegarde persistante
    await this.options.saveHistory(updated);
  }

  /**
   * Snapshot actuel de l'historique
   */
  get historySnapshot(): TLocationHistory {
    return this.historySubject.getValue();
  }
}

/**
 * Provider helper pour configurer le service globalement
 */
export function provideGeolocationManager(options: Partial<GeolocationOptions>) {
  return { provide: GEO_MANAGER_OPTIONS, useValue: options };
}
