import type { MeshBasicMaterial } from "three";

export interface Sheen {
  uniforms: {
    uSheenT: { value: number };
    uPhase: { value: number };
    uAmt: { value: number };
  };
}

/**
 * Dải ánh sáng quét chéo qua mặt màn hình (như phản chiếu đèn trần lướt qua kính). Chèn vào MeshBasicMaterial sau
 * `map_fragment` nên chỉ có tác dụng khi đã có texture. Mọi màn dùng chung một chương trình shader (cùng cache key).
 */
export function addSheen(material: MeshBasicMaterial, phase: number): Sheen {
  const uniforms = { uSheenT: { value: 0 }, uPhase: { value: phase }, uAmt: { value: 0.2 } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uSheenT;\nuniform float uPhase;\nuniform float uAmt;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
#ifdef USE_MAP
  float sb = vMapUv.x + vMapUv.y * 0.35 - mod(uSheenT * 0.22 + uPhase, 2.6) + 0.6;
  diffuseColor.rgb += exp(-sb * sb * 55.0) * uAmt;
#endif`,
      );
  };
  material.customProgramCacheKey = () => "aegis-sheen";
  return { uniforms };
}
