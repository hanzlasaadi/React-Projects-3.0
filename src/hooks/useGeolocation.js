import { useState } from "react";

export function useGeolocation(setMapPosition) {
  const [isLoading, setIsLoading] = useState(false);
  // const [position, setPosition] = useState(defaultPosition);
  const [error, setError] = useState(null);

  function getPosition() {
    if (!navigator.geolocation)
      return setError("Your browser does not support geolocation");

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapPosition([pos.coords.latitude, pos.coords.longitude]);
        // setPosition({
        //   lat: pos.coords.latitude,
        //   lng: pos.coords.longitude,
        // });
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      }
    );
  }

  return { isLoading, error, getPosition };
}
