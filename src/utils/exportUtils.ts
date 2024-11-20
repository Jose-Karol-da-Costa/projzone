import { MapMarker } from '../types';
import * as togpx from 'togpx';
import * as tokml from 'tokml';
import JSZip from 'jszip';

export const validateMarkers = (markers: MapMarker[]): boolean => {
  if (!Array.isArray(markers) || markers.length === 0) {
    throw new Error('No markers to export');
  }

  const requiredFields = ['id', 'latitude', 'longitude'];
  const isValid = markers.every(marker => 
    requiredFields.every(field => field in marker) &&
    typeof marker.latitude === 'number' &&
    typeof marker.longitude === 'number' &&
    !isNaN(marker.latitude) &&
    !isNaN(marker.longitude)
  );

  if (!isValid) {
    throw new Error('Invalid marker data');
  }

  return true;
};

export const createGeoJSON = (markers: MapMarker[]) => {
  validateMarkers(markers);
  
  return {
    type: 'FeatureCollection',
    features: markers.map(marker => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude]
      },
      properties: {
        name: marker.name || '',
        icon: marker.icon || '',
        ...Object.fromEntries(
          Object.entries(marker).filter(([key]) => 
            !['id', 'latitude', 'longitude'].includes(key)
          )
        )
      }
    }))
  };
};

export const downloadFile = (content: string | Blob, filename: string, type: string): boolean => {
  if (!content) {
    throw new Error('No content to download');
  }

  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

export const exportToCSV = (markers: MapMarker[]) => {
  validateMarkers(markers);

  try {
    const headers = Object.keys(markers[0]);
    const rows = markers.map(marker => 
      Object.values(marker).map(value => {
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (value === null || value === undefined) {
          return '';
        }
        return String(value);
      }).join(',')
    );

    return {
      content: [headers.join(','), ...rows].join('\n'),
      filename: 'markers.csv',
      type: 'text/csv'
    };
  } catch (error) {
    throw new Error('Failed to create CSV file');
  }
};

export const exportToGeoJSON = (markers: MapMarker[]) => {
  try {
    const geojson = createGeoJSON(markers);
    return {
      content: JSON.stringify(geojson, null, 2),
      filename: 'markers.geojson',
      type: 'application/json'
    };
  } catch (error) {
    throw new Error('Failed to create GeoJSON file');
  }
};

export const exportToGPX = (markers: MapMarker[]) => {
  try {
    const geojson = createGeoJSON(markers);
    const gpx = togpx(geojson as any);
    if (!gpx) throw new Error('GPX conversion failed');
    
    return {
      content: gpx,
      filename: 'markers.gpx',
      type: 'application/gpx+xml'
    };
  } catch (error) {
    throw new Error('Failed to create GPX file');
  }
};

export const exportToKML = (markers: MapMarker[]) => {
  try {
    const geojson = createGeoJSON(markers);
    const kml = tokml(geojson as any);
    if (!kml) throw new Error('KML conversion failed');

    return {
      content: kml,
      filename: 'markers.kml',
      type: 'application/vnd.google-earth.kml+xml'
    };
  } catch (error) {
    throw new Error('Failed to create KML file');
  }
};

export const exportToKMZ = async (markers: MapMarker[]) => {
  try {
    const geojson = createGeoJSON(markers);
    const kml = tokml(geojson as any);
    if (!kml) throw new Error('KML conversion failed');

    const zip = new JSZip();
    zip.file('doc.kml', kml);
    const content = await zip.generateAsync({ type: 'blob' });
    
    return {
      content,
      filename: 'markers.kmz',
      type: 'application/vnd.google-earth.kmz'
    };
  } catch (error) {
    throw new Error('Failed to create KMZ file');
  }
};