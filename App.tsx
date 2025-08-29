import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GameState, LeaderboardCategory, LeaderboardEntry, Achievement, Boost } from './types';
import { INITIAL_GENERATORS, INITIAL_UPGRADES, REBIRTH_COST, POINTS_PER_GEM, PRESTIGE_COST_BASE, PRESTIGE_COST_SCALING, PRESTIGE_BONUS_PER_LEVEL } from './constants';
import { ACHIEVEMENTS } from './achievements';
import Header from './components/Header';
import MainClicker from './components/MainClicker';
import SettingsModal from './components/SettingsModal';
import Leaderboard from './components/Leaderboard';
import Navigation from './components/Navigation';
import GeneratorsView from './views/GeneratorsView';
import UpgradesView from './views/UpgradesView';
import RebirthView from './views/RebirthView';
import AchievementsView from './views/AchievementsView';
import RebirthAnimation from './components/RebirthAnimation';
import AchievementToast from './components/AchievementToast';
import GoldenEmoji from './components/GoldenEmoji';
import NameInputModal from './components/NameInputModal';
import { useSettings } from './hooks/useSettings';
import { playClickSound, playBuySound, playRebirthSound, playGoldenEmojiSound } from './utils/audio';
import { generateLeaderboardData } from './utils/leaderboard';

const GOLDEN_EMOJI_MIN_SPAWN_TIME = 30000; // 30 seconds
const GOLDEN_EMOJI_MAX_SPAWN_TIME = 60000; // 60 seconds
const GOLDEN_EMOJI_LIFETIME = 6000; // 6 seconds
const AUTO_SAVE_INTERVAL = 15000; // 15 seconds
const LEADERBOARD_STORAGE_KEY = 'emojiClickerLeaderboardData';

type ActiveTab = 'main' | 'rebirth' | 'leaderboard' | 'achievements';

type LeaderboardData = Record<string, {
    points: number;
    totalClicks: number;
    gems: number;
}>;

const getInitialState = (): GameState => ({
    points: 0,
    gems: 0,
    totalClicks: 0,
    generators: INITIAL_GENERATORS.map(g => ({ ...g, level: 0 })),
    upgrades: INITIAL_UPGRADES.map(u => ({ ...u, purchased: false })),
    clickLevel: 1,
    clickProgress: 0,
    unlockedAchievements: {},
    prestigeLevel: 0,
});


const App = () => {
    const { isSoundOn, t } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('main');
    const [isGeneratorsPanelOpen, setGeneratorsPanelOpen] = useState(false);
    const [isUpgradesPanelOpen, setUpgradesPanelOpen] = useState(false);
    const [isRebirthing, setIsRebirthing] = useState(false);
    const [achievementToastQueue, setAchievementToastQueue] = useState<Achievement[]>([]);
    
    // Feature State
    const [goldenEmoji, setGoldenEmoji] = useState<{ id: number; x: number; y: number } | null>(null);
    const [boost, setBoost] = useState<Boost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<number | null>(null);

    const [playerName, setPlayerName] = useState<string | null>(() => localStorage.getItem('emojiClickerPlayerName'));

    const [gameState, setGameState] = useState<GameState>(getInitialState);
    
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [leaderboardCategory, setLeaderboardCategory] = useState<LeaderboardCategory>('points');
    const gameStateRef = useRef(gameState);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Load game state when player name is known
    useEffect(() => {
        if (playerName) {
            setIsLoading(true);
            try {
                const savedGame = localStorage.getItem(`emojiClickerSaga_${playerName}`);
                if (savedGame) {
                    const parsed = JSON.parse(savedGame);
                    const upgrades = INITIAL_UPGRADES.map(u => {
                        const savedUpgrade = parsed.upgrades?.find((su: any) => su.id === u.id);
                        return savedUpgrade ? { ...u, purchased: savedUpgrade.purchased } : u;
                    });
                    const generators = INITIAL_GENERATORS.map(g => {
                        const savedGenerator = parsed.generators?.find((sg: any) => sg.id === g.id);
                        return savedGenerator ? { ...g, level: savedGenerator.level } : g;
                    });

                    const loadedState: GameState = {
                        points: parsed.points || 0,
                        gems: parsed.gems || 0,
                        totalClicks: parsed.totalClicks || 0,
                        generators: generators,
                        upgrades: upgrades,
                        clickLevel: parsed.clickLevel || 1,
                        clickProgress: parsed.clickProgress || 0,
                        unlockedAchievements: parsed.unlockedAchievements || {},
                        prestigeLevel: parsed.prestigeLevel || 0,
                    };
                    setGameState(loadedState);
                } else {
                    setGameState(getInitialState());
                }
            } catch (error) {
                console.error(`Failed to load saved game for ${playerName}, starting fresh:`, error);
                setGameState(getInitialState());
            }
            setIsLoading(false);
        } else {
           setIsLoading(false);
        }
    }, [playerName]);

    const saveGame = useCallback(() => {
        if (!playerName) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        setIsSaving(true);
        
        const currentGameState = gameStateRef.current;
        
        // Save individual progress to player-specific key
        localStorage.setItem(`emojiClickerSaga_${playerName}`, JSON.stringify(currentGameState));

        // Update leaderboard data
        try {
            const leaderboardRaw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
            const leaderboard: LeaderboardData = leaderboardRaw ? JSON.parse(leaderboardRaw) : {};
            
            leaderboard[playerName] = {
                points: currentGameState.points,
                totalClicks: currentGameState.totalClicks,
                gems: currentGameState.gems,
            };

            localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
        } catch (error) {
            console.error("Failed to update leaderboard:", error);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            setIsSaving(false);
            saveTimeoutRef.current = null;
        }, 1000); // Visual feedback duration for "Saved!"
    }, [playerName]);

    // Auto-save logic
    useEffect(() => {
        const autoSaveInterval = setInterval(saveGame, AUTO_SAVE_INTERVAL);
        window.addEventListener('beforeunload', saveGame);

        return () => {
            clearInterval(autoSaveInterval);
            window.removeEventListener('beforeunload', saveGame);
            saveGame(); // Final save on component unmount/player switch
        };
    }, [saveGame]);

    const handlePlayerNameSubmit = (name: string) => {
        const trimmedName = name.trim();
        if (trimmedName) {
            localStorage.setItem('emojiClickerPlayerName', trimmedName);
            setPlayerName(trimmedName);
            
            try {
                const leaderboardRaw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
                const leaderboard: LeaderboardData = leaderboardRaw ? JSON.parse(leaderboardRaw) : {};

                if (!leaderboard[trimmedName]) {
                    leaderboard[trimmedName] = { points: 0, totalClicks: 0, gems: 0 };
                    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
                }
            } catch (error) {
                console.error("Failed to add player to leaderboard:", error);
            }
        }
    };

    // Achievement checker
    useEffect(() => {
        const newlyUnlocked: Achievement[] = [];
        for (const achievement of ACHIEVEMENTS) {
            if (!achievement.secret && !gameState.unlockedAchievements[achievement.id] && achievement.goal(gameState)) {
                newlyUnlocked.push(achievement);
            }
        }
        if (newlyUnlocked.length > 0) {
            setGameState(prev => ({
                ...prev,
                unlockedAchievements: {
                    ...prev.unlockedAchievements,
                    ...newlyUnlocked.reduce((acc, ach) => ({ ...acc, [ach.id]: true }), {})
                }
            }));
            setAchievementToastQueue(prev => [...prev, ...newlyUnlocked]);
        }
    }, [gameState]);
    
    const handleToastClose = useCallback(() => {
        setAchievementToastQueue(prevQueue => prevQueue.slice(1));
    }, []);

    // --- Leaderboard Logic ---
    const updateLeaderboard = useCallback(() => {
        if (!playerName) return;
        const data = generateLeaderboardData(
            playerName,
            leaderboardCategory
        );
        setLeaderboardData(data);
    }, [playerName, leaderboardCategory]);

    // Full leaderboard refresh on category change or tab activation
    useEffect(() => {
        if (activeTab === 'leaderboard') {
            updateLeaderboard();
        }
    }, [activeTab, leaderboardCategory, updateLeaderboard]);


    // --- Golden Emoji & Boost Logic ---
    useEffect(() => {
        let spawnTimeout: number;
        
        const scheduleSpawn = () => {
            const delay = Math.random() * (GOLDEN_EMOJI_MAX_SPAWN_TIME - GOLDEN_EMOJI_MIN_SPAWN_TIME) + GOLDEN_EMOJI_MIN_SPAWN_TIME;
            spawnTimeout = window.setTimeout(spawnGoldenEmoji, delay);
        };
        
        const spawnGoldenEmoji = () => {
            if (goldenEmoji || boost) { // Don't spawn if one is already active/visible
                scheduleSpawn();
                return;
            }
            const id = Date.now();
            const x = Math.random() * 80 + 10; // 10% to 90% of width
            const y = Math.random() * 70 + 15; // 15% to 85% of height
            setGoldenEmoji({ id, x, y });

            setTimeout(() => {
                setGoldenEmoji(prev => (prev?.id === id ? null : prev));
            }, GOLDEN_EMOJI_LIFETIME);

            scheduleSpawn();
        };

        scheduleSpawn();
        return () => clearTimeout(spawnTimeout);
    }, [goldenEmoji, boost]);
    
    useEffect(() => {
        if (!boost) return;
        const timer = setInterval(() => {
            setBoost(b => {
                if (!b || b.timeLeft <= 1) {
                    clearInterval(timer);
                    return null;
                }
                return { ...b, timeLeft: b.timeLeft - 1 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [boost]);

    const handleGoldenEmojiClick = useCallback(() => {
        if (!goldenEmoji) return;
        if (isSoundOn) playGoldenEmojiSound();
        setBoost({ multiplier: 7, timeLeft: 15 });
        setGoldenEmoji(null);
    }, [goldenEmoji, isSoundOn]);

    // --- Core Game Calculations ---
    const gemBonus = useMemo(() => 1 + gameState.gems * 0.1, [gameState.gems]);
    const prestigeBonus = useMemo(() => 1 + gameState.prestigeLevel * PRESTIGE_BONUS_PER_LEVEL, [gameState.prestigeLevel]);
    const boostMultiplier = useMemo(() => boost?.multiplier ?? 1, [boost]);

    const getUpgradeMultiplier = useCallback((targetId: string): number => {
        return gameState.upgrades
            .filter(u => u.purchased && u.target === targetId)
            .reduce((total, u) => total * u.multiplier, 1);
    }, [gameState.upgrades]);

    const clickLevelBonus = useMemo(() => 1 + (gameState.clickLevel - 1) * 0.5, [gameState.clickLevel]);

    const clickPower = useMemo(() => {
        return getUpgradeMultiplier('click') * gemBonus * clickLevelBonus * prestigeBonus * boostMultiplier;
    }, [getUpgradeMultiplier, gemBonus, clickLevelBonus, prestigeBonus, boostMultiplier]);

    const pointsPerSecond = useMemo(() => {
        const totalPps = gameState.generators.reduce((total, gen) => {
            const upgradeMultiplier = getUpgradeMultiplier(gen.id);
            return total + (gen.level * gen.basePps * upgradeMultiplier);
        }, 0);
        return totalPps * gemBonus * prestigeBonus * boostMultiplier;
    }, [gameState.generators, getUpgradeMultiplier, gemBonus, prestigeBonus, boostMultiplier]);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            setGameState(prev => ({
                ...prev,
                points: prev.points + pointsPerSecond / 10,
            }));
        }, 100);
        return () => clearInterval(gameLoop);
    }, [pointsPerSecond]);
    
    const clicksForNextLevel = useMemo(() => {
        return Math.floor(100 * Math.pow(1.5, gameState.clickLevel - 1));
    }, [gameState.clickLevel]);

    const handleMainClick = useCallback(() => {
        if (isSoundOn) playClickSound();
        setGameState(prev => {
            let newProgress = prev.clickProgress + 1;
            let newLevel = prev.clickLevel;
            const needed = Math.floor(100 * Math.pow(1.5, newLevel - 1));
            if (newProgress >= needed) {
                newLevel++;
                newProgress = 0;
            }
            return { 
                ...prev, 
                points: prev.points + clickPower,
                totalClicks: prev.totalClicks + 1,
                clickLevel: newLevel,
                clickProgress: newProgress
            };
        });
    }, [clickPower, isSoundOn]);

    const handleBuyGenerator = useCallback((generatorId: string) => {
        setGameState(prev => {
            const gen = prev.generators.find(g => g.id === generatorId);
            if (!gen) return prev;
            const cost = gen.baseCost * Math.pow(gen.costMultiplier, gen.level);
            if (prev.points < cost) return prev;
            if (isSoundOn) playBuySound();
            const newGenerators = prev.generators.map(g =>
                g.id === generatorId ? { ...g, level: g.level + 1 } : g
            );
            const newState = { ...prev, points: prev.points - cost, generators: newGenerators };
            gameStateRef.current = newState;
            saveGame();
            return newState;
        });
    }, [isSoundOn, saveGame]);

    const handleBuyUpgrade = useCallback((upgradeId: string) => {
        setGameState(prev => {
            const upgrade = prev.upgrades.find(u => u.id === upgradeId);
            if (!upgrade || upgrade.purchased || prev.points < upgrade.cost) return prev;
            if (isSoundOn) playBuySound();
            const newUpgrades = prev.upgrades.map(u =>
                u.id === upgradeId ? { ...u, purchased: true } : u
            );
            const newState = { ...prev, points: prev.points - upgrade.cost, upgrades: newUpgrades };
            gameStateRef.current = newState;
            saveGame();
            return newState;
        });
    }, [isSoundOn, saveGame]);

    const handleRebirth = useCallback(() => {
        const currentRebirthCost = REBIRTH_COST + gameStateRef.current.gems * POINTS_PER_GEM;
        if (gameStateRef.current.points < currentRebirthCost) return;
        if (window.confirm(t('rebirth_confirm'))) {
            if (isSoundOn) playRebirthSound();
            setIsRebirthing(true);
            setTimeout(() => {
                 setGameState(prev => {
                    const newState = {
                        ...prev,
                        points: 0,
                        gems: prev.gems + 1,
                        generators: INITIAL_GENERATORS.map(g => ({...g, level: 0})),
                        upgrades: INITIAL_UPGRADES.map(u => ({...u, purchased: false})),
                        clickLevel: 1,
                        clickProgress: 0,
                    };
                    gameStateRef.current = newState;
                    saveGame();
                    return newState;
                });
            }, 500);
            setTimeout(() => setIsRebirthing(false), 2500);
        }
    }, [isSoundOn, t, saveGame]);
    
    const handlePrestige = useCallback(() => {
        const cost = PRESTIGE_COST_BASE + gameStateRef.current.prestigeLevel * PRESTIGE_COST_SCALING;
        if (gameStateRef.current.gems < cost) return;
        if (window.confirm(t('prestige_confirm'))) {
            if (isSoundOn) playRebirthSound();
            setIsRebirthing(true);
            setTimeout(() => {
                 setGameState(prev => {
                    const newState = {
                        ...prev,
                        points: 0,
                        gems: 0,
                        generators: INITIAL_GENERATORS.map(g => ({...g, level: 0})),
                        upgrades: INITIAL_UPGRADES.map(u => ({...u, purchased: false})),
                        clickLevel: 1,
                        clickProgress: 0,
                        prestigeLevel: prev.prestigeLevel + 1,
                    };
                    gameStateRef.current = newState;
                    saveGame();
                    return newState;
                });
            }, 500);
            setTimeout(() => setIsRebirthing(false), 2500);
        }
    }, [isSoundOn, t, saveGame]);

    const handleCheat = useCallback(() => {
        const newlyUnlocked = ACHIEVEMENTS.filter(
            ach => !gameStateRef.current.unlockedAchievements[ach.id]
        );

        if (newlyUnlocked.length > 0) {
            setAchievementToastQueue(prev => [...prev, ...newlyUnlocked]);
        }

        const allUnlockedAchievements = ACHIEVEMENTS.reduce((acc, ach) => {
            acc[ach.id] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        
        setGameState(prev => ({
            ...prev,
            points: 1e30,
            gems: 100,
            generators: prev.generators.map(g => ({ ...g, level: 100 })),
            upgrades: prev.upgrades.map(u => ({ ...u, purchased: true })),
            clickLevel: 50,
            clickProgress: 0,
            prestigeLevel: 5,
            unlockedAchievements: allUnlockedAchievements
        }));
        setIsSettingsOpen(false);
    }, []);
    
    const handleHardReset = useCallback(() => {
        localStorage.removeItem('emojiClickerPlayerName');
        localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('emojiClickerSaga_')) {
                localStorage.removeItem(key);
            }
        });
        window.location.reload();
    }, []);
    
    const handleSwitchAccount = useCallback(() => {
        saveGame();
        setIsSettingsOpen(false);
        setPlayerName(null);
        localStorage.removeItem('emojiClickerPlayerName');
    }, [saveGame]);

    const nextRebirthCost = REBIRTH_COST + gameState.gems * POINTS_PER_GEM;
    const currentToast = achievementToastQueue[0];

    if (isLoading) {
        return (
            <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
                <p className="text-2xl animate-pulse">Loading Game...</p>
            </div>
        );
    }
    
    const renderActiveView = () => {
        switch(activeTab) {
            case 'rebirth':
                return <RebirthView 
                    points={gameState.points} 
                    gems={gameState.gems}
                    prestigeLevel={gameState.prestigeLevel}
                    nextRebirthCost={nextRebirthCost} 
                    onRebirth={handleRebirth}
                    onPrestige={handlePrestige}
                />;
            case 'leaderboard':
                return <Leaderboard data={leaderboardData} category={leaderboardCategory} onCategoryChange={setLeaderboardCategory} />;
            case 'achievements':
                return <AchievementsView unlockedAchievements={gameState.unlockedAchievements} />;
            default:
                return null;
        }
    }

    if (!playerName) {
        return <NameInputModal onNameSubmit={handlePlayerNameSubmit} />;
    }
    
    return (
        <div className="h-screen bg-gray-900 text-white font-sans flex flex-col overflow-hidden">
            <div className="fixed bottom-20 right-5 z-[999]">
                {currentToast && (
                    <AchievementToast
                        key={currentToast.id}
                        icon={currentToast.icon}
                        achievementId={currentToast.id}
                        onClose={handleToastClose}
                    />
                )}
            </div>
            {isRebirthing && <RebirthAnimation />}
            {goldenEmoji && (
                <GoldenEmoji 
                    key={goldenEmoji.id}
                    x={goldenEmoji.x}
                    y={goldenEmoji.y}
                    onClick={handleGoldenEmojiClick}
                    lifetime={GOLDEN_EMOJI_LIFETIME}
                />
            )}
            <Header 
                points={gameState.points} 
                pps={pointsPerSecond} 
                gems={gameState.gems} 
                boost={boost}
                isSaving={isSaving}
                onSettingsClick={() => setIsSettingsOpen(true)}
            />

            <main className="flex-1 overflow-hidden">
                <div className="h-full">
                    {activeTab === 'main' ? (
                         <>
                            {/* Desktop Layout: 3-column full height */}
                            <div className="hidden lg:flex h-full gap-6 p-6 max-w-screen-2xl mx-auto">
                                <aside className={`transition-all duration-300 ease-in-out ${isGeneratorsPanelOpen ? 'w-[480px]' : 'w-0'} overflow-hidden`}>
                                    <div className="w-[480px] h-full">
                                        <GeneratorsView 
                                            gameState={gameState}
                                            getUpgradeMultiplier={getUpgradeMultiplier}
                                            onBuyGenerator={handleBuyGenerator}
                                        />
                                    </div>
                                </aside>
                                
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <MainClicker 
                                      onClick={handleMainClick} 
                                      clickPower={clickPower}
                                      clickLevel={gameState.clickLevel}
                                      clickProgress={gameState.clickProgress}
                                      clicksForNextLevel={clicksForNextLevel}
                                    />
                                    <div className="flex justify-center gap-4 mt-6">
                                        <button
                                            onClick={() => setGeneratorsPanelOpen(p => !p)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                            aria-expanded={isGeneratorsPanelOpen}
                                        >
                                            🛠️ {t(isGeneratorsPanelOpen ? 'hide_generators' : 'show_generators')}
                                        </button>
                                        <button
                                            onClick={() => setUpgradesPanelOpen(p => !p)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                            aria-expanded={isUpgradesPanelOpen}
                                        >
                                            🌟 {t(isUpgradesPanelOpen ? 'hide_upgrades' : 'show_upgrades')}
                                        </button>
                                    </div>
                                </div>
                                
                                <aside className={`transition-all duration-300 ease-in-out ${isUpgradesPanelOpen ? 'w-[480px]' : 'w-0'} overflow-hidden`}>
                                     <div className="w-[480px] h-full">
                                        <UpgradesView 
                                            gameState={gameState}
                                            onBuyUpgrade={handleBuyUpgrade}
                                        />
                                    </div>
                                </aside>
                            </div>

                            {/* Mobile Layout: Vertical Stack with scrolling */}
                            <div className="lg:hidden h-full overflow-y-auto px-4 pt-6 pb-20">
                               <div className="grid grid-cols-1 gap-6 items-start">
                                   <div>
                                       <MainClicker 
                                          onClick={handleMainClick} 
                                          clickPower={clickPower} 
                                          clickLevel={gameState.clickLevel}
                                          clickProgress={gameState.clickProgress}
                                          clicksForNextLevel={clicksForNextLevel}
                                        />
                                   </div>
                                   <aside>
                                        <GeneratorsView 
                                            gameState={gameState}
                                            getUpgradeMultiplier={getUpgradeMultiplier}
                                            onBuyGenerator={handleBuyGenerator}
                                        />
                                   </aside>
                                   <aside>
                                        <UpgradesView 
                                            gameState={gameState}
                                            onBuyUpgrade={handleBuyUpgrade}
                                        />
                                   </aside>
                               </div>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-6xl mx-auto h-full flex flex-col p-6 pb-20">
                           {renderActiveView()}
                        </div>
                    )}
                </div>
            </main>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onCheat={handleCheat}
                onHardReset={handleHardReset}
                onSwitchAccount={handleSwitchAccount}
                playerName={playerName}
            />
        </div>
    );
};

export default App;