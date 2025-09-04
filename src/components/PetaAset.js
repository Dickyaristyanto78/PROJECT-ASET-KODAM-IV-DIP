import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  GeoJSON,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import area from "@turf/area";

// Import leaflet-geosearch
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

// --- Search Component ---
const SearchControl = () => {
  const map = useMap();
  const boundaryLayerRef = useRef(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        polygon_geojson: 1, // Request polygon geometry
      },
    });

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      showMarker: false, // We will show the boundary polygon instead
      showPopup: false,
      autoClose: true,
      keepResult: true,
      searchLabel: "Cari alamat atau wilayah...",
    });

    map.addControl(searchControl);

    const onResult = (e) => {
      // Hapus layer batas wilayah sebelumnya
      if (boundaryLayerRef.current) {
        map.removeLayer(boundaryLayerRef.current);
      }

      // Objek event `e` adalah objek hasilnya, `raw` ada langsung di dalamnya
      if (e.raw && e.raw.geojson) {
        const { geojson } = e.raw;
        // Hanya gambar jika itu adalah Polygon atau MultiPolygon
        if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
          const boundaryLayer = L.geoJSON(geojson, {
            style: {
              color: "var(--primary-accent, #5d8c7a)",
              weight: 3,
              opacity: 0.9,
              fillColor: "var(--army-green-light, #6b8e6e)",
              fillOpacity: 0.4, // Opasitas isian ditingkatkan agar lebih terlihat
            },
          });
          boundaryLayerRef.current = boundaryLayer;
          map.addLayer(boundaryLayer);
        }
      }
    };

    map.on("geosearch/showlocation", onResult);

    // Cleanup function
    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", onResult);
    };
  }, [map]);

  return null; // Komponen ini tidak me-render apapun
};

// Function to convert asset location to GeoJSON feature
const assetToGeoJSON = (asset) => ({
  type: "Feature",
  properties: { ...asset },
  geometry: {
    type: "Polygon",
    coordinates: asset.lokasi,
  },
});

const PetaAset = ({
  assets,
  isDrawing,
  onDrawingCreated,
  fitBounds = false,
  hideControls = false,
  jatengBoundary,
  diyBoundary,
}) => {
  const mapCenter = [-7.5, 110.0];
  let mapBounds = null;

  if (fitBounds && assets && assets.length === 1 && assets[0].lokasi) {
    const geoJsonData = assetToGeoJSON(assets[0]);
    mapBounds = L.geoJSON(geoJsonData).getBounds();
  }

  const _onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const geoJSON = layer.toGeoJSON();
      const calculatedArea = area(geoJSON);
      onDrawingCreated({
        geometry: geoJSON.geometry.coordinates,
        area: calculatedArea,
      });
    }
  };

  const assetStyle = {
    fillColor: "var(--army-green-dark, #2E7D32)", // Fallback color
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.6,
  };

  const styleJateng = {
    color: "#ff7800",
    weight: 2,
    fill: false,
  };

  const styleDIY = {
    color: "#006400",
    weight: 2,
    dashArray: "4",
    fill: false,
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={8}
      bounds={mapBounds}
      style={{ height: "100%", width: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street Map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satelit">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Medan">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          />
        </LayersControl.BaseLayer>
        {jatengBoundary && (
          <LayersControl.Overlay name="Batas Jateng" checked>
            <GeoJSON data={jatengBoundary} style={styleJateng} />
          </LayersControl.Overlay>
        )}
        {diyBoundary && (
          <LayersControl.Overlay name="Batas DIY" checked>
            <GeoJSON data={diyBoundary} style={styleDIY} />
          </LayersControl.Overlay>
        )}
      </LayersControl>

      <FeatureGroup>
        {isDrawing && (
          <EditControl
            position="topleft"
            onCreated={_onCreated}
            draw={{
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: "#e1e100",
                  message: "<strong>Oh snap!</strong> you can't draw that!",
                },
                shapeOptions: {
                  color: "var(--primary-accent, #5d8c7a)",
                },
              },
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
            edit={{ remove: false, edit: false }}
          />
        )}
      </FeatureGroup>

      {/* Render existing assets as polygons */}
      {assets.map((asset) => {
        if (!asset.lokasi) return null;
        const geoJsonData = assetToGeoJSON(asset);
        return (
          <GeoJSON key={asset.id} data={geoJsonData} style={assetStyle}>
            <Popup>
              <b>{asset.nama}</b>
              <br />
              {asset.kodim && (
                <>
                  Kodim: {asset.kodim}
                  <br />
                </>
              )}
              {asset.luas && (
                <>
                  Luas: {asset.luas.toLocaleString("id-ID")} m²
                  <br />
                </>
              )}
              Status: {asset.status}
            </Popup>
          </GeoJSON>
        );
      })}

      {/* Tambahkan komponen pencarian ke peta */}
      <SearchControl />
    </MapContainer>
  );
};

export default PetaAset;