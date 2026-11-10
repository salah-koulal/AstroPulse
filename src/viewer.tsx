import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scan,
  Pause,
  Play,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { requiredMeshes, systems, type SystemId } from "./systems";
import StarField from "./StarField";

type ModelKind = "astronaut" | "anatomy";
type Asset = {
  scene: Group | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string;
};
type Props = {
  suit: boolean;
  selected: SystemId | null;
  onSelect: (id: SystemId) => void;
  reducedMotion: boolean;
};
type Controls = React.ComponentRef<typeof CameraControls>;
const paths = {
  astronaut: `${import.meta.env.BASE_URL}models/astronaut.glb`,
  anatomy: `${import.meta.env.BASE_URL}models/anatomy.glb`,
};

function disposeScene(scene: Group) {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material: Material) => material.dispose());
  });
}

function useAsset(kind: ModelKind, enabled: boolean) {
  const [asset, setAsset] = useState<Asset>({
    scene: null,
    status: "idle",
    error: "",
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    let scene: Group | null = null;
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    setAsset({ scene: null, status: "loading", error: "" });
    async function load() {
      try {
        const response = await fetch(paths[kind], {
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(`Download returned HTTP ${response.status}.`);
        const bytes = await response.arrayBuffer();
        if (new DataView(bytes).getUint32(0, true) !== 0x46546c67)
          throw new Error("The downloaded file is not a GLB model.");
        const gltf = await new GLTFLoader().parseAsync(bytes, "");
        scene = gltf.scene;
        if (kind === "anatomy") {
          const missing = requiredMeshes.filter(
            (name) => !scene!.getObjectByName(name),
          );
          if (missing.length)
            throw new Error(
              `Required anatomy meshes missing: ${missing.join(", ")}.`,
            );
        }
        if (active) setAsset({ scene, status: "ready", error: "" });
        else disposeScene(scene);
      } catch (error) {
        if (scene) disposeScene(scene);
        if (active)
          setAsset({
            scene: null,
            status: "error",
            error: controller.signal.aborted
              ? "The download timed out after 30 seconds."
              : error instanceof Error
                ? error.message
                : "The model could not be read.",
          });
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
      if (scene) disposeScene(scene);
    };
  }, [kind, enabled, attempt]);
  return { ...asset, retry: () => setAttempt((value) => value + 1) };
}

function Model({
  scene,
  kind,
  visible,
  selected,
  reducedMotion,
  onSelect,
}: { scene: Group; kind: ModelKind; visible: boolean } & Pick<
  Props,
  "selected" | "reducedMotion" | "onSelect"
>) {
  const opacity = useRef(0);
  const selectedMeshes = systems.find((system) => system.id === selected)
    ?.meshes as readonly string[] | undefined;
  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material: MeshStandardMaterial) => {
        material.transparent = true;
        material.depthWrite = false;
        const highlighted =
          kind === "anatomy" && !!selectedMeshes?.includes(object.name);
        if (material.color && !material.userData.baseColor)
          material.userData.baseColor = material.color.clone();
        if (material.color) material.color.copy(material.userData.baseColor);
        if (highlighted) material.color?.set("#5bc0de");
        material.emissive?.set(highlighted ? "#5bc0de" : "#000000");
        material.emissiveIntensity = highlighted ? 0.65 : 0;
        material.depthTest = !highlighted;
        object.renderOrder = highlighted ? 10 : 0;
        material.userData.targetOpacity =
          kind === "anatomy" && object.name === "Skeleton" && !highlighted
            ? 0.19
            : 1;
        material.needsUpdate = true;
      });
    });
  }, [scene, kind, selectedMeshes]);
  useFrame((_, delta) => {
    const target = visible ? 1 : 0;
    opacity.current = reducedMotion
      ? target
      : Math.max(
          0,
          Math.min(
            1,
            opacity.current +
              (Math.sign(target - opacity.current) * Math.min(delta, 0.1)) /
                0.24,
          ),
        );
    scene.visible = opacity.current > 0;
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material: Material) => {
        material.opacity =
          opacity.current * (material.userData.targetOpacity ?? 1);
      });
    });
  });
  function select(event: ThreeEvent<MouseEvent>) {
    if (kind !== "anatomy" || !visible || event.delta > 4) return;
    const system = systems.find((item) =>
      (item.meshes as readonly string[]).includes(event.object.name),
    );
    if (system) {
      event.stopPropagation();
      onSelect(system.id);
    }
  }
  return <primitive object={scene} dispose={null} onClick={select} />;
}

function ResponsiveLens() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = Math.max(
        35,
        (2 * Math.atan(1.25 / (4.8 * (size.width / size.height))) * 180) /
          Math.PI,
      );
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);
  return null;
}

function Rotation({
  controls,
  rotating,
}: {
  controls: RefObject<Controls | null>;
  rotating: boolean;
}) {
  useEffect(() => {
    void controls.current?.setLookAt(0, 1, 4.8, 0, 1, 0, false);
  }, [controls]);
  useFrame((_, delta) => {
    if (rotating) void controls.current?.rotate(delta * 0.22, 0, false);
  });
  return null;
}

class ViewerBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="viewer-message" role="alert">
        <h3>3D graphics unavailable</h3>
        <p>
          Enable WebGL or try another browser, then reload this page. Body
          readings remain available.
        </p>
        <button onClick={() => window.location.reload()}>Reload viewer</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function Viewer({
  suit,
  selected,
  onSelect,
  reducedMotion,
}: Props) {
  const [anatomyRequested, setAnatomyRequested] = useState(!suit);
  useEffect(() => {
    if (!suit) setAnatomyRequested(true);
  }, [suit]);
  const astronaut = useAsset("astronaut", true);
  const anatomy = useAsset("anatomy", anatomyRequested);
  const controls = useRef<Controls>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [rotating, setRotating] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const active = suit ? astronaut : anatomy;
  const activeName = suit ? "NASA astronaut" : "Z-Anatomy anatomy";
  const system = systems.find((item) => item.id === selected);
  const ready = active.status === "ready";
  const interactionReady = ready && !contextLost;
  function reset() {
    setRotating(false);
    void controls.current?.setLookAt(0, 1, 4.8, 0, 1, 0, false);
  }
  function recordCamera() {
    if (stage.current && controls.current) {
      const camera = controls.current.camera;
      stage.current.dataset.camera = [
        ...camera.position.toArray(),
        ...camera.quaternion.toArray(),
      ]
        .map((value) => value.toFixed(5))
        .join(",");
    }
  }
  return (
    <section className="viewer" aria-label="Interactive crew model">
      <StarField />
      <div className="stage-heading">
        <div>
          <span className="eyebrow">CREW EXPLORER</span>
          <h1>
            The human
            <br />
            <span>behind the mission.</span>
          </h1>
        </div>
        <span className="view-label">
          {suit ? "SUIT VIEW" : "ANATOMY VIEW"}
        </span>
      </div>
      <div
        className="model-stage"
        ref={stage}
        data-testid="model-stage"
        data-model={suit ? "astronaut" : "anatomy"}
        data-status={active.status}
        data-selection={selected ?? ""}
      >
        <div className="height-guide" aria-hidden="true">
          <span>HEAD</span>
          <i />
          <span>CORE</span>
          <i />
          <span>FEET</span>
        </div>
        <ViewerBoundary>
          <Canvas
            camera={{ position: [0, 1, 4.8], fov: 35, near: 0.05, far: 30 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.domElement.setAttribute(
                "aria-label",
                "3D astronaut and anatomy. Use the labeled controls to rotate and zoom.",
              );
              gl.domElement.addEventListener("webglcontextlost", () =>
                setContextLost(true),
              );
            }}
            fallback={
              <div className="viewer-message" role="alert">
                WebGL is unavailable. Enable graphics acceleration to view the
                requested models.
              </div>
            }
          >
            <ambientLight intensity={1.8} />
            <directionalLight
              position={[3, 4, 5]}
              intensity={3}
              color="#edf3f8"
            />
            <directionalLight
              position={[-3, 2, -2]}
              intensity={2.5}
              color="#5bc0de"
            />
            <directionalLight
              position={[0, 2, 4]}
              intensity={0.6}
              color="#f4d6b0"
            />
            {astronaut.scene && (
              <Model
                scene={astronaut.scene}
                kind="astronaut"
                visible={suit}
                selected={selected}
                reducedMotion={reducedMotion}
                onSelect={onSelect}
              />
            )}
            {anatomy.scene && (
              <Model
                scene={anatomy.scene}
                kind="anatomy"
                visible={!suit}
                selected={selected}
                reducedMotion={reducedMotion}
                onSelect={onSelect}
              />
            )}
            <ResponsiveLens />
            <CameraControls
              ref={controls}
              makeDefault
              truckSpeed={0}
              minDistance={2.5}
              maxDistance={7}
              minPolarAngle={0.25}
              maxPolarAngle={Math.PI - 0.25}
              smoothTime={reducedMotion ? 0 : 0.15}
              onChange={recordCamera}
              onStart={() => setRotating(false)}
            />
            <Rotation
              controls={controls}
              rotating={rotating && !reducedMotion && interactionReady}
            />
          </Canvas>
        </ViewerBoundary>
        {!ready && (
          <div
            className="viewer-message"
            role={active.status === "error" ? "alert" : "status"}
          >
            {active.status === "error" ? (
              <>
                <h3>{activeName} unavailable</h3>
                <p>{active.error}</p>
                <p className="small">
                  Required asset:{" "}
                  <code>models/{suit ? "astronaut" : "anatomy"}.glb</code>
                </p>
                <button onClick={active.retry}>Retry model</button>
              </>
            ) : (
              <>
                <span className="loader" />
                <h3>Loading {activeName}</h3>
                <p>Preparing your view…</p>
              </>
            )}
          </div>
        )}
        {contextLost && (
          <div className="viewer-message" role="alert">
            <h3>Graphics connection lost</h3>
            <p>Reload the page to restore the 3D viewer.</p>
            <button onClick={() => window.location.reload()}>
              Reload viewer
            </button>
          </div>
        )}
        <div className="model-caption">
          <span className="caption-line" />
          <div>
            <span className="eyebrow">
              {suit
                ? "EXTRAVEHICULAR SUIT"
                : system
                  ? "SELECTED STRUCTURE"
                  : "ANATOMICAL OVERVIEW"}
            </span>
            <strong>
              {suit
                ? "Built for the outside."
                : (system?.organ ?? "Explore from within.")}
            </strong>
            <small>
              {suit
                ? "Select a body system to look inside"
                : "Select a structure or use the system buttons"}
            </small>
          </div>
        </div>
      </div>
      <div className="viewer-controls" aria-label="View controls">
        <button
          disabled={!interactionReady}
          title="Rotate left"
          aria-label="Rotate left"
          onClick={() => {
            controls.current?.rotate(-Math.PI / 8, 0, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <RotateCcw size={18} />
        </button>
        <button
          disabled={!interactionReady}
          title="Rotate right"
          aria-label="Rotate right"
          onClick={() => {
            controls.current?.rotate(Math.PI / 8, 0, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <RotateCw size={18} />
        </button>
        <button
          disabled={!interactionReady}
          title="Tilt up"
          aria-label="Tilt up"
          onClick={() => {
            controls.current?.rotate(0, -Math.PI / 12, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <ChevronUp size={18} />
        </button>
        <button
          disabled={!interactionReady}
          title="Tilt down"
          aria-label="Tilt down"
          onClick={() => {
            controls.current?.rotate(0, Math.PI / 12, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <ChevronDown size={18} />
        </button>
        <span className="control-divider" />
        <button
          disabled={!interactionReady}
          title="Zoom in"
          aria-label="Zoom in"
          onClick={() => {
            controls.current?.dolly(0.4, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <ZoomIn size={18} />
        </button>
        <button
          disabled={!interactionReady}
          title="Zoom out"
          aria-label="Zoom out"
          onClick={() => {
            controls.current?.dolly(-0.4, false);
            controls.current?.update(0);
            recordCamera();
          }}
        >
          <ZoomOut size={18} />
        </button>
        <button disabled={!interactionReady} className="reset" onClick={reset}>
          <Scan size={17} />
          Reset view
        </button>
        <button
          disabled={!interactionReady || reducedMotion}
          aria-pressed={rotating && !reducedMotion}
          title={
            reducedMotion
              ? "Automatic rotation is disabled by your reduced-motion preference"
              : "Toggle automatic rotation"
          }
          onClick={() => setRotating((value) => !value)}
        >
          {rotating && !reducedMotion ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
          <span>Rotate</span>
        </button>
      </div>
      <p className="viewer-help">
        Drag to orbit · Scroll to zoom <span>Two models. One perspective.</span>
      </p>
    </section>
  );
}
