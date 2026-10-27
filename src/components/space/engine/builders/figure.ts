import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Ray,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { mergeAll } from "@/components/space/engine/builders/merge";
import type { Palette } from "@/components/space/engine/palette";

const SHOULDER_Y = 1.5;
const SHOULDER_X = 0.22;
const L1 = 0.34; // cánh tay trên
const L2 = 0.32; // cẳng tay (tới cổ tay)

function paint(geometry: BufferGeometry, color: Color) {
  const n = geometry.attributes.position.count;
  const data = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) data.set([color.r, color.g, color.b], i * 3);
  geometry.setAttribute("color", new BufferAttribute(data, 3));
  return geometry;
}

/** Hình trụ côn dọc theo +Z từ 0 tới length (dùng cho tay), hai đầu có mặt cầu để khớp nối tròn */
function limb(length: number, r0: number, r1: number, color: Color) {
  const body = new CylinderGeometry(r1, r0, length, 14).rotateX(Math.PI / 2).translate(0, 0, length / 2);
  const joint = new SphereGeometry(r0 * 1.08, 14, 10);
  return [paint(body, color), paint(joint, color)];
}

/**
 * Nhân vật lễ tân đứng ở cổng liên hệ: dáng người cách điệu (không có mặt, màu theo token), vest xanh đậm, sơ mi sáng.
 * - Mặc định đứng thẳng, hai tay chắp trước bụng dưới (lịch thiệp).
 * - Khi con trỏ chuột tìm tới (hoặc vừa vào xưởng, hoặc đang xem khu Liên hệ) thì xoay người về phía người xem, giơ tay vẫy chào
 *   một lúc rồi chắp tay lại; chuột đi chỗ khác thì chắp tay ngay. Chỉ vẫy lại khi chuột rời đi rồi quay lại.
 * Tay là hai đoạn (IK hai khớp) nên khuỷu cong tự nhiên; thân, chân, đầu gộp một mesh, mỗi tay hai mesh: 5 lệnh vẽ.
 */
export function buildFigure(palette: Palette, reduced: boolean) {
  const jacket = palette.accent.clone().multiplyScalar(0.55);
  const trousers = palette.inkSurface.clone();
  const shirt = palette.paper.clone();
  const skin = palette.paper.clone();
  const hair = palette.ink.clone();
  const shoe = palette.ink.clone();
  const tie = palette.accentLight.clone();

  const bodyParts: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    bodyParts.push(paint(new CylinderGeometry(0.078, 0.058, 0.86, 14).translate(side * 0.09, 0.52, 0), trousers));
    bodyParts.push(paint(new RoundedBoxGeometry(0.11, 0.075, 0.27, 2, 0.025).translate(side * 0.09, 0.04, 0.045), shoe));
  }
  bodyParts.push(paint(new RoundedBoxGeometry(0.32, 0.2, 0.2, 2, 0.05).translate(0, 0.98, 0), trousers));
  bodyParts.push(paint(new CylinderGeometry(0.175, 0.15, 0.58, 20).scale(1, 1, 0.62).translate(0, 1.27, 0), jacket));
  bodyParts.push(paint(new RoundedBoxGeometry(0.46, 0.1, 0.2, 2, 0.045).translate(0, 1.5, 0), jacket));
  bodyParts.push(paint(new BoxGeometry(0.1, 0.34, 0.02).translate(0, 1.34, 0.1), shirt)); // vạt sơ mi
  bodyParts.push(paint(new BoxGeometry(0.035, 0.3, 0.03).translate(0, 1.33, 0.11), tie)); // cà vạt
  bodyParts.push(paint(new CylinderGeometry(0.047, 0.055, 0.12, 12).translate(0, 1.58, 0), skin));
  bodyParts.push(paint(new SphereGeometry(0.105, 20, 14).scale(1, 1.16, 1.02).translate(0, 1.7, 0), skin));
  bodyParts.push(paint(new SphereGeometry(0.112, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.36).scale(1, 1.1, 1.06).translate(0, 1.722, -0.012), hair));
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.12 });
  const body = new Mesh(mergeAll(bodyParts), material);

  const armMeshes = [-1, 1].map(() => {
    const upper = new Mesh(mergeAll(limb(L1, 0.052, 0.042, jacket)), material);
    const handGeo = paint(new SphereGeometry(0.04, 12, 10).scale(0.9, 0.55, 1.5).translate(0, 0, L2 + 0.045), skin);
    const cuff = paint(new CylinderGeometry(0.043, 0.043, 0.04, 12).rotateX(Math.PI / 2).translate(0, 0, L2 - 0.03), shirt);
    const fore = new Mesh(mergeAll([...limb(L2, 0.042, 0.034, jacket), cuff, handGeo]), material);
    return { upper, fore };
  });

  const figure = new Group();
  figure.add(body);
  for (const a of armMeshes) figure.add(a.upper, a.fore);

  // vùng chạm vô hình: bấm vào nhân vật mở khu Liên hệ
  const hit = new Mesh(new CylinderGeometry(0.55, 0.55, 1.95, 10).translate(0, 0.98, 0), new MeshBasicMaterial({ visible: false }));
  hit.userData.pick = "zone:contact";
  figure.add(hit);

  // ---- Chuyển động ----
  const shoulder = new Vector3();
  const elbow = new Vector3();
  const wrist = new Vector3();
  const dir = new Vector3();
  const perp = new Vector3();
  const chest = new Vector3();
  const toView = new Vector3();
  const q = new Quaternion();
  const z = new Vector3(0, 0, 1);

  const clasp = [new Vector3(-0.04, 0.99, 0.24), new Vector3(0.04, 0.99, 0.24)];
  const rest = [new Vector3(-0.2, 0.97, 0.12), new Vector3(0.2, 0.97, 0.12)];
  const poleClasp = [new Vector3(-0.7, -0.2, -0.7), new Vector3(0.7, -0.2, -0.7)];
  const poleWave = new Vector3(-1, -0.6, -0.15);

  let w = 0; // 0 chắp tay → 1 vẫy tay
  let wave = 0; // thời gian vẫy còn lại (giây)
  let yaw = 0;
  let phase = 0;
  let near = false;
  let hovered = false;
  let active = false;
  let ray: Ray | null = null;
  const viewer = new Vector3(0, 8, 30);
  let first = true;

  const solve = (side: number, target: Vector3, poleDir: Vector3, mesh: { upper: Mesh; fore: Mesh }) => {
    shoulder.set(side * SHOULDER_X, SHOULDER_Y, 0);
    dir.subVectors(target, shoulder);
    let d = dir.length();
    d = Math.min(Math.max(d, Math.abs(L1 - L2) + 0.03), L1 + L2 - 0.01);
    dir.normalize();
    const along = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(L1 * L1 - along * along, 0));
    perp.copy(poleDir).normalize().addScaledVector(dir, -poleDir.clone().normalize().dot(dir)).normalize();
    elbow.copy(shoulder).addScaledVector(dir, along).addScaledVector(perp, h);
    wrist.copy(shoulder).addScaledVector(dir, d);
    mesh.upper.position.copy(shoulder);
    mesh.upper.quaternion.copy(q.setFromUnitVectors(z, toView.subVectors(elbow, shoulder).normalize()));
    mesh.fore.position.copy(elbow);
    mesh.fore.quaternion.copy(q.setFromUnitVectors(z, toView.subVectors(wrist, elbow).normalize()));
  };

  const tmp = new Vector3();
  const target = new Vector3();
  const poleNow = new Vector3();
  const pose = (time: number, dt: number) => {
    // Có ai đang tới gần? (chuột lại gần, hoặc đang rê vào chính nhân vật)
    figure.getWorldPosition(chest);
    chest.y += 1.35 * figure.scale.y;
    const dist = ray ? ray.distanceToPoint(chest) : Infinity;
    const nearNow = hovered || (near ? dist < 4.2 : dist < 2.8);
    if (nearNow && !near) wave = Math.max(wave, 3.4); // chuột vừa tìm tới: vẫy chào
    if (!nearNow && near) wave = Math.min(wave, 0.6); // chuột đi chỗ khác: chắp tay lại ngay
    near = nearNow;
    wave = Math.max(0, wave - dt);

    w += ((wave > 0 ? 1 : 0) - w) * (1 - Math.exp(-dt * 5));
    phase += dt * (6 + w * 3);

    // Luôn quay mặt về phía camera (chậm khi đứng chờ, nhanh khi đang chào) để người xem thấy chính diện từ bất kỳ góc nào
    tmp.copy(viewer).sub(chest);
    const targetYaw = Math.atan2(tmp.x, tmp.z);
    let diff = targetYaw - yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // đi đường ngắn nhất
    yaw += diff * (1 - Math.exp(-dt * (wave > 0 || near ? 3.2 : 1.3)));
    figure.rotation.y = yaw;
    // thở nhẹ và dồn trọng tâm
    body.scale.y = 1 + Math.sin(time * 1.5) * 0.004;
    body.rotation.z = Math.sin(time * 0.8) * 0.006;

    // Tay "vẫy" (bên trái nhân vật, x âm): chắp → giơ lên vẫy; tay kia: chắp → buông tự nhiên
    const sway = Math.sin(phase) * 0.075 * w;
    target.lerpVectors(clasp[0], tmp.set(-0.5 + sway, 1.8 + Math.abs(Math.sin(phase * 0.5)) * 0.015, 0.1), w);
    poleNow.lerpVectors(poleClasp[0], poleWave, w);
    solve(-1, target, poleNow, armMeshes[0]);
    target.lerpVectors(clasp[1], rest[1], w);
    poleNow.copy(poleClasp[1]);
    solve(1, target, poleNow, armMeshes[1]);
  };
  pose(0, 0.016);

  return {
    group: figure,
    hit,
    pose,
    /** Chào lần đầu khi người xem vừa bước vào xưởng */
    greet() {
      if (first) {
        first = false;
        if (!reduced) wave = 3.6;
      }
    },
    setActive(a: boolean) {
      if (a && !active && !reduced) wave = Math.max(wave, 3.2);
      active = a;
    },
    setHover(id: string | null) {
      hovered = id === "zone:contact";
    },
    setRay(next: Ray | null, eye: Vector3) {
      ray = next;
      viewer.copy(eye);
    },
  };
}
