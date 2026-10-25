# Particle morph engine (raw WebGL2)

Hiện thực tham chiếu: `src/components/webgl/particle-engine.ts` (engine thuần TS) và `src/components/webgl/ParticleStage.tsx` (React, nối ScrollTrigger).

## Dữ liệu

- `N` hạt. Mỗi hình đích (shape) là một `Float32Array(N * 3)` vị trí trong hệ tọa độ chuẩn hóa [-1, 1].
- Hình được tạo **bằng thủ tục** (procedural) trong `shapes.ts`: phiến đá xếp tầng (nền móng), mạng nơ-ron (AI), lưới mô-đun (phần mềm), khung trình duyệt (web), sóng lan tỏa (marketing). Không cần asset.
- Thuộc tính phụ: `aSeed` (0..1) cho nhiễu và kích thước, giúp chuyển động "sống".

## Morph giữa nhiều hình chỉ với 2 buffer

Giữ 2 attribute `aFrom`, `aTo` cùng uniform `uMorph` ∈ [0, 1]. Khi tiến độ vượt sang cặp hình mới, **ghi lại buffer một lần** (`bufferSubData`) với cặp hình mới. Như vậy mỗi frame chỉ cập nhật uniform.

```
progress toàn cục p ∈ [0, shapes.length - 1]
i = floor(p), t = smoothstep(p - i)
nếu i khác cặp hiện tại → upload shapes[i] vào aFrom, shapes[i+1] vào aTo
uMorph = t
```

## Vertex shader (rút gọn)

```glsl
#version 300 es
in vec3 aFrom; in vec3 aTo; in float aSeed;
uniform float uMorph, uTime, uAspect, uScale; uniform vec2 uMouse, uOffset; uniform float uPointSize;
out float vAlpha;
void main() {
  // mỗi hạt trễ một chút theo seed → morph "chảy" thay vì đồng loạt
  float t = smoothstep(0.0, 1.0, clamp((uMorph - aSeed * 0.35) / 0.65, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, t);
  // xoáy nhẹ giữa chừng
  float mid = sin(t * 3.14159);
  p.xy += vec2(cos(aSeed * 40.0), sin(aSeed * 40.0)) * mid * 0.18;
  // thở
  p += 0.006 * vec3(sin(uTime + aSeed * 30.0), cos(uTime * 0.8 + aSeed * 20.0), 0.0);
  // xoay isometric nhẹ, chiếu
  ...
  // đẩy khỏi chuột
  vec2 d = p.xy - uMouse; float f = exp(-dot(d, d) * 18.0); p.xy += normalize(d + 1e-5) * f * 0.12;
  gl_Position = vec4((p.xy * uScale + uOffset) * vec2(1.0 / uAspect, 1.0), 0.0, 1.0);
  gl_PointSize = uPointSize * (0.6 + aSeed * 0.8);
  vAlpha = 0.35 + 0.65 * aSeed;
}
```

## Fragment shader

Điểm tròn mềm: `float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; alpha = smoothstep(0.5, 0.0, d) * vAlpha;`. Màu từ uniform `uColor` (đọc từ CSS token).

## Nối với cuộn

- Hero: `uMorph` cố định ở hình 0 (nền móng), cuộn qua hero thì phân tán nhẹ (`uScatter`).
- Chương dịch vụ (pin): `onUpdate: self => stage.setProgress(1 + self.progress * 3)` → morph lần lượt qua 4 hình dịch vụ.
- `uOffset` dịch khối hạt sang phải khi vào chương dịch vụ (chữ ở bên trái).

## Hiệu năng đo được nên đạt

- Desktop 12k hạt: < 2ms GPU/frame trên iGPU.
- Không có allocation trong vòng lặp render.
