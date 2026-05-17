"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Cinematic real-asset tree.
 *
 * Loads the user-supplied OBJ at
 *   public/models/source/olive-tree/olive-tree.obj
 * and wires PBR materials by hand — the exported .mtl points at dead
 * absolute Windows texture paths, so we resolve the maps ourselves
 * from the same folder.
 *
 * Real lighting: image-based env (no HDRI file), shadow-casting key +
 * teal rim, transparent shadow-catcher (keeps the canvas alpha), ACES
 * tone-mapping, fog, alpha-cut leaf cards with swaying foliage wind,
 * and a scroll-driven cinematic camera move. Missing asset → warns
 * once, scene stays empty, site never breaks.
 */

const BASE = "/models/source/olive-tree/";
const OBJ_URL = `${BASE}olive-tree.obj`;
const LEAF = /leaf|leaves|branch|card/i;

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

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    const key = new THREE.DirectionalLight(0xffe2bd, 2.6);
    key.position.set(-6, 12, 7);
    key.castShadow = !low;
    key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -14;
    key.shadow.camera.right = 14;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0012;
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x59d6c4, 1.15);
    rim.position.set(7, 5, -8);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0x3b8f80, 0x070f0d, 0.55));

    const root = new THREE.Group();
    scene.add(root);

    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.42 }),
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.receiveShadow = true;
    root.add(shadowCatcher);

    // foliage wind — shared by the leaf material and its shadow-depth
    // material so the swaying canopy and its shadow stay in sync. The
    // height gate keeps the trunk base planted.
    const uTime = { value: 0 };
    const disposables: { dispose(): void }[] = [];
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
             float s = sin(uTime*1.2 + wpw.x*0.5 + wpw.z*0.4)*0.11
                     + sin(uTime*2.5 + wpw.y)*0.045;
             transformed.x += s * h;
             transformed.z += s * 0.6 * h;`,
          );
      };
    };

    const texLoader = new THREE.TextureLoader().setPath(BASE);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    let pending = 0;
    const renderOnce = () => renderer.render(scene, camera);
    const tex = (file: string, srgb: boolean) => {
      pending++;
      const t = texLoader.load(file, () => {
        pending--;
        renderOnce();
      });
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = low ? 1 : Math.min(8, maxAniso);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      disposables.push(t);
      return t;
    };

    let loaded = false;
    new OBJLoader().load(
      OBJ_URL,
      (obj) => {
        // auto-stand: if the model is lying down (footprint >> height),
        // it was exported Z-up — tip it upright.
        let box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        if (size.y < 0.55 * Math.max(size.x, size.z)) {
          obj.rotation.x = -Math.PI / 2;
          obj.updateMatrixWorld(true);
          box = new THREE.Box3().setFromObject(obj);
          box.getSize(size);
        }

        // normalize: base on the ground, centered, height ≈ 9 units
        const center = new THREE.Vector3();
        box.getCenter(center);
        const scl = 9 / (size.y || 1);
        obj.scale.setScalar(scl);
        obj.position.set(
          -center.x * scl,
          -box.min.y * scl,
          -center.z * scl,
        );

        obj.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = !low;
          mesh.receiveShadow = !low;
          mesh.frustumCulled = true;

          const oldName =
            (Array.isArray(mesh.material)
              ? mesh.material[0]?.name
              : mesh.material?.name) || mesh.name;
          const isLeaf = LEAF.test(oldName);
          (Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          ).forEach((m) => m?.dispose());

          if (isLeaf) {
            const mat = new THREE.MeshStandardMaterial({
              map: tex("olive-branch-cards.jpg", true),
              alphaMap: tex("olive-branch-cards-alpha.jpg", false),
              normalMap: low
                ? null
                : tex("olive-branch-cards-normal.jpg", false),
              alphaTest: 0.5,
              transparent: false,
              side: THREE.DoubleSide,
              roughness: 0.72,
              metalness: 0,
              envMapIntensity: 0.9,
            });
            mesh.material = mat;
            disposables.push(mat);
            if (!reduced) addWind(mat);
            if (!low) {
              const depth = new THREE.MeshDepthMaterial({
                depthPacking: THREE.RGBADepthPacking,
                alphaMap: mat.alphaMap,
                alphaTest: 0.5,
              });
              if (!reduced) addWind(depth);
              mesh.customDepthMaterial = depth;
              disposables.push(depth);
            }
          } else {
            const mat = new THREE.MeshStandardMaterial({
              map: tex("tree-specular.png", true),
              normalMap: low ? null : tex("tree-normal.png", false),
              normalScale: new THREE.Vector2(1.4, 1.4),
              roughness: 0.92,
              metalness: 0,
              envMapIntensity: 0.8,
            });
            mesh.material = mat;
            disposables.push(mat);
          }
        });

        root.add(obj);
        loaded = true;
        renderOnce();
      },
      undefined,
      () => {
        console.warn(
          `[Tree3D] Could not load ${OBJ_URL} — scene stays empty (site unaffected).`,
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
      const t = clock.getElapsedTime();
      curP += (targetP - curP) * 0.07;
      const p = ease(curP);

      camera.position.lerpVectors(camFrom, camTo, p);
      const orbit = Math.sin(t * 0.1) * 0.5 + p * 1.4;
      camera.position.x += Math.sin(orbit) * 0.6;
      tmpL.lerpVectors(lookFrom, lookTo, p);
      camera.lookAt(tmpL);

      root.rotation.y = Math.sin(t * 0.06) * 0.04;
      uTime.value = t;
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      curP = 1;
      camera.position.copy(camTo);
      camera.lookAt(lookTo);
      // re-render as the model + textures stream in (bounded ~5s)
      let ticks = 0;
      const settle = () => {
        if (!alive) return;
        renderer.render(scene, camera);
        ticks++;
        if (ticks < 25 && (!loaded || pending > 0)) setTimeout(settle, 200);
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
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry?.dispose();
      });
      disposables.forEach((d) => d.dispose());
      shadowCatcher.geometry.dispose();
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
