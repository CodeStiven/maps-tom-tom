import { useState, useEffect, useRef } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import "./App.css";

const App = () => {
  // longitude and latitude of Bogota
  const coordinateLatitude = 4.570868;
  const coordinateLongitud = -74.297333;

  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(coordinateLongitud);
  const [latitude, setLatitude] = useState(coordinateLatitude);

  useEffect(() => {
    let map = tt.map({
      // key: process.env.REACT_APP_TOM_TOM_API_KEY,
      key: "KzWkrbjI9M39iYWKmDr0QEyJMqBe6Cr9",
      container: mapElement.current,
      center: [longitude, latitude],
      zoom: 14,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
    });
    setMap(map);

    const addMarker = () => {
      const element = document.createElement("div");
      element.className = "marker";

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setLongitude(lngLat.lng);
        setLatitude(lngLat.lat);
      });
    };

    addMarker();

    return () => map.remove();
  }, [longitude, latitude]);
  return (
    <>
      {map && (
        <div className="app">
          <div ref={mapElement} className="map">
            <div>
              <h1>Where to?</h1>
              <input
                type="text"
                id="longitude"
                className="longitude"
                placeholder="Put in Longitude"
                onChange={(e) => {
                  setLongitude(e.target.value);
                }}
              />

              <input
                type="text"
                id="latitude"
                className="latitude"
                placeholder="Put in Latitude"
                onChange={(e) => {
                  setLatitude(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
