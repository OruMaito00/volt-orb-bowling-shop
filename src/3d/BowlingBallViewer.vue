<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

// EXR HDRI used for PBR environment lighting (reflections + ambient)
const HDRI_PATH = `${import.meta.env.BASE_URL}images/hdri/aft_lounge_1k.exr`

const props = defineProps<{
  src: string
  poster: string
  alt: string
  cameraPosition?: { x: number; y: number; z: number }
  cameraTarget?: { x: number; y: number; z: number }
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const showPoster = ref(true)   // 2D photo shows until the model is ready, or as fallback if 3D fails
const showHint = ref(false)     // "Drag to rotate" hint
const showFallback = ref(false) // true = WebGL missing or model load failed

// Three.js handles kept as module-scope lets so onBeforeUnmount can dispose them
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null
let disposed = false // guard so async callbacks can't write to a torn-down scene
let modelRoot: THREE.Object3D | null = null // current GLB root, tracked so we can remove it on prop change

// When the model URL changes (e.g. navigating between bowling balls
// via the "You may also like" carousel), swap the 3D model in-place.
watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (newSrc !== oldSrc) swapModel()
  }
)

function swapModel() {
  if (disposed) return

  // Remove + dispose the previous model
  if (modelRoot && scene) {
    scene.remove(modelRoot)
    modelRoot.traverse(disposeObject)
    modelRoot = null
  }

  // Reset UI state for the new load
  showPoster.value = true
  showFallback.value = false
  showHint.value = false

  // Load the new GLB
  loadModel()
}

onMounted(() => {
  if (!containerRef.value) return

  // Feature-detect WebGL before creating any Three.js objects
  const testCanvas = document.createElement('canvas')
  const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
  if (!gl) {
    showFallback.value = true
    return
  }

  initScene()
  loadEnvironment() // HDRI lighting (async, non-blocking)
  loadModel()         // GLB + Draco (async, shows poster until done)
  startResizeObserver()
})

function initScene() {
  const container = containerRef.value!
  const width = container.clientWidth || 400
  const height = container.clientHeight || 400

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // cap at 2x for perf
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.8
  renderer.domElement.classList.add('ball-viewer__canvas')
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 3) // placeholder; repositioned after model loads

  // Drag-to-rotate, no pan, damped for smooth feel
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.5
  controls.enablePan = false
  controls.minDistance = 1
  controls.maxDistance = 10
  controls.addEventListener('start', () => {
    showHint.value = false
    if (renderer) renderer.domElement.style.cursor = 'grabbing'
  })
  controls.addEventListener('end', () => {
    if (renderer) renderer.domElement.style.cursor = 'grab'
  })

  renderer.domElement.style.cursor = 'grab'
  animate()
}

function loadEnvironment() {
  // EXR → PMREM-converted env map for PBR reflections/ambient
  const exrLoader = new EXRLoader()
  exrLoader.load(
    HDRI_PATH,
    (texture) => {
      if (disposed) {
        texture.dispose()
        return
      }
      texture.mapping = THREE.EquirectangularReflectionMapping
      const pmrem = new THREE.PMREMGenerator(renderer!)
      const envMap = pmrem.fromEquirectangular(texture).texture
      scene!.environment = envMap
      texture.dispose()
      pmrem.dispose()
    },
    undefined,
    (err) => {
      if (disposed) return
      console.error('BowlingBallViewer: HDRI load failed', err)
    },
  )
}

function loadModel() {
  // GLTFLoader + DRACOLoader (self-hosted decoder to avoid CDN CORS)
  const loader = new GLTFLoader()
  const draco = new DRACOLoader()
  draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`)
  loader.setDRACOLoader(draco)

  loader.load(
    props.src,
    (gltf) => {
      if (disposed) {
        gltf.scene.traverse(disposeObject)
        return
      }
      const model = gltf.scene

      // Center the model at the origin so OrbitControls target (0,0,0) works
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)

      model.position.x -= center.x
      model.position.y -= center.y
      model.position.z -= center.z

      // Auto-framing: compute distance so the model fits the FOV, with 30% padding
      const radius = Math.max(size.x, size.y, size.z) / 2 || 1
      const fovRad = (camera!.fov * Math.PI) / 180
      const autoDistance = (radius / Math.sin(fovRad / 2)) * 1.3

      // Manual camera override wins; otherwise auto-frame from the bounding box
      if (props.cameraPosition) {
        camera!.position.set(
          props.cameraPosition.x,
          props.cameraPosition.y,
          props.cameraPosition.z,
        )
      } else {
        camera!.position.set(0, 0, autoDistance)
      }

      camera!.near = autoDistance / 100
      camera!.far = autoDistance * 100
      camera!.updateProjectionMatrix()

      controls!.maxDistance = autoDistance * 3
      controls!.minDistance = autoDistance / 3

      if (props.cameraTarget) {
        controls!.target.set(
          props.cameraTarget.x,
          props.cameraTarget.y,
          props.cameraTarget.z,
        )
      } else {
        controls!.target.set(0, 0, 0)
      }
      controls!.update()

      modelRoot = model
      scene!.add(model)
      showPoster.value = false // model ready — hide the 2D placeholder
      showHint.value = true
    },
    undefined,
    (err) => {
      if (disposed) return
      console.error('BowlingBallViewer: model load failed', err)
      modelRoot = null
      showFallback.value = true
    },
  )
}

function animate() {
  // rAF loop — damped OrbitControls need update() every tick
  animationId = requestAnimationFrame(animate)
  if (controls && renderer && scene && camera) {
    controls.update()
    renderer.render(scene, camera)
  }
}

function startResizeObserver() {
  if (!containerRef.value) return
  resizeObserver = new ResizeObserver(() => {
    if (!containerRef.value || !renderer || !camera) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    if (width === 0 || height === 0) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
  resizeObserver.observe(containerRef.value)
}

// Free GPU memory for a mesh's geometry + material(s)
function disposeObject(obj: THREE.Object3D) {
  if (obj instanceof THREE.Mesh) {
    obj.geometry?.dispose()
    const mat = obj.material
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else if (mat) mat.dispose()
  }
}

onBeforeUnmount(() => {
  // Flip the guard first so any in-flight async load callback no-ops
  disposed = true
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  resizeObserver?.disconnect()
  resizeObserver = null

  if (controls) {
    controls.dispose()
    controls = null
  }
  if (scene) {
    if (modelRoot) {
      scene.remove(modelRoot)
      modelRoot.traverse(disposeObject)
      modelRoot = null
    }
    const env = scene.environment
    if (env && 'dispose' in env) (env as THREE.Texture).dispose()
    scene = null
  }
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer = null
  }
})
</script>

<template>
  <div ref="containerRef" class="ball-viewer">
    <!-- 2D photo shows while the 3D model loads, or as a fallback if it fails -->
    <img
      v-if="showPoster || showFallback"
      :src="poster"
      :alt="alt"
      class="ball-viewer__poster"
    />
    <p v-if="showFallback" class="ball-viewer__error">3D preview unavailable</p>
    <!-- Hint fades out after a few seconds — see keyframes below -->
    <p v-if="showHint" class="ball-viewer__hint" aria-hidden="true">Drag to rotate</p>
  </div>
</template>

<style scoped lang="scss">
.ball-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  min-height: 300px;
}

.ball-viewer__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.ball-viewer__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--spacing-lg);
  z-index: 1;
}

.ball-viewer__error {
  position: absolute;
  bottom: var(--spacing-sm);
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  z-index: 2;
}

.ball-viewer__hint {
  position: absolute;
  bottom: var(--spacing-sm);
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  pointer-events: none;
  background: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  z-index: 2;
  animation: ball-viewer__hint-fade 4s ease-out forwards;
}

@keyframes ball-viewer__hint-fade {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ball-viewer__hint {
    animation: none;
    opacity: 0;
  }
}
</style>
