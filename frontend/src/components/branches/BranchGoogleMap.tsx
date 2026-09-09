'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { BranchLocation, BRANCH_LOCATIONS } from '@/lib/data/branchesData';
import { useLanguage } from '@/context/LanguageContext';

declare global {
  interface Window {
    google?: any;
  }
}

export interface BranchGoogleMapProps {
  branches?: BranchLocation[];
  selectedBranch?: BranchLocation | null;
  onSelectBranch?: (branch: BranchLocation) => void;
  className?: string;
  height?: string;
  showBranchList?: boolean;
  compact?: boolean;
}

// Generate custom SVG branded pin data URI for Google Maps Marker (Using East Bay / Rum Swizzle palette)
export function createBrandedPinSvg(selected: boolean = false): string {
  const primaryColor = selected ? '#22253F' : '#474C80'; // Midnight East Bay if selected, East Bay standard
  const strokeColor = selected ? '#F8F7E2' : '#CBD0E4';  // Rum Swizzle highlight if selected, soft cool border
  const strokeWidth = selected ? '3.5' : '2';

  const svg = `
  <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow" x="0" y="0" width="44" height="54" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#22253F" flood-opacity="0.35"/>
    </filter>
    <g filter="url(#shadow)">
      <!-- Main Pin Body -->
      <path d="M22 2C11.5066 2 3 10.5066 3 21C3 34.5 19.8 45.8 20.9 46.5C21.5 46.9 22.5 46.9 23.1 46.5C24.2 45.8 41 34.5 41 21C41 10.5066 32.4934 2 22 2Z" 
            fill="${primaryColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <!-- Circular Core Badge in RUM SWIZZLE -->
      <circle cx="22" cy="20" r="12" fill="#F8F7E2"/>
      <!-- Michu Pharmacy Logo Mark in East Bay -->
      <path d="M19 12H25V14.5L22.8 17.2C22.4 17.7 22.2 18.3 22.2 19V21.5C22.2 22.3 21.5 23 20.7 23H19.3C18.5 23 17.8 22.3 17.8 21.5V19C17.8 18.3 17.6 17.7 17.2 17.2L15 14.5V12H19Z" fill="${selected ? '#22253F' : '#474C80'}"/>
      <circle cx="22" cy="20" r="2.2" fill="${selected ? '#474C80' : '#22253F'}"/>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function BranchGoogleMap({
  branches = BRANCH_LOCATIONS,
  selectedBranch = null,
  onSelectBranch,
  className = '',
  height = '480px',
  showBranchList = false,
  compact = false,
}: BranchGoogleMapProps) {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeBranch, setActiveBranch] = useState<BranchLocation>(selectedBranch || branches[0]);
  const [isGoogleMapLoaded, setIsGoogleMapLoaded] = useState<boolean>(false);
  const [mapLoadError, setMapLoadError] = useState<boolean>(false);
  const [infoPopupOpen, setInfoPopupOpen] = useState<boolean>(true);

  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  // Sync external selectedBranch changes
  useEffect(() => {
    if (selectedBranch && selectedBranch.id !== activeBranch?.id) {
      setActiveBranch(selectedBranch);
      setInfoPopupOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  // Handle branch selection
  const handleSelectBranch = useCallback((branch: BranchLocation) => {
    setActiveBranch(branch);
    setInfoPopupOpen(true);
    if (onSelectBranch) {
      onSelectBranch(branch);
    }

    // Pan map to location if Google Maps instance exists
    if (googleMapInstanceRef.current && window.google?.maps) {
      const targetPos = new window.google.maps.LatLng(branch.lat, branch.lng);
      googleMapInstanceRef.current.panTo(targetPos);
      googleMapInstanceRef.current.setZoom(14);

      // Open InfoWindow
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(createInfoWindowContent(branch));
        const marker = markersRef.current.find((m: any) => m.branchId === branch.id);
        if (marker) {
          infoWindowRef.current.open(googleMapInstanceRef.current, marker);
        }
      }
    }
  }, [onSelectBranch]);

  // InfoWindow HTML creator (Herb / Moss / Pearl / Radiate palette)
  const createInfoWindowContent = (branch: BranchLocation) => {
    const is24Hours = branch.is24Hours;
    return `
      <div style="padding: 12px 14px; font-family: system-ui, -apple-system, sans-serif; max-width: 275px; color: #22253F; background: #F8F7E2; border: 1px solid #CBD0E4; border-radius: 12px; box-shadow: 0 4px 12px rgba(34,37,63,0.15);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #474C80;">${branch.name}</h4>
          ${is24Hours ? '<span style="background: #474C80; color: #F8F7E2; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">24/7 OPEN</span>' : ''}
        </div>
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #4D5276; display: flex; align-items: flex-start; gap: 4px;">
          <span>📍</span> <span>${branch.address}, ${branch.city}</span>
        </p>
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #4D5276; display: flex; align-items: center; gap: 4px;">
          <span>⏰</span> <span>${branch.hours}</span>
        </p>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #474C80; font-weight: 700;">
          📞 <a href="tel:${branch.phone}" style="color: #474C80; text-decoration: none;">${branch.phone}</a>
        </p>
        <div style="display: flex; gap: 6px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}" 
             target="_blank" 
             rel="noopener noreferrer" 
             style="display: inline-block; flex: 1; text-align: center; background: #474C80; color: #F8F7E2; font-size: 11px; font-weight: 800; padding: 7px 12px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(71,76,128,0.3);">
            Get Directions ↗
          </a>
        </div>
      </div>
    `;
  };

  // Google Maps SDK Loader and Init
  useEffect(() => {
    let isMounted = true;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Graceful fallback to rich interactive map view
      setIsGoogleMapLoaded(false);
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) initMap();
        };
        script.onerror = () => {
          if (isMounted) setMapLoadError(true);
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => {
          if (isMounted) initMap();
        });
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || !window.google?.maps) return;

      const centerPos = { lat: activeBranch?.lat || 9.02, lng: activeBranch?.lng || 38.76 };
      
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: centerPos,
        zoom: 12,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'poi.medical', stylers: [{ visibility: 'on' }, { color: '#e8f5e9' }] },
          { featureType: 'water', stylers: [{ color: '#cce5ff' }] },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      googleMapInstanceRef.current = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Create Markers for all branches
      markersRef.current = branches.map((branch) => {
        const isSel = branch.id === activeBranch?.id;
        const marker = new window.google.maps.Marker({
          position: { lat: branch.lat, lng: branch.lng },
          map,
          title: branch.name,
          icon: {
            url: createBrandedPinSvg(isSel),
            scaledSize: new window.google.maps.Size(isSel ? 44 : 38, isSel ? 54 : 46),
            anchor: new window.google.maps.Point(22, 48),
          },
        });

        marker.branchId = branch.id;

        marker.addListener('click', () => {
          handleSelectBranch(branch);
        });

        return marker;
      });

      setIsGoogleMapLoaded(true);
    };

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  // Update marker icons when activeBranch changes in Google Maps mode
  useEffect(() => {
    if (googleMapInstanceRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker: any) => {
        const isSel = marker.branchId === activeBranch?.id;
        marker.setIcon({
          url: createBrandedPinSvg(isSel),
          scaledSize: new window.google.maps.Size(isSel ? 46 : 36, isSel ? 56 : 44),
          anchor: new window.google.maps.Point(22, 48),
        });
        marker.setZIndex(isSel ? 100 : 1);
      });
    }
  }, [activeBranch]);

  // Fallback map calculations for interactive canvas
  // Bounds of all branches
  const bounds = useMemo(() => {
    const lats = branches.map(b => b.lat);
    const lngs = branches.map(b => b.lng);
    return {
      minLat: Math.min(...lats) - 0.4,
      maxLat: Math.max(...lats) + 0.4,
      minLng: Math.min(...lngs) - 0.5,
      maxLng: Math.max(...lngs) + 0.5,
    };
  }, [branches]);

  const getPositionPercent = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // Invert y because higher latitude is North (top)
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(10, Math.min(90, y)) };
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-lg ${className}`}>
      {/* Container */}
      <div className="relative w-full flex flex-col" style={{ minHeight: height }}>
        
        {/* Google Maps Container DOM Target */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full absolute inset-0 ${isGoogleMapLoaded ? 'block' : 'hidden'}`}
          style={{ minHeight: height }}
        />

        {/* Interactive Fallback Map (Using Herb, Moss, Pearl, Radiate, Gleam palette) */}
        {!isGoogleMapLoaded && (
          <div className="relative w-full flex-1 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-moss-950/10 via-pearl-100/40 to-herb-100/30 p-4 sm:p-6" style={{ minHeight: height }}>
            {/* Top Toolbar / Badge */}
            <div className="relative z-20 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pearl/95 backdrop-blur-md border border-herb-200 shadow-sm text-xs font-bold text-moss-900">
                <span className="w-2.5 h-2.5 rounded-full bg-radiate animate-pulse" />
                <span>Michu Live Network · {branches.length} Branches</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/Michu+Pharmacy+Addis+Ababa`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pearl/90 hover:bg-pearl text-moss-900 hover:text-radiate-700 text-xs font-bold border border-herb-300/60 shadow-xs transition"
                >
                  <span>Open in Google Maps</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Simulated Regional Geographic Backdrop */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD0E4" strokeWidth="0.75" strokeDasharray="3 3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Connecting routes between Addis Ababa and regional hubs */}
                <path d="M 32% 42% Q 40% 55% 48% 68%" fill="none" stroke="#474C80" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.6"/>
                <path d="M 32% 42% Q 60% 32% 82% 26%" fill="none" stroke="#7A83B8" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
              </svg>
            </div>

            {/* Interactive Pins on Visual Canvas */}
            <div className="absolute inset-0 z-10">
              {branches.map((b) => {
                const isSelected = activeBranch?.id === b.id;
                const pos = getPositionPercent(b.lat, b.lng);

                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBranch(b)}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -100%)',
                    }}
                    className={`absolute group cursor-pointer focus:outline-none transition-all duration-300 ${
                      isSelected ? 'z-30 scale-115' : 'z-20 hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    aria-label={`Branch: ${b.name}`}
                  >
                    {/* Branded Pin Marker */}
                    <div className="relative flex flex-col items-center">
                      <div className={`p-1 rounded-2xl shadow-xl transition-transform ${
                        isSelected 
                          ? 'bg-radiate ring-4 ring-gleam/80 ring-offset-2' 
                          : 'bg-pearl border border-herb-300 shadow-md'
                      }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold transition shadow-inner ${
                          isSelected ? 'bg-moss-900 text-gleam' : 'bg-herb-500 text-pearl group-hover:bg-herb-600'
                        }`}>
                          {/* Pharmacy Flask Icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                      </div>

                      {/* Pin Pointer Tail */}
                      <div className={`w-2.5 h-2.5 -mt-1 rotate-45 ${isSelected ? 'bg-radiate' : 'bg-pearl'}`} />

                      {/* Branch Label Badge */}
                      <div className={`mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold whitespace-nowrap shadow-sm transition border ${
                        isSelected 
                          ? 'bg-moss-900 text-pearl border-moss-950 scale-105' 
                          : 'bg-pearl text-moss-900 border-herb-300 group-hover:border-herb-500'
                      }`}>
                        {b.name.replace(' Branch', '')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Info Popup Overlay for Active Branch */}
            {activeBranch && infoPopupOpen && (
              <div className="relative z-30 self-start sm:max-w-xs w-full mt-auto bg-pearl/95 backdrop-blur-md border-2 border-herb-300 rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-radiate" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-moss-900">
                        {activeBranch.city}
                      </span>
                      {activeBranch.is24Hours && (
                        <span className="bg-moss-900 text-gleam text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-gleam/40">
                          24/7 Open
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-moss-900 leading-snug">
                      {activeBranch.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setInfoPopupOpen(false)}
                    className="text-stone-400 hover:text-moss-900 p-1 text-sm leading-none"
                    aria-label="Close popup"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2.5 space-y-1.5 text-xs text-stone-700">
                  <p className="flex items-center gap-1.5">
                    <span className="shrink-0 text-herb-600">📍</span>
                    <span className="truncate">{activeBranch.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="shrink-0 text-herb-600">⏰</span>
                    <span>{activeBranch.hours}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold text-moss-900">
                    <span className="shrink-0">📞</span>
                    <a href={`tel:${activeBranch.phone}`} className="hover:underline text-herb-700">{activeBranch.phone}</a>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-herb-200/60 flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeBranch.lat},${activeBranch.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-radiate hover:bg-radiate-600 active:scale-95 text-white font-extrabold text-xs transition shadow-sm shadow-radiate/30"
                  >
                    Get Directions ↗
                  </a>
                  <a
                    href={`tel:${activeBranch.phone}`}
                    className="py-2 px-3 rounded-xl bg-pearl-300/80 hover:bg-pearl-400 text-moss-900 font-bold text-xs transition"
                  >
                    Call
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Branch Pill Selector Toolbar */}
      {showBranchList && (
        <div className="p-3 bg-pearl-50 border-t border-herb-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-moss-800 uppercase tracking-wider pl-2 shrink-0">
            Quick Select:
          </span>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelectBranch(b)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeBranch?.id === b.id
                  ? 'bg-moss-900 text-pearl shadow-sm ring-2 ring-radiate'
                  : 'bg-pearl border border-herb-200 hover:bg-pearl-200 text-moss-900'
              }`}
            >
              <span>{b.name.replace(' Branch', '')}</span>
              {b.is24Hours && (
                <span className={`text-[9px] px-1 rounded ${activeBranch?.id === b.id ? 'bg-radiate text-white' : 'bg-gleam text-moss-900'}`}>
                  24/7
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
