import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { MapMarker } from '../types';
import {
  downloadFile,
  exportToCSV,
  exportToGeoJSON,
  exportToGPX,
  exportToKML,
  exportToKMZ
} from '../utils/exportUtils';

interface ExportPanelProps {
  selectedMarkers: MapMarker[];
}

export function ExportPanel({ selectedMarkers }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async () => {
    if (selectedMarkers.length === 0) return;

    setExportProgress(0);
    setExportError(null);

    try {
      setExportProgress(25);

      let exportResult;
      switch (exportFormat) {
        case 'csv':
          exportResult = exportToCSV(selectedMarkers);
          break;
        case 'json':
          exportResult = exportToGeoJSON(selectedMarkers);
          break;
        case 'gpx':
          exportResult = exportToGPX(selectedMarkers);
          break;
        case 'kml':
          exportResult = exportToKML(selectedMarkers);
          break;
        case 'kmz':
          exportResult = await exportToKMZ(selectedMarkers);
          break;
        default:
          throw new Error('Unsupported format');
      }

      setExportProgress(75);
      downloadFile(exportResult.content, exportResult.filename, exportResult.type);
      
      setExportProgress(100);
      setTimeout(() => {
        setExportProgress(0);
        setExportError(null);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export file');
      setExportProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg shadow-md p-2">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value)}
        className="text-sm p-1 border rounded"
      >
        <option value="csv">CSV</option>
        <option value="json">GeoJSON</option>
        <option value="gpx">GPX</option>
        <option value="kml">KML</option>
        <option value="kmz">KMZ</option>
      </select>
      
      <button
        onClick={exportData}
        disabled={selectedMarkers.length === 0}
        className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg transition-colors ${
          selectedMarkers.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-50'
        }`}
      >
        <Download className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">Export</span>
      </button>

      {exportProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
      )}

      {exportError && (
        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 rounded text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{exportError}</span>
        </div>
      )}
    </div>
  );
}