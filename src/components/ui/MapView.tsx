import Map, { NavigationControl, Marker, Popup, type MapProps } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox token — set VITE_MAPBOX_TOKEN in .env for production use.
const MAPBOX_TOKEN = (import.meta as unknown as { env: Record<string, string> }).env
  ?.VITE_MAPBOX_TOKEN || '';

interface Props extends Partial<MapProps> {
  height?: number | string;
  children?: React.ReactNode;
}

/**
 * Thin wrapper around react-map-gl with MW defaults.
 * If no token is configured, shows a styled placeholder.
 */
export function MapView({ height = 460, children, ...mapProps }: Props) {
  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="rounded-mw-sm bg-mw-gray-100 border border-mw-gray-200 flex items-center justify-center text-mw-gray-500 text-sm px-6 text-center"
        style={{ height }}
      >
        <span>
          Set{' '}
          <code className="mx-1 px-1.5 py-0.5 bg-white rounded text-xs font-mono">
            VITE_MAPBOX_TOKEN
          </code>{' '}
          in <code className="mx-1 px-1.5 py-0.5 bg-white rounded text-xs font-mono">.env</code> to
          render the map.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-mw-sm overflow-hidden border border-mw-gray-200" style={{ height }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 55.2708, latitude: 25.2048, zoom: 8 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        {...mapProps}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        {children}
      </Map>
    </div>
  );
}

export { Marker as MapMarker, Popup as MapPopup };

