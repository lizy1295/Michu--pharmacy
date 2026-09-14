'use client';

import React, { useState } from 'react';
import { useTheme, THEMES, ThemeId } from '@/context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="Theme Preview Switcher"
      className="fixed bottom-6 left-6 z-[9999] font-sans select-none"
    >
      {/* Collapsed Toggle Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-black text-white text-xs font-bold shadow-xl hover:shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 group"
          title="Open Color Theme Switcher"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-400 flex items-center justify-center p-0.5 shadow-xs group-hover:rotate-12 transition-transform">
            <svg className="w-3.5 h-3.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
          </div>
          <span className="tracking-wide">Theme</span>
          <span
            className="flex h-3 w-3 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: THEMES.find(t => t.id === theme)?.primary || '#474C80' }}
          />
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white/90 uppercase tracking-widest font-mono">
            {`T${theme.replace('theme-', '')}`}
          </span>
        </button>
      )}

      {/* Expanded Theme Selection Modal Card */}
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 animate-in zoom-in-95 duration-200 text-neutral-900 dark:text-white">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🎨</span>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider">Color Palette Switcher</h2>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Temporary Testing Preview</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              aria-label="Close theme switcher"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Theme Option Cards */}
          <div className="space-y-2.5">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800/80 shadow-sm ring-1 ring-neutral-900 dark:ring-white'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch Previews */}
                    <div
                      className="w-10 h-10 rounded-xl border border-black/10 shadow-inner flex items-center justify-center relative overflow-hidden shrink-0"
                      style={{ backgroundColor: t.background }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm"
                        style={{ backgroundColor: t.primary }}
                      />
                    </div>

                    {/* Text Labels */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold truncate">{t.name}</span>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 truncate">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Radio / Check Circle */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white text-xs font-bold'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {isSelected && '✓'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Notice */}
          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400 leading-snug">
            💡 Choice is saved locally. Once finalized, this switcher will be removed and your choice made permanent.
          </div>
        </div>
      )}
    </aside>
  );
}
