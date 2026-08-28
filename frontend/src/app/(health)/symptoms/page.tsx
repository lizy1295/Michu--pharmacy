'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CHRONIC_CONDITIONS,
  RED_FLAG_KEYWORDS,
  QUICK_SYMPTOM_TAGS,
  ChronicCondition,
  RedFlagAlert
} from '@/lib/data/symptomData';
import {
  searchSymptomDatabase,
  SymptomSearchResult,
  MatchedSymptomTrigger
} from '@/lib/search/symptomSearch';
import { DisclaimerModal } from '@/components/symptoms/DisclaimerModal';
import { EmergencyBanner } from '@/components/symptoms/EmergencyBanner';
import { AskPharmacistCTA } from '@/components/symptoms/AskPharmacistCTA';
import { MedicalDisclaimerFooter } from '@/components/symptoms/MedicalDisclaimerFooter';

const SESSION_STORAGE_KEY = 'mph_symptom_disclaimer_ack';

function SymptomCheckerContent() {
  const searchParams = useSearchParams();

  // Disclaimer Gate State
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedConditionId, setSelectedConditionId] = useState<string>(CHRONIC_CONDITIONS[0].id);
  const [activeConditionTab, setActiveConditionTab] = useState<'overview' | 'symptoms' | 'doctor' | 'pharmacist' | 'citations'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    setIsClientLoaded(true);
    try {
      const ack = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (ack === 'true') {
        setIsDisclaimerAccepted(true);
        setIsDisclaimerOpen(false);
      } else {
        setIsDisclaimerAccepted(false);
        setIsDisclaimerOpen(true);
      }
    } catch {
      // Fallback if sessionStorage is disabled or restricted
      setIsDisclaimerOpen(true);
    }
  }, []);

  // Handle URL query parameters if present (e.g. ?condition=diabetes-mellitus-type-2 or ?symptom=chest%20pain)
  useEffect(() => {
    const conditionParam = searchParams.get('condition');
    const queryParam = searchParams.get('q') || searchParams.get('symptom');

    if (conditionParam) {
      const found = CHRONIC_CONDITIONS.find(c => c.id === conditionParam);
      if (found) {
        setSelectedConditionId(found.id);
      }
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  // Handle Disclaimer acceptance
  const handleAcceptDisclaimer = () => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsDisclaimerAccepted(true);
    setIsDisclaimerOpen(false);
  };

  // Re-open disclaimer modal (manual review)
  const handleReviewDisclaimer = () => {
    setIsDisclaimerOpen(true);
  };

  // 1. Red-Flag Keyword Detection (Runs FIRST to short-circuit emergency terms)
  const detectedRedFlag: RedFlagAlert | null = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const cleanQuery = searchQuery.toLowerCase().trim();

    // Check against all registered red flag keywords
    for (const item of RED_FLAG_KEYWORDS) {
      const kw = item.keyword.toLowerCase();
      // Match exact substring or word boundary
      if (cleanQuery.includes(kw) || kw.includes(cleanQuery) && cleanQuery.length >= 4) {
        return item;
      }
    }
    return null;
  }, [searchQuery]);

  // 2. Fuzzy Symptom Search with Typo-Tolerance and Relevance Ranking
  const searchResults: SymptomSearchResult[] = useMemo(() => {
    // If red-flag detected, short circuit
    if (detectedRedFlag) return [];

    return searchSymptomDatabase(searchQuery, CHRONIC_CONDITIONS, selectedCategory);
  }, [searchQuery, selectedCategory, detectedRedFlag]);

  // Auto-sync selected condition with the top search result when query changes
  useEffect(() => {
    if (searchResults.length > 0 && searchQuery.trim()) {
      setSelectedConditionId(searchResults[0].condition.id);
    }
  }, [searchResults, searchQuery]);

  // Currently selected condition
  const selectedResult: SymptomSearchResult | undefined = useMemo(() => {
    const found = searchResults.find(r => r.condition.id === selectedConditionId);
    return found || searchResults[0];
  }, [selectedConditionId, searchResults]);

  const selectedCondition: ChronicCondition = useMemo(() => {
    if (selectedResult) return selectedResult.condition;
    const fallback = CHRONIC_CONDITIONS.find(c => c.id === selectedConditionId);
    return fallback || CHRONIC_CONDITIONS[0];
  }, [selectedResult, selectedConditionId]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(CHRONIC_CONDITIONS.map(c => c.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Quick tag selection handler
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  // Copy shareable condition link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/symptoms?condition=${selectedCondition.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Mandatory Disclaimer Gate Modal */}
      {isClientLoaded && (
        <DisclaimerModal
          isOpen={isDisclaimerOpen}
          onAccept={handleAcceptDisclaimer}
          onClose={() => setIsDisclaimerOpen(false)}
          isMandatoryGate={!isDisclaimerAccepted}
        />
      )}

      {/* 2. Hero & Fuzzy Search Header Section */}
      <section className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 relative overflow-hidden border-b border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>

        <div className="mx-auto max-w-6xl relative z-10 space-y-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <span>🛡️ EFDA-Aligned Clinical Resource</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            <span>Intelligent Fuzzy Symptom Search</span>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Symptom Guide & Chronic Conditions Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Search by symptoms, phrase fragments, or typos (e.g. <em>&ldquo;weezing&rdquo;</em>, <em>&ldquo;diabtes&rdquo;</em>, <em>&ldquo;thirsty&rdquo;</em>, <em>&ldquo;joint stifness&rdquo;</em>). View ranked conditions and the exact triggering symptoms.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative group">
              <input
                id="symptom-search-input"
                type="text"
                disabled={!isDisclaimerAccepted}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isDisclaimerAccepted
                    ? 'Search symptoms or conditions (e.g. weezing, frequent thirst, joint pain)...'
                    : 'Please accept disclaimer gate to unlock search...'
                }
                className={`w-full rounded-2xl border-2 py-4 pl-12 pr-12 text-sm sm:text-base font-medium shadow-2xl transition focus:outline-none ${
                  isDisclaimerAccepted
                    ? 'border-emerald-500/50 bg-slate-900/90 text-white placeholder-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20'
                    : 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                }`}
              />
              <svg
                className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Symptom Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Select:
              </span>
              {QUICK_SYMPTOM_TAGS.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  disabled={!isDisclaimerAccepted}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-emerald-400/40'
                  } ${!isDisclaimerAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Workspace / Search Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 space-y-8">
        {/* Gate Overlay Notice if not yet accepted */}
        {!isDisclaimerAccepted && isClientLoaded && (
          <div className="p-6 rounded-3xl bg-amber-50 border-2 border-dashed border-amber-300 text-center space-y-3 shadow-sm">
            <span className="text-3xl">🔒</span>
            <h3 className="text-lg font-bold text-amber-950">
              Disclaimer Gate Required
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 max-w-xl mx-auto">
              For your safety and in compliance with healthcare education guidelines, you must acknowledge the medical disclaimer before accessing condition lookup and symptom assessment tools.
            </p>
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
            >
              Open Medical Disclaimer Gate
            </button>
          </div>
        )}

        {/* 4. RED FLAG EMERGENCY BANNER (If acute keyword detected) */}
        {detectedRedFlag && (
          <EmergencyBanner
            alert={detectedRedFlag}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

        {/* 5. FUZZY SEARCH RESULTS & CONDITION VIEW (Hidden when red flag triggered) */}
        {!detectedRedFlag && (
          <div className={`space-y-8 transition-opacity duration-300 ${!isDisclaimerAccepted ? 'opacity-40 pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>
            
            {/* Category Filter Pills & Search Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-500 shrink-0">
                {searchQuery.trim() ? (
                  <span>
                    Found <strong className="text-emerald-700">{searchResults.length}</strong> matching conditions for &ldquo;{searchQuery}&rdquo; (Ranked by relevance)
                  </span>
                ) : (
                  <span>
                    Showing <strong className="text-slate-800">{searchResults.length}</strong> chronic conditions
                  </span>
                )}
              </div>
            </div>

            {/* Condition Explorer: Master-Detail Layout with Matched Trigger Symptoms */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Ranked Condition List / Selector Cards (4 cols) */}
                <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                    <span>{searchQuery.trim() ? 'Relevance Ranking' : 'Select Condition'}</span>
                    {searchQuery.trim() && <span className="text-emerald-600 font-bold">Fuzzy Matched</span>}
                  </div>
                  
                  {searchResults.map((result, idx) => {
                    const condition = result.condition;
                    const isSelected = selectedCondition?.id === condition.id;

                    return (
                      <button
                        key={condition.id}
                        onClick={() => setSelectedConditionId(condition.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition duration-200 flex flex-col gap-2.5 relative ${
                          isSelected
                            ? 'bg-white border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                            : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        {/* Relevance Rank Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{condition.categoryIcon}</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {condition.category}
                            </span>
                          </div>

                          {searchQuery.trim() && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {result.relevancePercentage}% Match #{idx + 1}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className={`font-bold text-sm leading-tight ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                            {condition.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {condition.summary}
                          </p>
                        </div>

                        {/* Specific Triggering Symptom(s) display */}
                        {searchQuery.trim() && result.matchedSymptoms.length > 0 ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1 mt-0.5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <span>⚡</span>
                              <span>Triggered by Symptoms ({result.matchedSymptoms.length}):</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {result.matchedSymptoms.slice(0, 3).map((match, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] bg-white text-emerald-900 font-semibold px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs"
                                >
                                  {match.symptomName}
                                </span>
                              ))}
                              {result.matchedSymptoms.length > 3 && (
                                <span className="text-[9px] text-emerald-700 font-bold self-center">
                                  +{result.matchedSymptoms.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Default common symptoms pills */
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {condition.commonSymptoms.slice(0, 3).map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Structured Detailed View (8 cols) */}
                {selectedCondition && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Main Condition Header Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                      
                      {/* Top Header & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{selectedCondition.categoryIcon}</span>
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                              {selectedCondition.category}
                            </span>
                            {selectedResult && searchQuery.trim() && (
                              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                                {selectedResult.relevancePercentage}% Relevance Match
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {selectedCondition.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                            <span className="font-semibold text-slate-600">Also known as:</span>
                            {selectedCondition.aliases.map((alias, idx) => (
                              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium text-[11px]">
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Share / Print Controls */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={handleShare}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition text-xs font-bold flex items-center gap-1.5"
                            title="Share Condition Guide"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition text-xs font-bold flex items-center gap-1.5"
                            title="Print Guide"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print</span>
                          </button>
                        </div>
                      </div>

                      {/* Matched Symptom Highlights Card if searched */}
                      {searchQuery.trim() && selectedResult && selectedResult.matchedSymptoms.length > 0 && (
                        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                              <span>🎯</span>
                              <span>Matched Symptoms for &ldquo;{searchQuery}&rdquo;:</span>
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700">
                              {selectedResult.matchedSymptoms.length} matching factor(s)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {selectedResult.matchedSymptoms.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="p-2.5 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-800 space-y-0.5 shadow-2xs"
                              >
                                <div className="font-bold text-emerald-950 flex items-center justify-between">
                                  <span>{m.symptomName}</span>
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    {m.matchType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {m.matchedText}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Navigation Tabs for Structured Info */}
                      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
                        {[
                          { id: 'overview', label: '1. Overview & Biology', icon: '📖' },
                          { id: 'symptoms', label: '2. Common Symptoms', icon: '🩺' },
                          { id: 'doctor', label: '3. When to See a Doctor', icon: '🚨' },
                          { id: 'pharmacist', label: '4. Pharmacist & Rx Guide', icon: '💊' },
                          { id: 'citations', label: '5. Source Citations', icon: '📚' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveConditionTab(tab.id as any)}
                            className={`pb-3 px-3 text-xs sm:text-sm font-extrabold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                              activeConditionTab === tab.id
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Tab 1: Overview & Pathophysiology */}
                      {activeConditionTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="space-y-3">
                            <h3 className="text-base font-bold text-slate-900">Clinical Overview</h3>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {selectedCondition.overview}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                              What Happens in the Body (Pathophysiology)
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {selectedCondition.pathophysiology}
                            </p>
                          </div>

                          {/* Lifestyle & Self-Care Highlights */}
                          <div className="space-y-3">
                            <h3 className="text-base font-bold text-slate-900">Recommended Self-Care & Lifestyle Measures</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedCondition.lifestyleAndSelfCare.map((tip, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                                >
                                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Common Symptoms */}
                      {activeConditionTab === 'symptoms' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">
                              Recognized Common Symptoms ({selectedCondition.commonSymptoms.length})
                            </h3>
                            <span className="text-xs text-slate-400">
                              Categorized by physiological system
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {selectedCondition.commonSymptoms.map((symptom, idx) => {
                              const isDirectMatch = selectedResult?.matchedSymptoms.some(
                                m => m.symptomName.toLowerCase().includes(symptom.name.toLowerCase()) || symptom.name.toLowerCase().includes(m.symptomName.toLowerCase())
                              );

                              return (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-2xl border transition space-y-2 ${
                                    isDirectMatch
                                      ? 'bg-emerald-50/90 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      {isDirectMatch && <span className="text-emerald-600 font-bold">🎯</span>}
                                      <h4 className={`font-bold text-sm ${isDirectMatch ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                                        {symptom.name}
                                      </h4>
                                    </div>
                                    {symptom.severity && (
                                      <span
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                          symptom.severity === 'severe'
                                            ? 'bg-red-100 text-red-700'
                                            : symptom.severity === 'moderate'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                      >
                                        {symptom.severity}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {symptom.description}
                                  </p>
                                  {symptom.category && (
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                      Domain: {symptom.category}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tab 3: When to See a Doctor */}
                      {activeConditionTab === 'doctor' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                              Clinical Escalation & Doctor-Visit Guidance
                            </h3>
                            <p className="text-xs text-slate-500">
                              Understand when routine evaluation is sufficient vs. when immediate urgent evaluation is necessary.
                            </p>
                          </div>

                          <div className="space-y-3.5">
                            {selectedCondition.whenToSeeDoctor.map((trigger, idx) => (
                              <div
                                key={idx}
                                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 ${
                                  trigger.urgency === 'emergency'
                                    ? 'bg-red-50/80 border-red-200 text-red-950'
                                    : trigger.urgency === 'prompt'
                                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                                    : 'bg-blue-50/80 border-blue-200 text-blue-950'
                                }`}
                              >
                                <span className="text-2xl shrink-0 mt-0.5">
                                  {trigger.urgency === 'emergency'
                                    ? '🚨'
                                    : trigger.urgency === 'prompt'
                                    ? '⚠️'
                                    : '🩺'}
                                </span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        trigger.urgency === 'emergency'
                                          ? 'bg-red-600 text-white'
                                          : trigger.urgency === 'prompt'
                                          ? 'bg-amber-500 text-slate-950 font-bold'
                                          : 'bg-blue-600 text-white'
                                      }`}
                                    >
                                      {trigger.urgency.toUpperCase()}
                                    </span>
                                    <h4 className="font-bold text-sm sm:text-base">
                                      {trigger.title}
                                    </h4>
                                  </div>
                                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                                    {trigger.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Critical Red-Flag Triggers Box */}
                          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                              <span>⚠️</span> Critical Red-Flag Triggers for this Condition:
                            </h4>
                            <ul className="list-disc list-inside text-xs text-rose-800 space-y-1">
                              {selectedCondition.emergencyTriggers.map((trig, idx) => (
                                <li key={idx}>{trig}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Pharmacist Guidance & Medication Classes */}
                      {activeConditionTab === 'pharmacist' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                              Pharmacist Safety Guidance & Counseling Tips
                            </h3>
                            <p className="text-xs text-slate-500">
                              Essential medication administration notes from Michu Pharmacy clinical specialists.
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            {selectedCondition.pharmacistGuidance.map((guide, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-start gap-3 text-xs sm:text-sm text-emerald-950 font-medium"
                              >
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{guide}</span>
                              </div>
                            ))}
                          </div>

                          {/* Prescribed Drug Classes */}
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Common Prescribed Drug Classes
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedCondition.commonMedicationClasses.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                                >
                                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                                    {med.name}
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    {med.purpose}
                                  </p>
                                  <div className="text-[11px] font-semibold text-emerald-700 pt-0.5">
                                    Examples: {med.example}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 text-xs flex items-center justify-between gap-3">
                            <span>
                              Looking for medication availability at Michu Pharmacy branches?
                            </span>
                            <Link
                              href="/products"
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-emerald-700 transition shrink-0"
                            >
                              Search Pharmacy Catalog &rarr;
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Tab 5: Source Citations */}
                      {activeConditionTab === 'citations' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">
                              Accredited Medical Source Citations & References
                            </h3>
                            <p className="text-xs text-slate-500">
                              All symptom data and clinical guidance are strictly referenced from recognized international healthcare guidelines and national authorities.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {selectedCondition.sourceCitations.map((cite, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {cite.organization}
                                  </span>
                                  {cite.year && (
                                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                      {cite.year}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-slate-800">
                                  {cite.title}
                                </p>
                                {cite.notes && (
                                  <p className="text-slate-500 text-[11px]">
                                    {cite.notes}
                                  </p>
                                )}
                                {cite.url && (
                                  <a
                                    href={cite.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] hover:underline pt-1"
                                  >
                                    <span>Access Official Guideline Source</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Persistent "Ask a Pharmacist" CTA for the Active Condition */}
                    <AskPharmacistCTA conditionName={selectedCondition.name} variant="banner" />

                    {/* Persistent Medical Disclaimer Footer underneath Active Health Info */}
                    <MedicalDisclaimerFooter onOpenModal={handleReviewDisclaimer} />

                  </div>
                )}
              </div>
            ) : (
              /* Fallback when NO conditions match: Direct to "Ask a Pharmacist" CTA */
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-emerald-100 shadow-md space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl mx-auto border border-emerald-200/80 shadow-inner">
                    👨‍⚕️
                  </div>
                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      No Exact Condition Matches Found for &ldquo;{searchQuery}&rdquo;
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Your symptoms might be unique, multi-factorial, or require specialized clinical review. Rather than guessing, our licensed Michu clinical pharmacists are on standby to assess your health concerns in detail.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/health?action=consult"
                      className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>💬</span>
                      <span>Ask a Pharmacist Online (Free)</span>
                    </Link>

                    <a
                      href="tel:0904040364"
                      className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
                    >
                      <span>📞</span>
                      <span>Call Pharmacist (0904040364 / 0931325959)</span>
                    </a>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
                    >
                      Browse All 10 Conditions
                    </button>
                  </div>
                </div>

                {/* Persistent Ask Pharmacist CTA Card */}
                <AskPharmacistCTA variant="banner" />

                {/* Persistent Disclaimer Footer */}
                <MedicalDisclaimerFooter onOpenModal={handleReviewDisclaimer} />
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

export default function SymptomInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading symptom database...</div>}>
      <SymptomCheckerContent />
    </Suspense>
  );
}
