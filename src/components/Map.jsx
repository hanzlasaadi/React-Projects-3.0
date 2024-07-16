import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useCities } from "../contexts/CityContext";
import { useEffect, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";
import { useUrlParams } from "../hooks/useUrlParams";

function Map() {
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]);

  const { cities } = useCities();
  const { isLoading: positionLoading, getPosition } =
    useGeolocation(setMapPosition);

  const [lat, lng] = useUrlParams();

  useEffect(() => {
    if (lat && lng) {
      setMapPosition([parseFloat(lat), parseFloat(lng)]);
    }
  }, [lat, lng]);

  return (
    <div className={styles.mapContainer}>
      <Button type="position" onClick={getPosition}>
        {positionLoading
          ? "Getting your position..."
          : "Click to use your position"}
      </Button>
      <MapContainer
        className={styles.map}
        center={mapPosition}
        zoom={8}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <ChangePosition position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function DetectClick() {
  const nav = useNavigate();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      nav(`form?lat=${lat}&lng=${lng}`);
    },
  });

  return null;
}

function ChangePosition({ position }) {
  const map = useMap();
  map.setView(position, map.getZoom());
  return;
}

export default Map;
