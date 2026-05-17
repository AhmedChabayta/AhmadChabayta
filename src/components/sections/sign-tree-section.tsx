"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PROJECTS } from "@/data/projects";
import { Section, Container, SectionHeader, Text } from "@/components/ui";

/**
 * PROTOTYPE — "The Orchard".
 *
 * One section that demonstrates the signs-on-a-tree concept: a
 * code-built world (procedural sky + sun, green field, a tree with a
 * long branch). As you scroll through the section the camera pans
 * along the branch and each work "sign" drops from the branch, swings
 * on its ropes like a pendulum, then settles and sways in the wind.
 * Signs are clickable → the project. Everything is generated in code
 * (no assets); reduced-motion settles statically with scroll.
 */

const SIGNS = PROJECTS.filter((p) => p.featured).slice(0, 5);
const hrefOf = (p: (typeof SIGNS)[number]) =>
  p.appHref ?? p.externalUrl ?? `/work/${p.slug}`;

function signTexture(idx: string, title: string, tag: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#6b4a2d");
  g.addColorStop(0.5, "#7d5836");
  g.addColorStop(1, "#5d3f26");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);
  // plank grain
  x.strokeStyle = "rgba(0,0,0,0.10)";
  x.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    x.beginPath();
    x.moveTo(0, 20 + i * 36);
    x.bezierCurveTo(300, 14 + i * 36, 700, 28 + i * 36, 1024, 18 + i * 36);
    x.stroke();
  }
  x.strokeStyle = "rgba(255,240,210,0.16)";
  x.lineWidth = 10;
  x.strokeRect(24, 24, 976, 464);
  x.fillStyle = "#ffb14d";
  x.font = "700 52px ui-sans-serif, system-ui, sans-serif";
  x.fillText(idx, 60, 120);
  x.fillStyle = "#fdf4e3";
  x.font = "800 104px ui-sans-serif, system-ui, sans-serif";
  x.fillText(title.toUpperCase().slice(0, 16), 56, 250);
  x.fillStyle = "rgba(253,244,227,0.74)";
  x.font = "400 38px ui-sans-serif, system-ui, sans-serif";
  const words = tag.split(" ");
  let line = "";
  let yy = 330;
  for (const w of words) {
    if ((line + w).length > 42) {
      x.fillText(line, 58, yy);
      line = "";
      yy += 50;
    }
    line += w + " ";
  }
  x.fillText(line, 58, yy);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function SignTreeSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    const host = stickyRef.current;
    if (!scroller || !host) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const low = window.matchMedia(
      "(max-width: 860px), (pointer: coarse)",
    ).matches;

    let W = Math.max(host.clientWidth, 1);
    let Hh = Math.max(host.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfe0ef, 26, 70);
    const camera = new THREE.PerspectiveCamera(46, W / Hh, 0.1, 300);

    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.25 : 1.9));
    renderer.setSize(W, Hh, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !low;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    host.appendChild(dom);

    const sunDir = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();

    // ---- sky ----
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(200, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uSun: { value: sunDir } },
        vertexShader: `varying vec3 vP; void main(){ vP=normalize(position);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `precision highp float; varying vec3 vP;
          uniform vec3 uSun;
          void main(){
            float h = clamp(vP.y*0.5+0.5,0.,1.);
            vec3 zen = vec3(0.16,0.42,0.74);
            vec3 hor = vec3(0.83,0.90,0.96);
            vec3 col = mix(hor,zen,pow(h,0.7));
            float s = pow(clamp(dot(normalize(vP),normalize(uSun)),0.,1.),180.);
            float halo = pow(clamp(dot(normalize(vP),normalize(uSun)),0.,1.),6.);
            col += vec3(1.0,0.86,0.62)*(s*1.4+halo*0.28);
            gl_FragColor = vec4(col,1.);
          }`,
      }),
    );
    sky.frustumCulled = false;
    scene.add(sky);

    // ---- light ----
    scene.add(new THREE.HemisphereLight(0xbfd8ef, 0x3f6a32, 0.85));
    const sun = new THREE.DirectionalLight(0xfff0d6, 2.4);
    sun.position.copy(sunDir).multiplyScalar(20);
    sun.castShadow = !low;
    sun.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 60;
    const sc = 16;
    sun.shadow.camera.left = -sc;
    sun.shadow.camera.right = sc;
    sun.shadow.camera.top = sc;
    sun.shadow.camera.bottom = -sc;
    sun.shadow.bias = -0.0014;
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sun);

    // ---- ground ----
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(80, 64),
      new THREE.MeshStandardMaterial({
        color: 0x4f9a43,
        roughness: 1,
        metalness: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const bark = new THREE.MeshStandardMaterial({
      color: 0x5b4632,
      roughness: 0.9,
      metalness: 0,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x3f8f3e,
      roughness: 0.85,
      flatShading: true,
    });
    const disposer: { dispose(): void }[] = [
      sky.geometry,
      sky.material as THREE.Material,
      ground.geometry,
      ground.material as THREE.Material,
      bark,
      foliageMat,
    ];

    const world = new THREE.Group();
    scene.add(world);

    const limb = (
      a: THREE.Vector3,
      b: THREE.Vector3,
      r0: number,
      r1: number,
    ) => {
      const d = new THREE.Vector3().subVectors(b, a);
      const len = d.length();
      const geo = new THREE.CylinderGeometry(r1, r0, len, 8, 1);
      disposer.push(geo);
      const m = new THREE.Mesh(geo, bark);
      m.castShadow = !low;
      m.position.copy(a).addScaledVector(d, 0.5);
      m.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        d.clone().normalize(),
      );
      world.add(m);
    };

    // trunk + main branch + a couple twigs
    const trunkTop = new THREE.Vector3(0, 3.0, 0);
    limb(new THREE.Vector3(0, 0, 0), trunkTop, 0.42, 0.26);
    const branchEnd = new THREE.Vector3(10.5, 4.0, -0.2);
    const branchY = (x: number) => 2.7 + (x / 10.5) * 1.3;
    limb(new THREE.Vector3(0, 2.7, 0), branchEnd, 0.26, 0.1);
    limb(trunkTop, new THREE.Vector3(-2.4, 5.0, 0.6), 0.2, 0.06);
    limb(
      new THREE.Vector3(5.5, branchY(5.5), -0.1),
      new THREE.Vector3(7.0, 6.0, 0.4),
      0.12,
      0.04,
    );

    // foliage blobs for a tree silhouette
    const blobGeo = new THREE.IcosahedronGeometry(1, 1);
    disposer.push(blobGeo);
    (
      [
        [-2.4, 5.2, 0.6, 1.5],
        [0, 3.5, 0, 1.7],
        [7.0, 6.1, 0.4, 1.4],
        [9.7, 4.6, -0.2, 1.2],
        [4.0, 4.0, 0.3, 1.1],
      ] as const
    ).forEach(([x, y, z, s]) => {
      const b = new THREE.Mesh(blobGeo, foliageMat);
      b.position.set(x, y, z);
      b.scale.setScalar(s);
      b.castShadow = !low;
      world.add(b);
    });

    // ---- signs ----
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0x6b5436,
      roughness: 1,
    });
    disposer.push(ropeMat);
    const xs = [1.9, 3.7, 5.6, 7.4, 9.1];
    type SignRig = {
      pivot: THREE.Group;
      start: number;
      plank: THREE.Mesh;
      proj: (typeof SIGNS)[number];
    };
    const rigs: SignRig[] = [];

    SIGNS.forEach((proj, i) => {
      const x = xs[i] ?? 1.9 + i * 1.8;
      const py = branchY(x);
      const pivot = new THREE.Group();
      pivot.position.set(x, py, 0);
      world.add(pivot);

      const ropeLen = 1.0;
      const pw = 2.4;
      const ph = 1.2;
      [-0.78, 0.78].forEach((rx) => {
        const rg = new THREE.CylinderGeometry(0.022, 0.022, ropeLen, 5);
        disposer.push(rg);
        const rope = new THREE.Mesh(rg, ropeMat);
        rope.position.set(rx, -ropeLen / 2, 0);
        rope.castShadow = !low;
        pivot.add(rope);
      });

      const tex = signTexture(proj.index, proj.title, proj.tagline);
      disposer.push(tex);
      const faceMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.78,
        metalness: 0,
      });
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x5d3f26,
        roughness: 0.9,
      });
      disposer.push(faceMat, sideMat);
      const plankGeo = new THREE.BoxGeometry(pw, ph, 0.09);
      disposer.push(plankGeo);
      const plank = new THREE.Mesh(plankGeo, [
        sideMat,
        sideMat,
        sideMat,
        sideMat,
        faceMat,
        faceMat,
      ]);
      plank.position.set(0, -ropeLen - ph / 2, 0);
      plank.castShadow = !low;
      plank.userData.href = hrefOf(proj);
      pivot.add(plank);

      rigs.push({
        pivot,
        plank,
        proj,
        start: 0.12 + (i / SIGNS.length) * 0.66,
      });
    });

    // ---- scroll progress through the tall section ----
    let prog = 0;
    const readProg = () => {
      const r = scroller.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      prog = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    };
    readProg();
    window.addEventListener("scroll", readProg, { passive: true });

    const camA = new THREE.Vector3(-1.5, 2.4, 8.5);
    const camB = new THREE.Vector3(8.5, 3.4, 8.0);
    const lookA = new THREE.Vector3(1.5, 2.2, 0);
    const lookB = new THREE.Vector3(9.5, 3.0, 0);
    const tmp = new THREE.Vector3();
    const ease = (x: number) => x * x * (3 - 2 * x);

    const place = (time: number) => {
      const p = ease(prog);
      camera.position.lerpVectors(camA, camB, p);
      tmp.lerpVectors(lookA, lookB, p);
      camera.lookAt(tmp);

      for (const rig of rigs) {
        const win = 0.18;
        const local = Math.min(1, Math.max(0, (prog - rig.start) / win));
        const fall = ease(local);
        // folded up against the branch → hanging down
        const up = -1.45;
        // damped pendulum right after it drops
        const swing =
          Math.exp(-4.5 * local) * Math.sin(local * Math.PI * 4) * 0.9;
        const wind = reduced ? 0 : Math.sin(time * 1.1 + rig.start * 9) * 0.05;
        rig.pivot.rotation.z =
          up * (1 - fall) + swing * (1 - fall * 0.4) + wind * fall;
        rig.pivot.visible = local > 0.001;
      }
    };

    // ---- pointer: hover + click a sign ----
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const planks = rigs.map((r) => r.plank);
    let hover = false;
    const onMove = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      hover = ray.intersectObjects(planks).length > 0;
      dom.style.cursor = hover ? "pointer" : "default";
    };
    const onClick = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(planks)[0];
      if (hit) {
        const href = (hit.object as THREE.Mesh).userData.href as string;
        if (href.startsWith("http")) window.open(href, "_blank", "noopener");
        else window.location.href = href;
      }
    };
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerdown", onClick);

    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;

    const frame = () => {
      place(clock.getElapsedTime());
      renderer.render(scene, camera);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const renderStatic = () => {
      place(0);
      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !reduced) raf = requestAnimationFrame(frame);
        else cancelAnimationFrame(raf);
        if (visible && reduced) renderStatic();
      },
      { threshold: 0 },
    );
    io.observe(host);

    if (reduced) {
      renderStatic();
      window.addEventListener("scroll", renderStatic, { passive: true });
    }

    const ro = new ResizeObserver(() => {
      W = Math.max(host.clientWidth, 1);
      Hh = Math.max(host.clientHeight, 1);
      renderer.setSize(W, Hh, false);
      camera.aspect = W / Hh;
      camera.updateProjectionMatrix();
      if (reduced) renderStatic();
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", readProg);
      window.removeEventListener("scroll", renderStatic);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerdown", onClick);
      disposer.forEach((d) => d.dispose());
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return (
    <Section id="orchard" pad="none" className="relative">
      <Container className="px-6 py-20 md:px-10 md:py-28">
        <SectionHeader
          titleId="orchard-heading"
          eyebrow="/ 05 — PROTOTYPE / 3D WORLD"
          title="THE ORCHARD."
          aside={
            <Text variant="mono" className="max-w-[30ch]">
              SCROLL — WORK DROPS FROM THE BRANCH.
              <br />
              TAP A SIGN TO OPEN IT.
            </Text>
          }
        />
      </Container>

      {/* tall scroll track; the canvas sticks while you scroll it */}
      <div ref={scrollRef} className="relative h-[300vh]">
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-[#cfe0ef]"
        />
      </div>

      {/* accessible / no-JS fallback */}
      <Container className="sr-only">
        <ul>
          {SIGNS.map((p) => (
            <li key={p.slug}>
              <a href={hrefOf(p)}>
                {p.title} — {p.tagline}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
