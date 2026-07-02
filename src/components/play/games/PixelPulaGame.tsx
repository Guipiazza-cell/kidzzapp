import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { addXP } from "@/lib/habitLoop";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import pixelImg from "@/assets/chameleon-main.webp";
import GameResultScreen from "./GameResultScreen";

interface Obstacle {
  id: number;
  x: number;
  emoji: string;
  width: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const OBSTACLE_EMOJIS = ["🍄", "🪨", "🌵", "🪵", "🌿"];
const GROUND_Y = 72;
const PIXEL_X = 70;
const PIXEL_SIZE = 84;
const GRAVITY = 1.05;          // slightly snappier fall
const JUMP_VELOCITY = -18.5;   // higher arc
const TICK_MS = 24;            // ~42fps logic, GPU does the rest
const COYOTE_MS = 90;          // forgiveness window after leaving ground
const JUMP_BUFFER_MS = 110;    // buffer taps slightly before landing

const PixelPulaGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const [phase, setPhase] = useState<"intro" | "playing" | "gameover">("intro");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Physics state in refs (avoid re-renders every tick)
  const yRef = useRef(0);
  const vyRef = useRef(0);
  const groundedRef = useRef(true);
  const speedRef = useRef(6);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const tickRef = useRef(0);
  const idRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const lastGroundedAtRef = useRef<number>(0);
  const jumpBufferAtRef = useRef<number>(0);
  const passedObstaclesRef = useRef<Set<number>>(new Set());

  // Visual state
  const [pixelY, setPixelY] = useState(0);
  const [pixelRot, setPixelRot] = useState(0);
  const [pixelSquash, setPixelSquash] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [parallax, setParallax] = useState(0);
  const [landingPuffs, setLandingPuffs] = useState<{ id: number; x: number; t: number }[]>([]);
  const [combo, setCombo] = useState(0);
  const [nearMissAt, setNearMissAt] = useState(0);
  const [comboFloater, setComboFloater] = useState<{ id: number; x: number; n: number } | null>(null);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("kidzz_pixel_pula_high") || "0", 10);
    setHighScore(Number.isFinite(stored) ? stored : 0);
  }, []);

  const performJump = useCallback(() => {
    vyRef.current = JUMP_VELOCITY;
    groundedRef.current = false;
    setShowHint(false);
    setPixelSquash(0.6);
    setTimeout(() => setPixelSquash(0), 140);
    sfx("click");
    haptic("light");
  }, []);

  const jump = useCallback(() => {
    if (phase !== "playing") return;
    const now = performance.now();
    const canCoyote = !groundedRef.current && now - lastGroundedAtRef.current < COYOTE_MS;
    if (groundedRef.current || canCoyote) {
      performJump();
    } else {
      jumpBufferAtRef.current = now;
    }
  }, [phase, performJump]);

  const startGame = () => {
    yRef.current = 0;
    vyRef.current = 0;
    groundedRef.current = true;
    speedRef.current = 6;
    obstaclesRef.current = [];
    starsRef.current = [];
    tickRef.current = 0;
    rotationRef.current = 0;
    passedObstaclesRef.current = new Set();
    setObstacles([]);
    setStars([]);
    setPixelY(0);
    setPixelRot(0);
    setPixelSquash(0);
    setLandingPuffs([]);
    setCombo(0);
    setNearMissAt(0);
    setComboFloater(null);
    setScore(0);
    setIsNewRecord(false);
    setShowHint(true);
    setPhase("playing");
    setTimeout(() => setShowHint(false), 3500);
  };

  const endGame = useCallback(
    (finalScore: number) => {
      setPhase("gameover");
      const newRecord = finalScore > highScore;
      if (newRecord) {
        setHighScore(finalScore);
        localStorage.setItem("kidzz_pixel_pula_high", String(finalScore));
        setIsNewRecord(true);
        onReaction("happy");
        sfx("streak");
        haptic("success");
      } else {
        onReaction("encourage");
        sfx("error");
        haptic("medium");
      }
      // Convert score to XP
      const xpEarned = Math.floor(finalScore / 10);
      if (xpEarned > 0) addXP(xpEarned);
      onScore(Math.min(finalScore, 30));

      // Milestone confetti
      if (finalScore >= 300) {
        localStorage.setItem("kidzz_pixel_pula_milestone_300", "1");
      } else if (finalScore >= 150) {
        localStorage.setItem("kidzz_pixel_pula_milestone_150", "1");
      } else if (finalScore >= 50) {
        localStorage.setItem("kidzz_pixel_pula_milestone_50", "1");
      }
    },
    [highScore, onScore, onReaction]
  );

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return;
    const arenaWidth = arenaRef.current?.clientWidth || 360;

    const interval = setInterval(() => {
      tickRef.current += 1;

      // Physics
      const wasAir = !groundedRef.current;
      vyRef.current += GRAVITY;
      yRef.current -= vyRef.current;
      if (yRef.current <= 0) {
        const landingHard = wasAir && vyRef.current > 12;
        yRef.current = 0;
        vyRef.current = 0;
        if (wasAir) {
          // squash on land + dust puff
          setPixelSquash(-0.6);
          setTimeout(() => setPixelSquash(0), 130);
          haptic("light");
          setLandingPuffs((p) => [
            ...p.slice(-3),
            { id: idRef.current++, x: PIXEL_X, t: performance.now() },
          ]);
        }
        groundedRef.current = true;
        lastGroundedAtRef.current = performance.now();
        rotationRef.current = 0;
        // jump buffer — auto-fire if user tapped right before landing
        if (performance.now() - jumpBufferAtRef.current < JUMP_BUFFER_MS) {
          jumpBufferAtRef.current = 0;
          performJump();
        }
        if (landingHard) {
          // small impact rumble
          haptic("medium");
        }
      } else {
        rotationRef.current = Math.min(20, rotationRef.current + 1.2);
      }
      setPixelY(yRef.current);
      setPixelRot(rotationRef.current);

      // Move obstacles
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speedRef.current }))
        .filter((o) => o.x > -80);

      // Move stars
      starsRef.current = starsRef.current
        .map((s) => ({ ...s, x: s.x - speedRef.current }))
        .filter((s) => s.x > -50);

      // Spawn obstacle
      const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
      const minGap = 220 + Math.random() * 180;
      if (!lastObs || arenaWidth - lastObs.x > minGap) {
        if (Math.random() < 0.04 + Math.min(0.06, tickRef.current / 8000)) {
          obstaclesRef.current.push({
            id: idRef.current++,
            x: arenaWidth + 20,
            emoji: OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)],
            width: 44,
          });
        }
      }

      // Spawn stars (rarer, in the air)
      if (Math.random() < 0.012) {
        starsRef.current.push({
          id: idRef.current++,
          x: arenaWidth + 20,
          y: 60 + Math.random() * 110, // height above ground
          collected: false,
        });
      }

      // Collision detection
      const pixelLeft = PIXEL_X + 8;
      const pixelRight = PIXEL_X + PIXEL_SIZE - 8;
      const pixelBottom = yRef.current; // height above ground
      const pixelTop = yRef.current + PIXEL_SIZE - 12;

      let hit = false;
      let nearMissThisTick = false;
      for (const o of obstaclesRef.current) {
        const oLeft = o.x + 6;
        const oRight = o.x + o.width - 6;
        const oTop = 38;
        if (pixelRight > oLeft && pixelLeft < oRight && pixelBottom < oTop) {
          hit = true;
          break;
        }
        // Near miss: obstacle just passed under us while we were airborne
        if (
          !passedObstaclesRef.current.has(o.id) &&
          o.x + o.width < PIXEL_X &&
          pixelBottom > oTop - 8
        ) {
          passedObstaclesRef.current.add(o.id);
          nearMissThisTick = true;
        }
      }
      if (nearMissThisTick) {
        const next = combo + 1;
        setCombo(next);
        setNearMissAt(performance.now());
        setComboFloater({ id: idRef.current++, x: PIXEL_X + 20, n: next });
        setTimeout(() => setComboFloater((f) => (f && f.n === next ? null : f)), 700);
        if (next >= 2) {
          sfx("reward");
          haptic("light");
        }
      }

      // Star collection
      let starGain = 0;
      starsRef.current.forEach((s) => {
        if (s.collected) return;
        const sLeft = s.x;
        const sRight = s.x + 28;
        const sBottom = s.y;
        const sTop = s.y + 28;
        if (
          pixelRight > sLeft &&
          pixelLeft < sRight &&
          pixelTop > sBottom &&
          pixelBottom < sTop
        ) {
          s.collected = true;
          starGain += 5;
        }
      });
      if (starGain > 0 && tickRef.current % 4 === 0) {
        confetti({
          particleCount: 8,
          spread: 25,
          origin: { y: 0.5 },
          colors: ["#FBBF24", "#fff"],
          scalar: 0.6,
        });
        sfx("reward");
        haptic("light");
      }

      // Score & difficulty (record celebration WITHOUT ending game)
      setScore((s) => {
        const next = s + 1 + starGain + (nearMissThisTick ? Math.min(5, combo + 1) : 0);
        // Smooth asymptotic speed curve (was step-based)
        const targetSpeed = 6 + Math.min(8, Math.log2(1 + next / 40) * 2.4);
        // ease toward target instead of snapping
        speedRef.current = speedRef.current + (targetSpeed - speedRef.current) * 0.05;
        // celebrate new record live (only once per run)
        if (highScore > 0 && s <= highScore && next > highScore) {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.4 },
            colors: ["#FBBF24", "#A78BFA", "#34D399", "#fff"],
          });
        }
        return next;
      });

      setObstacles([...obstaclesRef.current]);
      setStars([...starsRef.current.filter((s) => !s.collected)]);
      setParallax((p) => (p - speedRef.current * 0.3) % 200);

      if (hit) {
        clearInterval(interval);
        setScore((s) => {
          endGame(s);
          return s;
        });
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase, endGame]);

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "playing") jump();
        else if (phase === "intro") startGame();
        else if (phase === "gameover") startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, jump]);

  const handleArenaPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (phase === "playing") jump();
  };

  // Combo decays after ~1.6s without a fresh near miss
  useEffect(() => {
    if (combo === 0) return;
    const t = setTimeout(() => {
      if (performance.now() - nearMissAt > 1500) setCombo(0);
    }, 1700);
    return () => clearTimeout(t);
  }, [combo, nearMissAt]);

  // Cull old landing puffs (keeps DOM lean)
  useEffect(() => {
    if (landingPuffs.length === 0) return;
    const t = setTimeout(() => {
      const now = performance.now();
      setLandingPuffs((p) => p.filter((x) => now - x.t < 500));
    }, 500);
    return () => clearTimeout(t);
  }, [landingPuffs]);

  // Endless score → stars (1-3) based on milestones
  const computeStars = (s: number): 1 | 2 | 3 => (s >= 300 ? 3 : s >= 150 ? 2 : 1);
  const xpEarned = Math.max(1, Math.floor(score / 10));

  if (phase === "gameover") {
    return (
      <GameResultScreen
        correct={score}
        total={0}
        xp={xpEarned}
        childName={childName}
        activityLabel="Kidzz Pula"
        subtype="pixel-pula"
        starsOverride={computeStars(score)}
        percentOverride={Math.min(100, Math.round((score / Math.max(highScore, 100)) * 100))}
        subtitle={`${score} pontos${isNewRecord ? " • 🏆 Novo recorde!" : ` • Recorde: ${highScore}`}`}
        onReplay={startGame}
        onOpenAchievements={onOpenAchievements ?? (() => {})}
        onHome={onHome ?? (() => {})}
      />
    );
  }

  return (
    <div className="w-full">
      {/* HUD */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-white/50 font-semibold">RECORDE</span>
          <div className="text-sm font-black text-yellow-300">🏆 {highScore}</div>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-white/50 font-semibold">SCORE</span>
          <div className="text-sm font-black text-white">{score}</div>
        </div>
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        className="relative w-full overflow-hidden rounded-3xl border-2 border-white/20 select-none cursor-pointer shadow-2xl"
        style={{
          height: "clamp(320px, 55vh, 460px)",
          background:
            "linear-gradient(180deg, #0c1a3d 0%, #1e3a8a 25%, #5b21b6 55%, #831843 85%, #4a1d3f 100%)",
          touchAction: "none",
          boxShadow: "0 20px 60px rgba(76,29,149,0.4), inset 0 0 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Aurora glow */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(167,139,250,0.5), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(244,114,182,0.4), transparent 60%)",
            filter: "blur(20px)",
          }}
        />

        {/* Moon with halo */}
        <div className="absolute top-5 right-7">
          <div
            className="absolute -inset-3 rounded-full opacity-50"
            style={{ background: "radial-gradient(circle, rgba(253,224,71,0.6), transparent 70%)", filter: "blur(8px)" }}
          />
          <div className="relative text-4xl drop-shadow-[0_0_16px_rgba(253,224,71,0.7)]">🌙</div>
        </div>

        {/* Stars background */}
        {[...Array(28)].map((_, i) => {
          const size = i % 4 === 0 ? 2 : 1;
          return (
            <div
              key={`bg-star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: size,
                height: size,
                top: `${(i * 13) % 65}%`,
                left: `${(i * 37) % 100}%`,
                opacity: 0.7,
                boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          );
        })}

        {/* Distant mountains */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: GROUND_Y - 4,
            height: 90,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(30,27,75,0.6) 100%)",
            clipPath:
              "polygon(0 100%, 0 60%, 12% 30%, 22% 55%, 35% 20%, 48% 50%, 60% 25%, 75% 55%, 88% 30%, 100% 50%, 100% 100%)",
            opacity: 0.7,
          }}
        />

        {/* Trees parallax (back layer) */}
        <div
          className="absolute left-0 right-0 h-20 pointer-events-none"
          style={{ bottom: GROUND_Y, transform: `translateX(${parallax * 0.5}px)` }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={`tree-${i}`}
              className="absolute bottom-0 text-2xl opacity-40"
              style={{ left: `${i * 110 + (parallax % 110)}px`, filter: "blur(0.5px)" }}
            >
              🌲
            </div>
          ))}
        </div>

        {/* Trees parallax (front layer) */}
        <div
          className="absolute left-0 right-0 h-28 pointer-events-none"
          style={{ bottom: GROUND_Y, transform: `translateX(${parallax}px)` }}
        >
          {[...Array(7)].map((_, i) => (
            <div
              key={`tree2-${i}`}
              className="absolute bottom-0 text-4xl opacity-70"
              style={{ left: `${i * 170 + ((parallax * 0.6) % 170)}px`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" }}
            >
              🌳
            </div>
          ))}
        </div>

        {/* Fireflies */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`firefly-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 4,
              height: 4,
              background: "rgba(253,224,71,0.9)",
              boxShadow: "0 0 10px rgba(253,224,71,0.9), 0 0 20px rgba(253,224,71,0.6)",
              top: `${30 + (i * 11) % 50}%`,
              left: `${(i * 23) % 90}%`,
              animation: `firefly ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: GROUND_Y,
            background:
              "linear-gradient(180deg, #5b21b6 0%, #2e1065 50%, #0f0a1f 100%)",
            borderTop: "2px solid rgba(167,139,250,0.5)",
            boxShadow: "inset 0 6px 16px rgba(0,0,0,0.5), 0 -4px 20px rgba(167,139,250,0.3)",
          }}
        >
          {/* Ground texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 30px, rgba(255,255,255,0.08) 30px 32px)",
              transform: `translateX(${parallax * 1.2}px)`,
            }}
          />
          {/* Grass blades */}
          <div
            className="absolute top-0 left-0 right-0 h-2 opacity-50"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent 0 8px, rgba(134,239,172,0.5) 8px 10px)",
              transform: `translateX(${parallax * 1.4}px)`,
            }}
          />
        </div>

        {/* Speed lines (subtle, ramps with speed) */}
        {speedRef.current > 8 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={`sl-${i}`}
                className="absolute"
                style={{
                  top: `${15 + i * 12}%`,
                  right: 0,
                  width: 60 + i * 14,
                  height: 1.5,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.5))",
                  transform: `translateX(${(parallax * (1.6 + i * 0.2)) % 320}px)`,
                  opacity: Math.min(0.6, (speedRef.current - 8) / 6),
                }}
              />
            ))}
          </div>
        )}

        {/* Landing puffs */}
        {landingPuffs.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              left: p.x + PIXEL_SIZE / 2 - 14,
              bottom: GROUND_Y - 4,
              width: 28,
              height: 10,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.55)",
              filter: "blur(3px)",
              animation: "puff 0.5s ease-out forwards",
            }}
          />
        ))}

        {/* Pixel character + ground shadow (dynamic) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: PIXEL_X + 6,
            bottom: GROUND_Y - 6,
            width: PIXEL_SIZE - 12,
            height: 10,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%)",
            transform: `scaleX(${Math.max(0.45, 1 - pixelY / 220)}) scaleY(${Math.max(0.5, 1 - pixelY / 260)})`,
            opacity: Math.max(0.25, 1 - pixelY / 240),
            filter: "blur(2px)",
            transition: "transform 60ms linear, opacity 60ms linear",
          }}
        />
        <div
          className="absolute"
          style={{
            left: PIXEL_X,
            bottom: GROUND_Y + pixelY,
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            transform: `rotate(${pixelRot}deg) scaleX(${1 - pixelSquash * 0.18}) scaleY(${1 + pixelSquash * 0.22})`,
            transformOrigin: "50% 100%",
            transition: "transform 90ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform, bottom",
            filter:
              "drop-shadow(0 6px 14px rgba(167,139,250,0.7)) drop-shadow(0 0 18px rgba(244,114,182,0.35))",
          }}
        >
          <img src={pixelImg} alt="Pixel" className="w-full h-full object-contain" draggable={false} />
        </div>

        {/* Combo near-miss floater */}
        <AnimatePresence>
          {comboFloater && combo >= 2 && (
            <motion.div
              key={comboFloater.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -34, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute font-black text-yellow-300"
              style={{
                left: comboFloater.x,
                bottom: GROUND_Y + 90,
                fontSize: 18,
                textShadow: "0 0 14px rgba(253,224,71,0.85), 0 2px 4px rgba(0,0,0,0.45)",
                pointerEvents: "none",
              }}
            >
              x{combo} !
            </motion.div>
          )}
        </AnimatePresence>

        {/* Obstacles */}
        {obstacles.map((o) => (
          <div
            key={o.id}
            className="absolute flex items-end justify-center"
            style={{
              left: o.x,
              bottom: GROUND_Y,
              width: o.width,
              height: 48,
              fontSize: 42,
              filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))",
            }}
          >
            {o.emoji}
          </div>
        ))}
        {/* Stars to collect */}
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute flex items-center justify-center"
            style={{
              left: s.x,
              bottom: GROUND_Y + s.y,
              width: 28,
              height: 28,
              fontSize: 24,
              animation: "spinPulse 1.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 8px rgba(253,224,71,0.8))",
            }}
          >
            ⭐
          </div>
        ))}

        {/* Hint */}
        <AnimatePresence>
          {phase === "playing" && showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full pointer-events-none"
            >
              <p className="text-white/90 text-xs font-bold">Toque para pular 👆</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intro overlay */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10"
            >
              <img
                src={pixelImg}
                alt="Pixel"
                className="w-20 h-20 mb-3 drop-shadow-[0_0_20px_rgba(167,139,250,0.6)]"
              />
              <h2 className="text-2xl font-black text-white mb-1">Pixel Pula!</h2>
              <p className="text-xs text-white/60 text-center px-6 mb-4 max-w-[260px]">
                Toque para pular os obstáculos e coletar estrelas ⭐
              </p>
              <motion.button
                onClick={startGame}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
                  boxShadow: "0 6px 20px rgba(167,139,250,0.5)",
                }}
              >
                🚀 Começar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over is rendered as full GameResultScreen above (early return). */}
      </div>

      <p className="text-center text-[10px] text-white/40 mt-2">
        XP ganho: {Math.floor(score / 10)} ✨ • Estrelas valem +5 pontos
      </p>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.95; }
        }
        @keyframes spinPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.25) rotate(180deg); }
        }
        @keyframes firefly {
          0%, 100% { transform: translate(0,0); opacity: 0.4; }
          25% { transform: translate(8px,-6px); opacity: 1; }
          50% { transform: translate(-6px,-12px); opacity: 0.7; }
          75% { transform: translate(4px,-4px); opacity: 0.9; }
        @keyframes puff {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.8) translateY(-4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PixelPulaGame;
