"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type Kind = "nib" | "pages" | "coin";

// The logo's geometry in its 64-unit grid: nib outline, eye and slit cut through it.
const NIB_D =
  "M22.5 8h19c0 5.5 5.5 10.5 5.5 18 0 7.5-6.5 16.5-15 31-8.5-14.5-15-23.5-15-31 0-7.5 5.5-12.5 5.5-18z " +
  "M23.5 27.5c4.6-6.4 12.4-6.4 17 0-4.6 6.4-12.4 6.4-17 0z " +
  "M31.55 35h.9v19h-.9z";

const GOLD = { color: 0xf2b23a, metalness: 1, roughness: 0.24, envMapIntensity: 1.4 };

function nib(scene: THREE.Scene) {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${NIB_D}"/></svg>`);
  const shapes = svg.paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 3, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.6, bevelSegments: 6, curveSegments: 48 });
  geo.center();
  geo.scale(1, -1, 1); // SVG y runs down
  const body = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial(GOLD));
  // The iris sits inside the eye cut-out, glowing amber.
  const iris = new THREE.Mesh(new THREE.SphereGeometry(3.4, 48, 48), new THREE.MeshPhysicalMaterial({ color: 0xd98a12, emissive: 0x3a1e00, emissiveIntensity: 0.6, roughness: 0.2, clearcoat: 1 }));
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0x0c0d0f, roughness: 0.05, clearcoat: 1 }));
  iris.position.set(0, 5, 0);
  iris.scale.z = 0.5;
  pupil.position.set(0, 5, 1.6);
  pupil.scale.z = 0.5;
  const group = new THREE.Group();
  group.add(body, iris, pupil);
  group.scale.setScalar(0.085);
  scene.add(group);
  return (t: number, mx: number, my: number) => {
    group.rotation.y = Math.sin(t * 0.45) * 0.55 + mx * 0.35;
    group.rotation.x = -0.12 + my * 0.2;
    group.position.y = Math.sin(t * 0.9) * 0.08;
  };
}

function finePrintTexture(seed: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 680;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6f3ec";
  g.fillRect(0, 0, c.width, c.height);
  let y = 60;
  let i = 0;
  while (y < c.height - 40) {
    const w = 300 + ((seed * 97 + i * 53) % 140);
    if ((i + seed) % 9 === 4) {
      g.fillStyle = "#f0c04f";
      g.fillRect(40, y - 9, w + 8, 18);
    }
    g.fillStyle = "#9a9790";
    g.fillRect(44, y - 3, w, 6);
    y += 22;
    i++;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function pages(scene: THREE.Scene) {
  const n = 26;
  const geo = new THREE.BoxGeometry(2.1, 0.012, 2.8);
  const edge = new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.9 });
  const sheets = Array.from({ length: n }, (_, i) => {
    const face = new THREE.MeshStandardMaterial({ map: finePrintTexture(i), roughness: 0.85 });
    const m = new THREE.Mesh(geo, [edge, edge, face, edge, edge, edge]);
    scene.add(m);
    return { m, delay: i * 0.16, spin: ((i * 37) % 20) / 100 - 0.1, dx: ((i * 13) % 9) / 100 - 0.04 };
  });
  return (t: number, mx: number) => {
    for (const [i, s] of sheets.entries()) {
      // Each sheet drops in, eases onto the pile, and keeps its slight skew.
      const p = Math.min(1, Math.max(0, (t - s.delay) / 0.9));
      const e = 1 - Math.pow(1 - p, 4);
      const restY = -1.1 + i * 0.075;
      s.m.position.set(s.dx, restY + (1 - e) * 4, (1 - e) * -0.6);
      s.m.rotation.set((1 - e) * 0.9, s.spin + (1 - e) * 0.8, (1 - e) * -0.3);
      s.m.visible = p > 0;
    }
    scene.rotation.y = -0.5 + Math.sin(t * 0.2) * 0.08 + mx * 0.2;
  };
}

function coinTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(200, 180, 40, 256, 256, 280);
  grad.addColorStop(0, "#f7d98c");
  grad.addColorStop(1, "#b98a2e");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(90,60,10,.55)";
  g.lineWidth = 10;
  g.beginPath();
  g.arc(256, 256, 214, 0, Math.PI * 2);
  g.stroke();
  // Drawn upside down: the cap's UVs plus the rotation below mirror it back to reading order.
  g.translate(0, 512);
  g.scale(1, -1);
  g.fillStyle = "#5a3c0a";
  g.font = "600 190px Newsreader, Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("$30", 256, 245);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  // Cylinder caps map the canvas sideways; turn it upright.
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
}

function coin(scene: THREE.Scene) {
  const face = new THREE.MeshPhysicalMaterial({ map: coinTexture(), metalness: 0.85, roughness: 0.3, clearcoat: 0.5 });
  const rim = new THREE.MeshPhysicalMaterial({ ...GOLD, roughness: 0.35 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.18, 96), [rim, face, face]);
  m.rotation.x = Math.PI / 2;
  const group = new THREE.Group();
  group.add(m);
  scene.add(group);
  return (t: number, mx: number, my: number) => {
    // Lands with a settle, then rocks so the face stays readable.
    const drop = Math.min(1, t / 1.2);
    const e = 1 - Math.pow(1 - drop, 3);
    group.position.y = (1 - e) * 3 + Math.sin(t * 1.1) * 0.05;
    group.rotation.y = Math.sin(t * 0.8) * 0.75 + mx * 0.3;
    group.rotation.x = 0.25 + my * 0.15;
  };
}

/** A small, self-contained three.js scene. Renders one still frame under reduced motion. */
export function Scene3D({ kind, className }: { kind: Kind; className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, kind === "pages" ? 2.6 : 0, kind === "pages" ? 7.6 : 9);
    camera.lookAt(0, kind === "pages" ? -0.2 : 0, 0);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

    const tick = kind === "nib" ? nib(scene) : kind === "pages" ? pages(scene) : coin(scene);

    const size = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    let mx = 0;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    const start = performance.now();
    let raf = 0;
    const loop = () => {
      tick((performance.now() - start) / 1000, mx, my);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    if (reduced) {
      tick(20, 0, 0);
      renderer.render(scene, camera);
    } else loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          for (const m of [o.material].flat()) {
            (m as THREE.MeshStandardMaterial).map?.dispose();
            m.dispose();
          }
        }
      });
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [kind]);

  return <div ref={host} className={className} aria-hidden />;
}
