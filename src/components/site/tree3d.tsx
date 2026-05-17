"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Cinematic real-asset tree. Drop a model at:
 *
 *     public/models/tree.glb        (uncompressed or meshopt-compressed)
 *
 * Good free sources: Sketchfab "CC0" / "Downloadable" trees, Quaternius
 * (CC0), KhronosGroup samples. Export/keep it as .glb.
 *
 * This wires real lighting: image-based env (no HDRI file needed),
 * a shadow-casting key light + transparent shadow-catcher (so the page
 * background still shows), ACES tone-mapping, fog, foliage wind, and a
 * scroll-driven cinematic camera move. If the asset is missing it fails
 * silently (warns once) — the site is never broken.
 */

const MODEL_URL = "/models/tree.glb";
const FOLIAGE = /leaf|leaves|foliage|canop|needle|pine/i;

export function Tree3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const low = window.matchMedia(
      "(max-width: 860px), (pointer: coarse)",
    ).matches;

    let W = Math.max(wrap.clientWidth, 1);
    let H = Math.max(wrap.clientHeight, 1);
    const DPR = Math.min(window.devicePixelRatio, low ? 1.25 : 1.75);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06110f, 0.022);

    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !low;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    // image-based lighting without an HDRI file
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // dusk key (warm) + teal rim + soft fill
    const key = new THREE.DirectionalLight(0xffe2bd, 2.4);
    key.position.set(-6, 11, 7);
    key.castShadow = !low;
    key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -14;
    key.shadow.camera.right = 14;
    key.shadow.camera.top = 18;
    key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0012;
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x59d6c4, 1.1);
    rim.position.set(7, 5, -8);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0x3b8f80, 0x070f0d, 0.5));

    const root = new THREE.Group();
    scene.add(root);

    // transparent shadow catcher — grounds the tree, keeps canvas alpha
    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.42 }),
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.receiveShadow = true;
    root.add(shadowCatcher);

    // foliage wind, injected per-material
    const windMats: THREE.Material[] = [];
    const uTime = { value: 0 };
    const addWind = (mat: THREE.Material) => {
      mat.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = uTime;
        sh.vertexShader = sh.vertexShader
          .replace(
            "#include <common>",
            "#include <common>\nuniform float uTime;",
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
             vec4 wpw = modelMatrix * vec4(transformed,1.0);
             float h = clamp(wpw.y*0.12,0.0,1.0);
             float s = sin(uTime*1.3 + wpw.x*0.5 + wpw.z*0.4)*0.10
                     + sin(uTime*2.6 + wpw.y)*0.04;
             transformed.x += s * h;
             transformed.z += s * 0.6 * h;`,
          );
      };
      windMats.push(mat);
    };

    let mixer: THREE.AnimationMixer | null = null;
    let clipDur = 0;
    let loaded = false;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // normalize: base at y=0, centered, height ≈ 9 units
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const scl = 9 / (size.y || 1);
        model.scale.setScalar(scl);
        model.position.set(
          -center.x * scl,
          -box.min.y * scl,
          -center.z * scl,
        );

        const meshes: THREE.Mesh[] = [];
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = !low;
          mesh.receiveShadow = !low;
          mesh.frustumCulled = true;
          meshes.push(mesh);
        });
        const matsOf = (m: THREE.Mesh) =>
          Array.isArray(m.material) ? m.material : [m.material];
        const named = (m: THREE.Mesh) =>
          FOLIAGE.test(m.name) ||
          matsOf(m).some((mat) => mat && FOLIAGE.test(mat.name));
        // multi-part trees: wind only the foliage. single-mesh trees
        // (one material, e.g. "tree3"): wind everything — the shader's
        // height gate keeps the trunk base planted.
        const hasNamed = meshes.some(named);
        if (!reduced)
          meshes.forEach((m) => {
            if (!hasNamed || named(m))
              matsOf(m).forEach((mat) => mat && addWind(mat));
          });

        root.add(model);

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          const act = mixer.clipAction(gltf.animations[0]);
          act.play();
          clipDur = gltf.animations[0].duration;
        }
        loaded = true;
      },
      undefined,
      () => {
        console.warn(
          `[Tree3D] No model at ${MODEL_URL} — add an uncompressed/meshopt .glb there. Scene stays empty (site unaffected).`,
        );
      },
    );

    // ---- scroll-driven cinematic camera ----
    let targetP = 0;
    let curP = reduced ? 1 : 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetP = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // wide establishing -> intimate hero, with a slow arc
    const camFrom = new THREE.Vector3(0.5, 7.5, 24);
    const camTo = new THREE.Vector3(-2.2, 4.4, 13);
    const lookFrom = new THREE.Vector3(0, 5.5, 0);
    const lookTo = new THREE.Vector3(0, 4.6, 0);
    const ease = (x: number) => x * x * (3 - 2 * x);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;
    const tmpL = new THREE.Vector3();

    const frame = () => {
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      curP += (targetP - curP) * 0.07;
      const p = ease(curP);

      camera.position.lerpVectors(camFrom, camTo, p);
      const orbit = Math.sin(t * 0.1) * 0.5 + p * 1.4;
      camera.position.x += Math.sin(orbit) * 0.6;
      tmpL.lerpVectors(lookFrom, lookTo, p);
      camera.lookAt(tmpL);

      root.rotation.y = Math.sin(t * 0.06) * 0.04;
      uTime.value = t;
      // if the asset ships a growth/idle clip, scrub it to scroll
      if (mixer) {
        if (clipDur > 0) mixer.setTime(p * clipDur);
        else mixer.update(dt);
      }
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      curP = 1;
      camera.position.copy(camTo);
      camera.lookAt(lookTo);
      // render now (empty), and again once the model finishes loading
      const settle = () => {
        if (!alive) return;
        renderer.render(scene, camera);
        if (!loaded) setTimeout(settle, 250);
      };
      settle();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      W = Math.max(wrap.clientWidth, 1);
      H = Math.max(wrap.clientHeight, 1);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    });
    ro.observe(wrap);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      mixer?.stopAllAction();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((m) => m?.dispose());
      });
      shadowCatcher.geometry.dispose();
      windMats.length = 0;
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
