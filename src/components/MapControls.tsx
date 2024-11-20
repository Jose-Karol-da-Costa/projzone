import React, { useState } from 'react';
import { MapPin, Route, Trash2 } from 'lucide-react';
import { MapMarker } from '../types';
import { ExportPanel } from './ExportPanel';

interface MapControlsProps {
  selectedMarkers: MapMarker[];
  onToggleDrawing: () => void;
  onOptimizeRoute: (startMarkerId: string | null) => void;
  onExport: () => void;
  onDelete: () => void;
  isDrawing: boolean;
}

export function MapControls({
  selectedMarkers,
  onToggleDrawing,
  onOptimizeRoute,
  onDelete,
  isDrawing
}: MapControlsProps) {
  const [selectingStart, setSelectingStart] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedMarkers.length} selected marker${selectedMarkers.length === 1 ? '' : 's'}?`)) {
      onDelete();
    }
  };

  const handleOptimizeRoute = () => {
    if (selectingStart) {
      setSelectingStart(false);
      onOptimizeRoute(null);
    } else {
      setSelectingStart(true);
      alert('Click on a marker to set it as the starting point');
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onToggleDrawing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors ${
          isDrawing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-sm font-medium">
          {isDrawing ? 'Drawing...' : 'Select Area'}
        </span>
      </button>

      <button
        onClick={handleDelete}
        disabled={selectedMarkers.length === 0}
        className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md transition-colors ${
          selectedMarkers.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-red-50'
        }`}
      >
        <Trash2 className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-gray-700">Delete Selected</span>
      </button>

      <button
        onClick={handleOptimizeRoute}
        disabled={selectedMarkers.length < 2}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors ${
          selectingStart
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } ${
          selectedMarkers.length < 2
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        <Route className="w-5 h-5" />
        <span className="text-sm font-medium">
          {selectingStart ? 'Select Start Point' : 'Optimize Route'}
        </span>
      </button>

      <ExportPanel selectedMarkers={selectedMarkers} />
    </div>
  );
}