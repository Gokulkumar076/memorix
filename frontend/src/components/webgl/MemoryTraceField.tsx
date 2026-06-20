import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * MemoryTrace — the signature visual of Memorix.
 *
 * Particles represent memory traces: bright + tight when "fresh" (just reviewed),
 * drifting outward and dimming as they "decay" over a simulated cycle, then
 * snapping back bright — visually enacting the forgetting curve the whole
 * product is built around. Cursor proximity locally "reinforces" nearby
 * particles (brightens + pulls them in), echoing the act of recall.
 */

const PARTICLE_COUNT = 900
const VERTEX_SHADER = `
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  varying float vDecay;

  void main() {
    // decay cycle: 0 = just reviewed (tight/bright), 1 = fully decayed (drifted/dim)
    float cycle = fract(uTime * aSpeed * 0.05 + aPhase);
    vDecay = cycle;

    vec3 pos = position;
    // drift outward radially as it decays
    float drift = cycle * 1.6;
    pos += normalize(position + 0.001) * drift;
    // gentle ambient bob
    pos.y += sin(uTime * 0.3 + aPhase * 6.28) * 0.08;
    pos.x += cos(uTime * 0.25 + aPhase * 6.28) * 0.06;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // cursor proximity reinforcement
    vec4 projected = projectionMatrix * mvPosition;
    vec2 screenPos = projected.xy / projected.w;
    float distToMouse = distance(screenPos, uMouse);
    float reinforce = smoothstep(0.5, 0.0, distToMouse) * uMouseInfluence;
    vDecay = max(0.0, vDecay - reinforce * 0.8);

    gl_PointSize = aSize * (1.0 - cycle * 0.4) * (1.0 + reinforce * 1.5) * (300.0 / -mvPosition.z);
    gl_Position = projected;
  }
`

const FRAGMENT_SHADER = `
  varying float vDecay;
  uniform vec3 uColorFresh;
  uniform vec3 uColorDecayed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float dist = length(c);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist);
    vec3 color = mix(uColorFresh, uColorDecayed, vDecay);
    float opacity = mix(0.95, 0.18, vDecay) * alpha;
    gl_FragColor = vec4(color, opacity);
  }
`

function TraceField({ density = 1 }: { density?: number }) {
  const meshRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseTarget = useRef(new THREE.Vector2(0, 0))
  const mouseCurrent = useRef(new THREE.Vector2(0, 0))

  const count = Math.round(PARTICLE_COUNT * density)

  const [positions, phases, speeds, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const speeds = new Float32Array(count)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 4.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
      phases[i] = Math.random()
      speeds[i] = 0.4 + Math.random() * 1.2
      sizes[i] = 6 + Math.random() * 14
    }
    return [positions, phases, speeds, sizes]
  }, [count])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      mouseTarget.current.set(
        (state.pointer.x),
        (state.pointer.y)
      )
      mouseCurrent.current.lerp(mouseTarget.current, 0.06)
      materialRef.current.uniforms.uMouse.value = mouseCurrent.current
      materialRef.current.uniforms.uMouseInfluence.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMouseInfluence.value,
        0.85,
        0.05
      )
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uMouseInfluence: { value: 0 },
          uColorFresh: { value: new THREE.Color('#22d3ee') },
          uColorDecayed: { value: new THREE.Color('#7c3aed') },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface MemoryTraceFieldProps {
  className?: string
  density?: number
  interactive?: boolean
}

export function MemoryTraceField({ className, density = 1 }: MemoryTraceFieldProps) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <TraceField density={density} />
        </Suspense>
      </Canvas>
    </div>
  )
}
