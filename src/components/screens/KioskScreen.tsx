import { useState, useMemo, useCallback, useEffect } from 'react';
import { Mic, ChevronDown } from 'lucide-react';
import type { Category, Location, VoiceState } from '../../types';
import { locations, CATEGORY_META } from '../../data/locations';
import { CategorySidebar } from '../ui/CategorySidebar';
import { LocationCard } from '../ui/LocationCard';
import { SearchBar } from '../ui/SearchBar';
import { VoicePanel } from '../ui/VoicePanel';
import { LocationDetail } from '../ui/LocationDetail';
import { TopBar } from '../ui/TopBar';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { processVoiceCommand } from '../../utils/voiceCommands';
import { cn } from '../../utils/cn';

interface KioskScreenProps {
  onIdle?: () => void;
}

export const KioskScreen: React.FC<KioskScreenProps> = () => {
  // ── State ────────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [showVoicePanel, setShowVoicePanel] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [savedLocationIds, setSavedLocationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saved_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Hooks ────────────────────────────────────────────────────────────────
  const { playTap, playVoiceStart, playVoiceStop, playSuccess } = useSoundEffects();
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis({ rate: 0.92 });

  const handleVoiceTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      setLiveTranscript(transcript);
      if (isFinal) {
        setVoiceState('processing');
        // Short delay to show "processing" state
        setTimeout(() => {
          const command = processVoiceCommand(transcript);
          if (command) {
            // Dispatch the action
            const action = command.action;
            if (action.type === 'SET_CATEGORY') setActiveCategory(action.payload as Category);
            if (action.type === 'SET_SEARCH') {
              setSearchQuery(action.payload as string);
              setActiveCategory('All');
            }
            if (action.type === 'SELECT_LOCATION') setSelectedLocation(action.payload as Location | null);
            if (action.type === 'SET_VOICE_MESSAGE') setVoiceMessage(action.payload as string);

            // TTS feedback
            setVoiceState('speaking');
            setVoiceMessage(command.feedback);
            speak(command.feedback, {
              onEnd: () => setVoiceState('idle'),
              onError: () => setVoiceState('idle'),
            });
            playSuccess();
          } else {
            setVoiceState('idle');
          }
        }, 400);
      }
    },
    [speak, playSuccess]
  );

  const handleVoiceEnd = useCallback(() => {
    if (voiceState === 'listening') {
      setVoiceState('idle');
      playVoiceStop();
    }
  }, [voiceState, playVoiceStop]);

  const handleVoiceError = useCallback((error: string) => {
    setVoiceMessage(error);
    setVoiceState('idle');
    playVoiceStop();
  }, [playVoiceStop]);

  const { start: startRecognition, stop: stopRecognition, isSupported } =
    useSpeechRecognition({
      onTranscript: handleVoiceTranscript,
      onEnd: handleVoiceEnd,
      onError: handleVoiceError,
    });

  // ── Clock ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Filtered locations ───────────────────────────────────────────────────
  const filteredLocations = useMemo(() => {
    let result = [...locations];

    if (activeCategory !== 'All') {
      result = result.filter((l) => l.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.shortDesc.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.subCategory.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  // ── Featured on All tab ──────────────────────────────────────────────────
  const featuredLocations = useMemo(
    () => filteredLocations.filter((l) => l.featured || savedLocationIds.includes(l.id)),
    [filteredLocations, savedLocationIds]
  );
  const regularLocations = useMemo(
    () =>
      activeCategory === 'All' && !searchQuery
        ? filteredLocations.filter((l) => !l.featured && !savedLocationIds.includes(l.id))
        : filteredLocations,
    [filteredLocations, activeCategory, searchQuery, savedLocationIds]
  );

  // ── Voice toggle ─────────────────────────────────────────────────────────
  const handleToggleListening = useCallback(() => {
    if (voiceState === 'listening') {
      stopRecognition();
      setVoiceState('idle');
      playVoiceStop();
    } else if (voiceState === 'idle') {
      cancelSpeech();
      setLiveTranscript('');
      setVoiceMessage('');
      startRecognition();
      setVoiceState('listening');
      playVoiceStart();
    }
  }, [voiceState, startRecognition, stopRecognition, cancelSpeech, playVoiceStart, playVoiceStop]);

  const handleTap = useCallback(() => {
    playTap();
  }, [playTap]);

  const handleReadAloud = useCallback(
    (text: string) => {
      setVoiceState('speaking');
      setShowVoicePanel(true);
      speak(text, {
        onEnd: () => setVoiceState('idle'),
        onError: () => setVoiceState('idle'),
      });
    },
    [speak]
  );

  const activeMeta = CATEGORY_META[activeCategory];

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <TopBar currentTime={currentTime} city="Nova Crest" />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CategorySidebar
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          onTap={handleTap}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content header */}
          <div className="px-6 pt-5 pb-4 space-y-4
            bg-slate-950/80 border-b border-white/5">

            {/* Page heading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeMeta.icon}</span>
                <div>
                  <h2 className="text-white font-black text-2xl leading-none">
                    {activeCategory === 'All' ? 'Explore Nova Crest' : activeCategory}
                  </h2>
                  <p className="text-white/40 text-sm mt-0.5">
                    {searchQuery
                      ? `${filteredLocations.length} results for "${searchQuery}"`
                      : activeMeta.description}
                  </p>
                </div>
              </div>

              {/* Voice activate button (compact) */}
              {!showVoicePanel && (
                <button
                  onClick={() => {
                    handleTap();
                    setShowVoicePanel(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                    bg-red-500/15 border border-red-400/30 text-red-400
                    hover:bg-red-500/25 transition-colors"
                >
                  <Mic size={16} />
                  <span className="text-sm font-semibold">Voice</span>
                </button>
              )}
            </div>

            {/* Search */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              onTap={handleTap}
              resultCount={filteredLocations.length}
            />
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 overflow-y-auto px-6 py-5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

            {filteredLocations.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <span className="text-7xl opacity-30">🔍</span>
                <p className="text-white/40 text-xl font-semibold">No results found</p>
                <p className="text-white/25 text-base">
                  Try a different search or category
                </p>
                <button
                  onClick={() => {
                    handleTap();
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20
                    text-white font-medium hover:bg-white/15 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Featured section */}
                {activeCategory === 'All' && !searchQuery && featuredLocations.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-400 text-lg">⭐</span>
                      <h3 className="text-white/70 text-sm font-bold uppercase tracking-widest">
                        Featured
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                      {featuredLocations.map((loc) => (
                        <LocationCard
                          key={loc.id}
                          location={loc}
                          onSelect={setSelectedLocation}
                          onTap={handleTap}
                          featured
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* All / filtered results */}
                {activeCategory === 'All' && regularLocations.length > 0 && (
                  <section>
                    {!searchQuery && (
                      <div className="flex items-center gap-2 mb-3">
                        <ChevronDown size={16} className="text-white/40" />
                        <h3 className="text-white/70 text-sm font-bold uppercase tracking-widest">
                          All Locations
                        </h3>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                      {regularLocations.map((loc) => (
                        <LocationCard
                          key={loc.id}
                          location={loc}
                          onSelect={setSelectedLocation}
                          onTap={handleTap}
                          featured={loc.featured}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Filtered results (category active) */}
                {activeCategory !== 'All' && filteredLocations.length > 0 && (
                  <section>
                    <div className={cn(
                      'flex items-center gap-2 mb-3',
                    )}>
                      <span className="text-lg">{activeMeta.icon}</span>
                      <h3 className="text-white/70 text-sm font-bold uppercase tracking-widest">
                        {filteredLocations.length} {activeCategory} {filteredLocations.length === 1 ? 'Location' : 'Locations'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                      {filteredLocations.map((loc) => (
                        <LocationCard
                          key={loc.id}
                          location={loc}
                          onSelect={setSelectedLocation}
                          onTap={handleTap}
                          featured={loc.featured}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Voice Panel */}
      {showVoicePanel && (
        <VoicePanel
          voiceState={voiceState}
          transcript={liveTranscript}
          voiceMessage={voiceMessage}
          isSupported={isSupported}
          onToggleListening={handleToggleListening}
          onDismiss={() => {
            handleTap();
            setShowVoicePanel(false);
            if (voiceState === 'listening') {
              stopRecognition();
              setVoiceState('idle');
            }
          }}
        />
      )}

      {/* Floating voice FAB when panel is hidden */}
      {!showVoicePanel && (
        <button
          onClick={() => {
            handleTap();
            setShowVoicePanel(true);
          }}
          aria-label="Open voice assistant"
          className={cn(
            'fixed bottom-6 right-6 z-40',
            'w-16 h-16 rounded-2xl shadow-2xl shadow-black/50',
            'flex items-center justify-center',
            'bg-gradient-to-br from-red-500 to-rose-600',
            'border-2 border-red-400/40',
            'transition-all duration-200 active:scale-95',
            'ring-4 ring-red-400/20'
          )}
        >
          <Mic size={26} className="text-white" />
        </button>
      )}

      {/* Location detail modal */}
      {selectedLocation && (
        <LocationDetail
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onTap={handleTap}
          onSpeak={handleReadAloud}
          onSaveChange={(id, isSaved) => {
            setSavedLocationIds((prev) => 
              isSaved ? [...prev, id] : prev.filter((savedId) => savedId !== id)
            );
          }}
        />
      )}
    </div>
  );
};
