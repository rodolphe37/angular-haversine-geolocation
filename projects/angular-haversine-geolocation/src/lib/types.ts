export type TLocation = {
  coords: {
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    latitude: number;
    longitude: number;
    speed: number;
  };
  mocked: boolean;
  timestamp: number;
};

export type TLocationHistory = {
  locations: TLocation[];
};

export type GeolocationOptions = {
  distanceThreshold?: number; // seuil de similarité en mètres
  loadHistory: () => Promise<TLocationHistory | null>; // fonction de lecture
  saveHistory: (history: TLocationHistory) => Promise<void>; // fonction d'écriture
};
