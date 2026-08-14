import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Creature } from '../types';
import { soundFx } from '../audio/soundEffects';

interface ThreeForestSceneProps {
  creature: Creature;
  currentClueStep: number;
  isRevealed: boolean;
  onHeartClick?: () => void;
}

export const ThreeForestScene: React.FC<ThreeForestSceneProps> = ({ creature, currentClueStep, isRevealed, onHeartClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetZoomRef = useRef<number>(1.0);
  const currentZoomRef = useRef<number>(1.0);
  const targetSpotlightRadius = useRef<number>(0.25);
  const currentSpotlightRadius = useRef<number>(0.25);
  const targetSpotlightPos = useRef<[number, number]>([0.5, 0.5]);
  const currentSpotlightPos = useRef<[number, number]>([0.5, 0.5]);
  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const clue = creature.clues[Math.min(currentClueStep, creature.clues.length - 1)];
    if (isRevealed) {
      targetZoomRef.current = 1.0;
      targetSpotlightRadius.current = 1.6;
      targetSpotlightPos.current = [0.5, 0.5];
    } else if (clue) {
      targetZoomRef.current = clue.zoom;
      targetSpotlightRadius.current = clue.spotlightRadius;
      targetSpotlightPos.current = clue.spotlightCenter;
    }
  }, [currentClueStep, isRevealed, creature]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 2.4;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    let activeTexture: THREE.Texture | null = null;
    let planeMesh: THREE.Mesh | null = null;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(creature.imageSrc, (texture) => {
      activeTexture = texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float uTime;
        uniform vec2 uMouse;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          pos.z += sin(pos.x * 3.0 + uTime * 1.5) * 0.015 * (1.0 - uv.y);
          pos.y += cos(pos.y * 2.5 + uTime * 1.2) * 0.008;
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `;

      const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uRevealRadius;
        uniform vec2 uSpotlightPos;
        uniform vec2 uHeartPos;
        uniform float uHeartbeat;
        uniform float uIridescence;
        uniform float uIsRevealed;
        uniform vec2 uMouse;
        void main() {
          vec2 uv = vUv;
          vec4 texColor = texture2D(uTexture, uv);
          vec2 spotUv = vec2(uSpotlightPos.x, 1.0 - uSpotlightPos.y);
          float distToSpot = distance(uv, spotUv);
          float revealMask = smoothstep(uRevealRadius, uRevealRadius * 0.45, distToSpot);
          if (uIsRevealed > 0.5) { revealMask = 1.0; }
          vec3 mistyColor = mix(vec3(0.08, 0.16, 0.12), texColor.rgb * 0.35, 0.5);
          float shimmerWave = sin(uv.x * 12.0 + uv.y * 8.0 + uTime * 2.0 + uMouse.x * 3.0);
          vec3 iridTeal = vec3(0.16, 0.65, 0.72);
          vec3 iridEmerald = vec3(0.12, 0.75, 0.45);
          vec3 iridViolet = vec3(0.68, 0.32, 0.85);
          vec3 iridAmber = vec3(0.95, 0.62, 0.15);
          vec3 iridColor = mix(iridTeal, iridEmerald, (shimmerWave + 1.0) * 0.5);
          iridColor = mix(iridColor, iridViolet, sin(uTime * 1.5 + uv.y * 10.0) * 0.5 + 0.5);
          iridColor = mix(iridColor, iridAmber, cos(uTime * 0.8 + uv.x * 6.0) * 0.4 + 0.4);
          float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 enhancedColor = texColor.rgb + (iridColor * 0.22 * smoothstep(0.4, 0.9, luminance) * uIridescence);
          vec2 heartUv = vec2(uHeartPos.x, 1.0 - uHeartPos.y);
          float distToHeart = distance(uv, heartUv);
          float heartPulse = (sin(uTime * 6.28 * 1.2) * 0.5 + 0.5) * uHeartbeat;
          float heartGlow = exp(-distToHeart * 18.0) * (0.8 + heartPulse * 0.5);
          vec3 goldenHeartColor = vec3(1.0, 0.82, 0.3) * heartGlow * 1.2;
          vec3 finalRgb = mix(mistyColor, enhancedColor, clamp(revealMask + 0.15, 0.0, 1.0));
          finalRgb += goldenHeartColor * clamp(revealMask * 1.5, 0.3, 1.0);
          float vignette = 1.0 - smoothstep(0.5, 1.4, length(uv - 0.5));
          finalRgb *= mix(0.75, 1.0, vignette);
          gl_FragColor = vec4(finalRgb, 1.0);
        }
      `;

      const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uRevealRadius: { value: targetSpotlightRadius.current },
          uSpotlightPos: { value: new THREE.Vector2(targetSpotlightPos.current[0], targetSpotlightPos.current[1]) },
          uHeartPos: { value: new THREE.Vector2(creature.heartPosition[0], creature.heartPosition[1]) },
          uHeartbeat: { value: 1.0 },
          uIridescence: { value: 1.0 },
          uIsRevealed: { value: isRevealed ? 1.0 : 0.0 },
          uMouse: { value: new THREE.Vector2(0, 0) }
        }
      });
      materialRef.current = shaderMaterial;

      const planeGeo = new THREE.PlaneGeometry(1.6, 2.84, 32, 32);
      planeMesh = new THREE.Mesh(planeGeo, shaderMaterial);
      planeMesh.position.y = 0.12;
      scene.add(planeMesh);

      setIsLoaded(true);
    });

    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleShifts = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5 + 0.5;
      particleScales[i] = Math.random() * 0.8 + 0.4;
      particleShifts[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));
    particleGeo.setAttribute('shift', new THREE.BufferAttribute(particleShifts, 1));

    const particleVertexShader = `
      attribute float scale;
      attribute float shift;
      uniform float uTime;
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        vec3 pos = position;
        pos.x += sin(uTime * 0.8 + shift) * 0.12;
        pos.y += cos(uTime * 0.6 + shift * 1.5) * 0.15;
        pos.z += sin(uTime * 0.5 + shift) * 0.08;
        vAlpha = (sin(uTime * 2.0 + shift * 3.0) * 0.4 + 0.6) * 0.9;
        vColor = mix(vec3(1.0, 0.85, 0.4), vec3(0.95, 0.55, 0.15), sin(shift + uTime) * 0.5 + 0.5);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = scale * (38.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const particleFragmentShader = `
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float strength = exp(-d * 6.5);
        gl_FragColor = vec4(vColor, strength * vAlpha);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      currentSpotlightRadius.current += (targetSpotlightRadius.current - currentSpotlightRadius.current) * 0.08;
      currentSpotlightPos.current[0] += (targetSpotlightPos.current[0] - currentSpotlightPos.current[0]) * 0.08;
      currentSpotlightPos.current[1] += (targetSpotlightPos.current[1] - currentSpotlightPos.current[1]) * 0.08;
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.06;

      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      if (cameraRef.current) {
        cameraRef.current.position.z = 2.4 / currentZoomRef.current;
        cameraRef.current.position.x = (mousePos.current.x * 0.15) + (currentSpotlightPos.current[0] - 0.5) * (currentZoomRef.current - 1.0) * 0.8;
        cameraRef.current.position.y = (mousePos.current.y * 0.15) - (currentSpotlightPos.current[1] - 0.5) * (currentZoomRef.current - 1.0) * 0.8;
        cameraRef.current.lookAt(
          (currentSpotlightPos.current[0] - 0.5) * 0.4 * (currentZoomRef.current - 1.0),
          -(currentSpotlightPos.current[1] - 0.5) * 0.4 * (currentZoomRef.current - 1.0),
          0
        );
      }

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsedTime;
        materialRef.current.uniforms.uRevealRadius.value = currentSpotlightRadius.current;
        materialRef.current.uniforms.uSpotlightPos.value.set(currentSpotlightPos.current[0], currentSpotlightPos.current[1]);
        materialRef.current.uniforms.uIsRevealed.value = isRevealed ? 1.0 : 0.0;
        materialRef.current.uniforms.uMouse.value.set(mousePos.current.x, mousePos.current.y);
      }

      if (particleMaterial) { particleMaterial.uniforms.uTime.value = elapsedTime; }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); }
      resizeObserver.disconnect();
      if (activeTexture) activeTexture.dispose();
      if (planeMesh) { planeMesh.geometry.dispose(); }
      if (materialRef.current) { materialRef.current.dispose(); }
      particleGeo.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [creature]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePos.current.targetX = x;
    mousePos.current.targetY = y;
  };

  const handlePointerLeave = () => {
    mousePos.current.targetX = 0;
    mousePos.current.targetY = 0;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    const distToHeart = Math.hypot(clickX - creature.heartPosition[0], clickY - creature.heartPosition[1]);
    if (distToHeart < 0.16) {
      soundFx.playHeartbeat();
      if (onHeartClick) onHeartClick();
    } else {
      soundFx.playTap();
    }
  };

  return (
    <div ref={containerRef} id="three-forest-viewport" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onClick={handleClick} className="relative w-full h-full overflow-hidden cursor-crosshair touch-none select-none rounded-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#18231c] text-[#E2B64C] z-10 pointer-events-none">
          <div className="w-10 h-10 border-3 border-[#E2B64C] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-serif tracking-wide text-[#E8821A]">Despertando a floresta...</p>
        </div>
      )}
    </div>
  );
};
