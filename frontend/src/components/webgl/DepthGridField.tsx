import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vElevation;

  void main() {
    vec3 pos = position;
    float dist = distance(uv, uMouse * 0.5 + 0.5);
    float ripple = sin(dist * 18.0 - uTime * 1.4) * 0.12 * smoothstep(0.6, 0.0, dist);
    float wave = sin(pos.x * 1.4 + uTime * 0.25) * cos(pos.y * 1.1 + uTime * 0.18) * 0.18;
    pos.z += wave + ripple;
    vElevation = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const FRAGMENT_SHADER = `
  varying float vElevation;
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;

  void main() {
    float t = smoothstep(-0.2, 0.3, vElevation);
    vec3 color = mix(uColorLow, uColorHigh, t);
    gl_FragColor = vec4(color, 0.12 + t * 0.1);
  }
`

function DepthGrid() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseCurrent = useRef(new THREE.Vector2(0, 0))

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      mouseCurrent.current.lerp(new THREE.Vector2(state.pointer.x, state.pointer.y), 0.04)
      materialRef.current.uniforms.uMouse.value = mouseCurrent.current
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2.6, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[14, 14, 60, 60]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uColorLow: { value: new THREE.Color('#120d1f') },
          uColorHigh: { value: new THREE.Color('#7c3aed') },
        }}
        wireframe
        transparent
      />
    </mesh>
  )
}

export function DepthGridField({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [0, 2.2, 4.5], fov: 60 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <DepthGrid />
        </Suspense>
      </Canvas>
    </div>
  )
}
