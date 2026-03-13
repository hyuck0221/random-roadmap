declare namespace naver {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      mapTypeId?: string;
      zoomControl?: boolean;
      zoomControlOptions?: object;
      mapDataControl?: boolean;
      scaleControl?: boolean;
      logoControl?: boolean;
    }

    class Map {
      constructor(element: HTMLElement | string, options?: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setZoom(level: number): void;
      getZoom(): number;
      destroy(): void;
      fitBounds(bounds: LatLngBounds, margin?: number): void;
    }

    class LatLngBounds {
      constructor(sw: LatLng, ne: LatLng);
      extend(latlng: LatLng): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      icon?: MarkerIcon | string;
      title?: string;
      clickable?: boolean;
    }

    interface MarkerIcon {
      url?: string;
      content?: string | HTMLElement;
      size?: Size;
      anchor?: Point;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
      setIcon(icon: MarkerIcon | string): void;
    }

    interface PolylineOptions {
      path: LatLng[];
      map?: Map;
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
      strokeStyle?: string;
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
    }

    interface PanoramaOptions {
      position: LatLng;
      pov?: { pan: number; tilt: number; fov: number };
    }

    enum PanoramaStatus {
      OK = 'OK',
      ERROR = 'ERROR',
      ZERO_RESULTS = 'ZERO_RESULTS',
    }

    class Panorama {
      constructor(element: HTMLElement | string, options?: PanoramaOptions);
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
      setPov(pov: { pan: number; tilt: number; fov?: number }): void;
      getPov(): { pan: number; tilt: number; fov: number };
    }

    namespace Service {
      enum Status {
        OK = 'OK',
        ERROR = 'ERROR',
      }

      interface GeocodeOptions {
        query: string;
      }

      interface GeocodeResponse {
        v2: {
          addresses: Array<{
            x: string;
            y: string;
            roadAddress: string;
            jibunAddress: string;
            addressElements: Array<{
              longName: string;
              shortName: string;
              types: string[];
            }>;
          }>;
          meta: {
            totalCount: number;
          };
        };
      }

      function geocode(
        options: GeocodeOptions,
        callback: (status: Status, response: GeocodeResponse) => void
      ): void;
    }

    type MapEventListener = unknown;

    namespace Event {
      function addListener(
        target: Map | Marker | Panorama,
        eventName: string,
        handler: (...args: unknown[]) => void
      ): MapEventListener;
      function removeListener(listener: MapEventListener): void;
    }

    const maps: {
      Map: typeof Map;
      LatLng: typeof LatLng;
      Marker: typeof Marker;
      Polyline: typeof Polyline;
      Panorama: typeof Panorama;
      PanoramaStatus: typeof PanoramaStatus;
      Service: typeof Service;
      Event: typeof Event;
      LatLngBounds: typeof LatLngBounds;
      Point: typeof Point;
      Size: typeof Size;
    };
  }
}

interface Window {
  naver: typeof naver;
}
