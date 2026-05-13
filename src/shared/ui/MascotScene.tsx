import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import { cn } from '@/shared/lib/cn';

type Props = {
  className?: string;
  /** true bo‘lsa fon gradienti yo‘q — tashqi layout mesh-gradient ko‘rinadi */
  transparentBackdrop?: boolean;
  /**
   * Oq studiya sahna: qat’iy #fff fon va pastdan yumshoq kulrang soyada chiqarish (UI mockup uchun).
   */
  studioStage?: boolean;
};

export function MascotScene({ className, transparentBackdrop, studioStage }: Props) {
  const backdropClass = studioStage
    ? 'bg-white'
    : transparentBackdrop
      ? 'bg-transparent'
      : 'bg-gradient-to-br from-[#e8eeff] via-white to-[#f6e9ff]';

  return (
    <div className={cn('overflow-hidden', backdropClass, className)}>
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 0.1, studioStage ? 4.05 : 3.45],
          fov: 40,
        }}
      >
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={studioStage ? 0.62 : 0.55} />
        <directionalLight position={[4.2, 6.5, 4.5]} intensity={studioStage ? 0.92 : 1.05} castShadow />
        <directionalLight position={[-3.5, 3, -2]} intensity={0.35} color="#d4e2ff" />
        <pointLight position={[0.8, 1.6, 1.8]} intensity={0.45} color="#fff4cc" distance={8} decay={2} />
        <Suspense fallback={null}>
          <ScholarBuddy studio={studioStage} />
          <Environment
            preset={studioStage ? 'studio' : 'city'}
            {...(studioStage ? { environmentIntensity: 0.48 } : {})}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** O‘yin + o‘qish: kalpak, diplom qalqoni, ochiq kitob bilan do‘st karakter */
function ScholarBuddy({ studio }: { studio?: boolean }) {
  const root = useRef<Group>(null);
  const book = useRef<Group>(null);
  const shield = useRef<Group>(null);

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.62) * 0.26;
    g.rotation.z = Math.sin(t * 0.28) * 0.05;
    g.position.y = Math.sin(t * 1.05) * 0.06;

    if (book.current) {
      book.current.rotation.z = Math.sin(t * 1.4) * 0.04;
      book.current.rotation.x = 0.12 + Math.sin(t * 0.9) * 0.03;
    }

    if (shield.current) {
      shield.current.rotation.z = Math.sin(t * 0.85) * 0.04;
    }
  });

  const clay = (
    roughness = 0.38,
    clearcoat = 0.42,
    metalness = 0.06,
  ): object => ({
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness: 0.35,
  });

  return (
    <group ref={root} position={[0, -0.18, 0]}>
      {/* Pastki «pol» — studiyada kulrang ellips soya, aks holda yengil ko‘k platforma */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} scale={studio ? [1.12, 1, 0.36] : [1, 1, 1]}>
        <circleGeometry args={[studio ? 1.02 : 1.15, studio ? 64 : 40]} />
        {studio ? (
          <meshBasicMaterial color="#d7dbe6" transparent opacity={0.42} depthWrite={false} />
        ) : (
          <meshStandardMaterial color="#eef1ff" roughness={0.85} metalness={0} />
        )}
      </mesh>

      {/* Diplom / g‘alaba qalqoni */}
      <group ref={shield} position={[-0.95, 0.15, -0.35]} rotation={[0.12, 0.35, -0.08]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.42, 0.48, 0.06, 5]} />
          <meshPhysicalMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.12} {...clay()} />
        </mesh>
        <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <circleGeometry args={[0.09, 20]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.4} />
        </mesh>
      </group>

      {/* Tanasi */}
      <RoundedBox args={[0.92, 0.78, 0.72]} radius={0.26} smoothness={6} castShadow receiveShadow position={[0, -0.12, 0]}>
        <meshPhysicalMaterial color="#6f7dff" {...clay(0.41, 0.38)} />
      </RoundedBox>

      {/* Qisqa qo‘ylar */}
      <mesh castShadow position={[-0.52, -0.02, 0.18]} rotation={[0.35, -0.2, 0.45]}>
        <capsuleGeometry args={[0.08, 0.22, 6, 8]} />
        <meshPhysicalMaterial color="#8794ff" {...clay()} />
      </mesh>
      <mesh castShadow position={[0.52, -0.02, 0.18]} rotation={[0.35, 0.2, -0.45]}>
        <capsuleGeometry args={[0.08, 0.22, 6, 8]} />
        <meshPhysicalMaterial color="#8794ff" {...clay()} />
      </mesh>

      {/* Bosh */}
      <mesh castShadow position={[0, 0.62, 0.08]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshPhysicalMaterial color="#aab6ff" {...clay(0.35, 0.55)} />
      </mesh>

      {/* Qornidan oldinga chiqadigan ochiq kitob */}
      <group ref={book} position={[0, -0.05, 0.58]} rotation={[0.18, 0, 0]}>
        <RoundedBox args={[0.72, 0.08, 0.48]} radius={0.02} smoothness={3} castShadow position={[0, 0.02, 0]}>
          <meshPhysicalMaterial color="#fde68a" {...clay(0.5, 0.15)} />
        </RoundedBox>
        <RoundedBox args={[0.62, 0.01, 0.41]} radius={0.01} smoothness={2} position={[0, 0.06, -0.01]}>
          <meshStandardMaterial color="#fffef5" roughness={0.9} />
        </RoundedBox>
        {/* sahifa bo‘laklari */}
        {[0.12, 0, -0.12].map((x, i) => (
          <mesh key={i} position={[x * 2.8, 0.07, -0.01]}>
            <boxGeometry args={[0.035, 0.004, 0.38]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Bitiruv qalpoqchasi */}
      <group position={[0, 1.06, -0.02]} rotation={[-0.08, Math.sin(Math.PI / 12), 0.05]}>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.54, 0.54, 0.085, 32]} />
          <meshPhysicalMaterial color="#4338ca" {...clay(0.32, 0.45)} />
        </mesh>
        <mesh castShadow position={[0.22, 0.12, -0.12]} rotation={[0.85, -0.2, 0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.52, 8]} />
          <meshPhysicalMaterial color="#fcd34d" {...clay(0.46, 0.2)} />
        </mesh>
        {/* Mortarbo‘rd yumaloq */}
        <mesh castShadow position={[0.05, 0.06, -0.32]} rotation={[-Math.PI / 2.55, 0, 0.12]}>
          <boxGeometry args={[0.86, 0.86, 0.065]} />
          <meshPhysicalMaterial color="#4338ca" {...clay(0.38, 0.35)} />
        </mesh>
      </group>

      {/* Quloqchini / gamer vibe */}
      <mesh castShadow position={[-0.58, 0.58, 0]}>
        <sphereGeometry args={[0.115, 20, 20]} />
        <meshPhysicalMaterial color="#5c6bc0" {...clay()} />
      </mesh>
      <mesh castShadow position={[0.58, 0.58, 0]}>
        <sphereGeometry args={[0.115, 20, 20]} />
        <meshPhysicalMaterial color="#5c6bc0" {...clay()} />
      </mesh>
      <mesh position={[0, 0.8, -0.4]}>
        <boxGeometry args={[1.42, 0.06, 0.065]} />
        <meshPhysicalMaterial color="#3949ab" {...clay(0.45, 0.2)} />
      </mesh>

      {/* Yuz */}
      <mesh position={[0.22, 0.58, 0.52]}>
        <sphereGeometry args={[0.068, 12, 12]} />
        <meshPhysicalMaterial color="#fda4af" {...clay(0.62, 0.15)} />
      </mesh>
      <mesh position={[-0.22, 0.58, 0.52]}>
        <sphereGeometry args={[0.068, 12, 12]} />
        <meshPhysicalMaterial color="#fda4af" {...clay(0.62, 0.15)} />
      </mesh>

      {/* Ko‘zlar */}
      <mesh castShadow position={[0.21, 0.66, 0.48]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0} clearcoat={0.4} />
      </mesh>
      <mesh castShadow position={[-0.21, 0.66, 0.48]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0} clearcoat={0.4} />
      </mesh>
      <mesh position={[0.24, 0.65, 0.58]}>
        <sphereGeometry args={[0.048, 12, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.92} />
      </mesh>
      <mesh position={[-0.18, 0.65, 0.58]}>
        <sphereGeometry args={[0.048, 12, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.92} />
      </mesh>

      {/* Kichik kulgich */}
      <mesh position={[0, 0.48, 0.56]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.085, 0.018, 8, 20, Math.PI]} />
        <meshPhysicalMaterial color="#7c83ff" {...clay(0.45, 0.25)} />
      </mesh>
    </group>
  );
}
