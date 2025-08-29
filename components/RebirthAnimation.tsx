import { useMemo, CSSProperties } from 'react';

const RebirthAnimation = () => {
    
    const stars = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const style = {
                '--i': i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                'animation-delay': `${Math.random() * 0.5}s`,
                 transform: `scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg)`,
            };
            return <div key={i} className="star" style={style as CSSProperties}>⭐</div>;
        });
    }, []);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center pointer-events-none animate-fade-in-out">
                <div className="absolute w-1 h-1">
                    <div className="expanding-ring"></div>
                    <div className="gem">💎</div>
                    <div className="stars-container">{stars}</div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-out {
                    0%, 100% { opacity: 0; }
                    10%, 90% { opacity: 1; }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 2.5s ease-in-out forwards;
                }

                @keyframes pulse-gem {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.2); }
                }
                .gem {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    font-size: 8rem;
                    text-shadow: 0 0 20px #fff, 0 0 40px #a29bfe, 0 0 60px #a29bfe;
                    animation: pulse-gem 1s ease-in-out infinite;
                }

                @keyframes expand-ring {
                    0% {
                        width: 0;
                        height: 0;
                        opacity: 1;
                        border-width: 4px;
                    }
                    100% {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                        border-width: 1px;
                    }
                }
                .expanding-ring {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 4px solid #fff;
                    border-radius: 50%;
                    animation: expand-ring 1s ease-out forwards;
                }
                
                @keyframes star-fly {
                    0% {
                        transform: translate(0, 0) scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx, 0), var(--ty, 0)) scale(1);
                        opacity: 0;
                    }
                }

                .stars-container {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  transform: translate(-50vw, -50vh);
                  pointer-events: none;
                }
                
                .star {
                    position: absolute;
                    font-size: 2rem;
                    opacity: 0;
                    animation: star-fly 1.5s ease-out forwards;
                    animation-delay: 0.2s; /* Start after the ring expands a bit */
                    --angle: calc(var(--i) * (360deg / 30));
                    --distance: 50vmin;
                    --tx: calc(var(--distance) * cos(var(--angle)));
                    --ty: calc(var(--distance) * sin(var(--angle)));
                }

            `}</style>
        </>
    );
};

export default RebirthAnimation;