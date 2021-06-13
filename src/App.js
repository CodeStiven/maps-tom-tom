import { useState, useEffect, useRef } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as ttapi from "@tomtom-international/web-sdk-services";
import "./App.css";

const App = () => {
  // longitude and latitude of Bogota
  const coordinateLatitude = 4.570868;
  const coordinateLongitud = -74.297333;

  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(coordinateLongitud);
  const [latitude, setLatitude] = useState(coordinateLatitude);

  const converToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      },
    };
  };

  const drawRoute = (geoJson, map) => {
    if (map.getLayer("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geoJson,
      },
      paint: {
        "line-color": "red",
        "line-width": 6,
      },
    });
  };

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement("div");
    element.className = "marker-delivery";
    new tt.Marker({
      element: element,
    })
      .setLngLat(lngLat)
      .addTo(map);
  };

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude,
    };

    const destinations = [];

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
      const popUpOffset = {
        bottom: [0, -25],
      };
      const popUp = new tt.Popup({ offeset: popUpOffset }).setHTML(
        "This is you!"
      );
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
      marker.setPopup(popUp).togglePopup();
    };

    addMarker();

    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return converToPoints(destination);
      });
      const callParameters = {
        key: "KzWkrbjI9M39iYWKmDr0QEyJMqBe6Cr9",
        destinations: pointsForDestinations,
        origins: [converToPoints(origin)],
      };

      return new Promise((resolve, reject) => {
        ttapi.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            const results = matrixAPIResults.matrix[0];
            const resultsArray = results.map((result, index) => {
              return {
                location: locations[index],
                drivingtime: result.response.routeSummary.travelTimeInSeconds,
              };
            });
            resultsArray.sort((a, b) => {
              return a.drivingtime - b.drivingtime;
            });
            const sortedLocations = resultsArray.map((result) => {
              return result.location;
            });
            resolve(sortedLocations);
          });
      });
    };

    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);

        ttapi.services
          .calculateRoute({
            key: "KzWkrbjI9M39iYWKmDr0QEyJMqBe6Cr9",
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            drawRoute(geoJson, map);
          });
      });
    };

    map.on("click", (e) => {
      destinations.push(e.lngLat);
      addDeliveryMarker(e.lngLat, map);
      recalculateRoutes();
    });

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
