import { getDistanceInMeters } from '../utils';

describe('getDistanceInMeters', () => {
  it('calculates approx distance between Paris and Lyon', () => {
    const paris = { lat: 48.8566, lon: 2.3522 };
    const lyon = { lat: 45.764, lon: 4.8357 };

    const d = getDistanceInMeters(paris.lat, paris.lon, lyon.lat, lyon.lon);
    // ~392 km => 392000 meters
    expect(d).toBeGreaterThan(390000);
    expect(d).toBeLessThan(395000);
  });

  it('returns 0 for same point', () => {
    const d = getDistanceInMeters(48.8566, 2.3522, 48.8566, 2.3522);
    expect(d).toBeCloseTo(0, 6);
  });
});
