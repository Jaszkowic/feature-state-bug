import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = () => {
  const mapContainerRef = useRef(null);
  const sourceId = "tree-source-id";

  const centerLng = 13.364520524269238;
  const centerLat = 52.515671654152044;

  const [lng, setLng] = useState(centerLng);
  const [lat, setLat] = useState(centerLat);
  const [zoom, setZoom] = useState(20);

  const [hoveredTreeId, setHoveredTreeId] = useState(null);
  const hoveredPolygonIdRef = useRef(undefined);

  const spread = 0.001;
  const numTrees = 50;

  const [geojsonData, setGeojsonData] = useState({
    type: "FeatureCollection",
    features: Array(numTrees)
      .fill(1)
      .map((_, idx) => {
        const id = `id_${idx}`;
        return {
          type: "Feature",
          id: id,
          properties: {
            id: id,
          },
          geometry: {
            coordinates: [
              centerLng + (-spread + Math.random() * spread * 2),
              centerLat + (-spread + Math.random() * spread * 2),
            ],
            type: "Point",
          },
        };
      }),
  });

  useEffect(() => {
    hoveredPolygonIdRef.current = hoveredTreeId;
  }, [hoveredTreeId]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "style.json",
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
    });

    map.on("move", () => {
      setLng(map.getCenter().lng);
      setLat(map.getCenter().lat);
      setZoom(map.getZoom());
    });

    map.on("load", () => {
      console.log("add trees");

      map.addSource(sourceId, {
        type: "geojson",
        data: geojsonData,
        promoteId: "id",
      });

      map.addLayer({
        id: "trees-2d-layer",
        type: "circle",
        source: sourceId,
        interactive: true,
        paint: {
          "circle-radius": {
            base: 1.75,
            stops: [
              [11, 1],
              [22, 150],
            ],
          },
          "circle-color": "#ff0000",
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.3,
          ],
        },
      });

      map.addLayer({
        id: "trees-3d-layer",
        type: "model",
        source: sourceId,
        minzoom: 16,
        interactive: true,
        layout: {
          "model-id": "tree-model",
        },
        paint: {
          "model-scale": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            [0.008, 0.008, 0.008].map((x) => x * 1.3),
            [0.008, 0.008, 0.008],
          ],
        },
      });

      map.on("mousemove", "trees-2d-layer", (e) => {
        if (e.features.length > 0) {
          if (hoveredPolygonIdRef && hoveredPolygonIdRef.current !== null) {
            map.setFeatureState(
              {
                source: sourceId,
                id: hoveredPolygonIdRef.current,
              },
              { hover: false }
            );
          }
          setHoveredTreeId(e.features[0].id);
          map.setFeatureState(
            {
              source: sourceId,
              id: e.features[0].id,
            },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "trees-2d-layer", () => {
        if (hoveredPolygonIdRef && hoveredPolygonIdRef.current !== null) {
          map.setFeatureState(
            {
              source: sourceId,
              id: hoveredPolygonIdRef.current,
            },
            { hover: false }
          );
        }
        setHoveredTreeId(null);
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div>
      <div className="sidebarStyle">
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className="map-container" ref={mapContainerRef} />
    </div>
  );
};

export default Map;
