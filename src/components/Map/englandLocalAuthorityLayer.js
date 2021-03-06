/* eslint-disable react-hooks/exhaustive-deps */
// @flow

import { useState, useEffect } from 'react';
import axios from 'axios';
import { max } from 'd3-array';
import { scaleSqrt } from 'd3-scale';
import L from 'leaflet';

const useEnglandLocalAuthorityLayer = (localAuthorityData: LocalAuthorityData, hash, layerGroup, country, nhsRegion, localAuthority, onClick: Function) => {
  const [englandGeojsonRaw, setEnglandGeojsonRaw] = useState(null);
  const [utlaLayers, setUtlaLayers] = useState(null);

  useEffect(() => {
    (async () => {
      // const { data } = await axios.get('https://c19pub.azureedge.net/englandUTLA.geojson');
      const { data } = await axios.get('https://opendata.arcgis.com/datasets/a917c123e49d436f90660ef6a9ceb5cc_0.geojson');
      setEnglandGeojsonRaw(data);
    })();
  }, []);

  useEffect(() => {
    if (englandGeojsonRaw) {
      const localAuthorityMax = max(Object.keys(localAuthorityData), d => localAuthorityData?.[d]?.totalCases?.value ?? 0);
      const radiusScale = scaleSqrt().range([5, 25]).domain([1, localAuthorityMax]);

      const englandGeojson = englandGeojsonRaw.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            id: f.properties.ctyua19cd,
          },
      }));

      const boundryLayer = L.geoJSON(englandGeojson, {
        style: feature => ({
          color: '#0b0c0c',
          weight: 1,
          opacity: 0.7,
          fillColor: "#1D70B8",
          fillOpacity: localAuthority === feature.properties.id ? 0.2 : 0,
        }),
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              onClick(feature.properties.id);
            },
          });
        },
      });

      const circleLayer = L.geoJSON(
        englandGeojson.map(la => ({
          type: 'Feature',
          properties: {
            name: la.properties.ctyua19nm,
            count: localAuthorityData?.[la.properties.ctyua19cd]?.totalCases?.value ?? 0, 
          },
          geometry: {
            type: 'Point',
            coordinates: [la.properties.long, la.properties.lat],
          },
        })),
        {
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: feature.properties.count === 0 ? 0 : radiusScale(feature.properties.count),
            fillColor: "#1D70B8",
            fillOpacity: feature.properties.count === 0 ? 0 : 0.6,
            weight: 0,
          }),
        },
      );

      setUtlaLayers([circleLayer, boundryLayer]);

      if (layerGroup && hash === '#local-authorities') {
        layerGroup.clearLayers();
        [circleLayer, boundryLayer].map(l => layerGroup.addLayer(l));
      }
    }
  }, [JSON.stringify(englandGeojsonRaw), hash, country, nhsRegion, localAuthority]);

  return utlaLayers;
};

export default useEnglandLocalAuthorityLayer;