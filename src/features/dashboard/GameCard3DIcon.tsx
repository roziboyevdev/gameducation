import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { MeshStandardMaterial } from 'three';
import type { RefObject } from 'react';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

export type GameCardIconVariant = 'solo' | 'battle' | 'brain';

export function GameCard3DIcon({ variant }: { variant: GameCardIconVariant }) {
  return (
    <div className="pointer-events-none h-[92px] w-full shrink-0 select-none [-webkit-tap-highlight-color:transparent]">
      <Canvas
        camera={{ position: [0, 0.02, 2.55], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.52} />
        <directionalLight position={[3.2, 4.5, 3.5]} intensity={1.05} />
        <directionalLight position={[-2.8, 2.2, -1.6]} intensity={0.42} color="#dbe4ff" />
        {variant === 'solo' ? <SoloCalculatorScene /> : null}
        {variant === 'battle' ? <BattleArenaScene /> : null}
        {variant === 'brain' ? <BrainIdeaScene /> : null}
      </Canvas>
    </div>
  );
}

function useIdleMotion(group: RefObject<Group | null>) {
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.6) * 0.14;
    g.rotation.x = Math.cos(t * 0.46) * 0.058;
  });
}

/** Kalkulyator + formula bloklari */
function SoloCalculatorScene() {
  const root = useRef<Group>(null);
  const lcdRef = useRef<Mesh>(null);

  useIdleMotion(root);
  useFrame((state) => {
    const g = root.current;
    if (g) g.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.038;
    const lcd = lcdRef.current;
    if (lcd?.material && !Array.isArray(lcd.material)) {
      const m = lcd.material as MeshStandardMaterial;
      const pulse = 0.52 + Math.sin(state.clock.elapsedTime * 2.3) * 0.14;
      m.emissiveIntensity = pulse;
    }
  });

  const keysLayout = [-0.32, -0.11, 0.11, 0.32];
  const keyColors = ['#22d3ee', '#818cf8', '#fbbf24', '#f472b6'];

  return (
    <group ref={root}>
      <group rotation={[0.18, -0.28, 0]}>
        <RoundedBox args={[1, 0.72, 0.22]} radius={0.09} smoothness={5} position={[0, -0.02, 0]}>
          <meshPhysicalMaterial color="#334155" roughness={0.42} metalness={0.18} clearcoat={0.35} />
        </RoundedBox>

        <RoundedBox args={[0.78, 0.22, 0.03]} radius={0.03} smoothness={3} position={[0, 0.22, 0.12]}>
          <meshStandardMaterial color="#042f2e" roughness={0.35} metalness={0.12} />
        </RoundedBox>

        <mesh ref={lcdRef} position={[0, 0.22, 0.135]}>
          <planeGeometry args={[0.58, 0.12]} />
          <meshStandardMaterial
            color="#5eead4"
            emissive="#2dd4bf"
            emissiveIntensity={0.52}
            roughness={0.4}
          />
        </mesh>

        <mesh position={[-0.14, 0.22, 0.14]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.16, 0.01]} />
          <meshStandardMaterial color="#ccfbf1" emissive="#5eead4" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.12, 0.22, 0.14]}>
          <boxGeometry args={[0.16, 0.04, 0.01]} />
          <meshStandardMaterial color="#ccfbf1" emissive="#5eead4" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0.12, 0.26, 0.14]}>
          <boxGeometry args={[0.04, 0.12, 0.01]} />
          <meshStandardMaterial color="#ccfbf1" emissive="#5eead4" emissiveIntensity={0.45} />
        </mesh>

        {keysLayout.map((x, i) => (
          <RoundedBox
            key={i}
            args={[0.16, 0.1, 0.04]}
            radius={0.025}
            smoothness={3}
            position={[x, -0.18, 0.12]}
          >
            <meshPhysicalMaterial
              color={keyColors[i] ?? '#94a3b8'}
              roughness={0.32}
              metalness={0.1}
              clearcoat={0.4}
            />
          </RoundedBox>
        ))}

        <mesh position={[-0.38, -0.32, 0.08]} rotation={[0.2, -0.3, -0.1]}>
          <boxGeometry args={[0.2, 0.08, 0.055]} />
          <meshPhysicalMaterial color="#fcd34d" roughness={0.45} clearcoat={0.2} />
        </mesh>
        <mesh position={[0.42, -0.3, -0.02]} rotation={[-0.15, 0.25, 0.08]}>
          <boxGeometry args={[0.16, 0.09, 0.05]} />
          <meshPhysicalMaterial color="#a5b4fc" roughness={0.48} clearcoat={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/** Metall qilar kesishgan va markazda “versus” medallion */
function BattleArenaScene() {
  const root = useRef<Group>(null);
  const medal = useRef<Group>(null);

  useIdleMotion(root);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (root.current) root.current.position.y = Math.sin(t * 1.08) * 0.026;
    if (medal.current) medal.current.rotation.z = Math.sin(t * 1.5) * 0.06;
  });

  return (
    <group ref={root}>
      <group rotation={[0.1, -0.18, 0]}>
        <group position={[0, 0.04, 0]}>
          <Sword tilt={Math.PI / 3.85} bladeColor="#e2e8f0" hiltGold="#fbbf24" guardColor="#a16207" zLift={0.02} />
          <Sword tilt={-Math.PI / 3.85} bladeColor="#bfdbfe" hiltGold="#38bdf8" guardColor="#1e40af" zLift={0.045} />
        </group>

        <group ref={medal} position={[0.02, -0.12, 0.26]} rotation={[0.2, -0.1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.09, 0.038, 24]} />
            <meshPhysicalMaterial color="#1e293b" roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.001, 0.022]}>
            <boxGeometry args={[0.07, 0.014, 0.01]} />
            <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.42} />
          </mesh>
          <mesh position={[0, -0.02, -0.035]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[0.068, 0.048, 0.026]} />
            <meshPhysicalMaterial color="#fb923c" roughness={0.4} metalness={0.15} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Sword({
  tilt,
  bladeColor,
  hiltGold,
  guardColor,
  zLift,
}: {
  tilt: number;
  bladeColor: string;
  hiltGold: string;
  guardColor: string;
  zLift: number;
}) {
  return (
    <group rotation={[0, 0, tilt]} position={[0, 0, zLift]}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.068, 0.58, 0.026]} />
        <meshPhysicalMaterial color={bladeColor} roughness={0.26} metalness={0.55} clearcoat={0.52} />
      </mesh>
      <mesh castShadow position={[0, 0.58, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.022]} />
        <meshPhysicalMaterial color={bladeColor} roughness={0.18} metalness={0.75} clearcoat={0.6} />
      </mesh>
      <mesh castShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[0.22, 0.042, 0.05]} />
        <meshPhysicalMaterial color={guardColor} roughness={0.48} metalness={0.22} clearcoat={0.25} />
      </mesh>
      <mesh castShadow position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.042, 0.052, 0.16, 12]} />
        <meshPhysicalMaterial color={hiltGold} roughness={0.38} metalness={0.35} clearcoat={0.35} />
      </mesh>
      <mesh castShadow position={[0, -0.28, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshPhysicalMaterial color={hiltGold} roughness={0.32} metalness={0.4} clearcoat={0.45} />
      </mesh>
    </group>
  );
}

/** Miya shakli + ustida g‘oya lampochkasi */
function BrainIdeaScene() {
  const root = useRef<Group>(null);
  const bulb = useRef<Group>(null);

  useIdleMotion(root);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (root.current) root.current.position.y = Math.sin(t * 0.95) * 0.03;
    if (bulb.current) {
      bulb.current.position.y = 0.58 + Math.sin(t * 1.7) * 0.03;
      const s = 1 + Math.sin(t * 2.1) * 0.04;
      bulb.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={root}>
      <group rotation={[0.12, -0.22, 0]}>
        <mesh castShadow position={[-0.16, 0.02, 0]} scale={[0.95, 1.05, 0.78]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshPhysicalMaterial color="#f9a8d4" roughness={0.44} metalness={0.05} clearcoat={0.32} />
        </mesh>
        <mesh castShadow position={[0.16, 0.02, 0]} scale={[0.95, 1.05, 0.78]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshPhysicalMaterial color="#e879f9" roughness={0.44} metalness={0.05} clearcoat={0.32} />
        </mesh>

        {/* markaziy “chalqash” */}
        {[0.05, -0.02, -0.08].map((y, idx) => (
          <mesh key={idx} position={[0, y, -0.12]} scale={[0.38, 0.22, 0.62]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshPhysicalMaterial color="#fbcfe8" roughness={0.5} metalness={0.04} clearcoat={0.25} />
          </mesh>
        ))}

        <mesh position={[0, 0.18, -0.02]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.065, 0.018, 8, 20]} />
          <meshStandardMaterial color="#be185d" roughness={0.55} />
        </mesh>
      </group>

      <group ref={bulb} position={[0, 0.58, -0.02]}>
        <mesh rotation={[Math.PI / 12, 0, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshPhysicalMaterial
            color="#fffbeb"
            roughness={0.12}
            metalness={0}
            transmission={0.82}
            thickness={0.35}
            ior={1.42}
            transparent
          />
        </mesh>
        <mesh rotation={[Math.PI / 12, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.65} transparent opacity={0.96} />
        </mesh>

        <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.068, 0.095, 0.092, 10]} />
          <meshPhysicalMaterial color="#94a3b8" roughness={0.28} metalness={0.45} />
        </mesh>

        {[0.08, -0.02, -0.1].map((dz, idx) => (
          <RoundedBox key={idx} args={[0.018, 0.03, 0.012]} radius={0.004} smoothness={2} position={[0.02, -0.25, dz]}>
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </RoundedBox>
        ))}
      </group>

      {/* kichik xotira “kartochkalari” */}
      {[0.45, -0.48].map((x, idx) => (
        <RoundedBox key={idx} args={[0.16, 0.2, 0.03]} radius={0.022} smoothness={2} position={[x, -0.12, idx === 0 ? 0.1 : -0.08]} rotation={[0.12, idx === 0 ? -0.3 : 0.28, idx === 0 ? 0.1 : -0.12]}>
          <meshPhysicalMaterial color={idx === 0 ? '#c084fc' : '#34d399'} roughness={0.5} metalness={0.08} />
        </RoundedBox>
      ))}
    </group>
  );
}
