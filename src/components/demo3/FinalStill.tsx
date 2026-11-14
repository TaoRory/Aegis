/**
 * Bản tĩnh của nền "bó sợi" ở khối lời mời cuối: SVG dựng sẵn ở server, cùng màu token (teal → aqua), cùng dáng với bản WebGL
 * (một bó chụm ở góc dưới trái, tách dần và đi lên về bên phải, như đường "tài sản" của biểu đồ trang chủ).
 * Đây là thứ người xem thấy khi không có JS, trên điện thoại, khi giảm chuyển động, khi WebGL không dùng được, và trong lúc chờ bản WebGL tải.
 */

const W = 1200;
const H = 600;
const COUNT = 18;
const KNOTS = 8;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Đường cong mượt qua các điểm (Catmull-Rom đổi sang Bézier bậc ba) */
function curve(points: [number, number][]) {
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const THREADS = Array.from({ length: COUNT }, (_, i) => {
  const perc = i / (COUNT - 1);
  const points: [number, number][] = [];
  for (let k = 0; k <= KNOTS; k++) {
    const u = k / KNOTS;
    // Sợi ngoài rìa tách khỏi bó muộn hơn; sau khi tách thì lệch dần và uốn nhẹ
    const spread = smooth(0.06 + perc * 0.3, 0.85, u);
    const y = H * 0.86 - u * H * 0.52 + (perc - 0.5) * 16 + spread * ((perc - 0.5) * H * 0.62 + 30 * Math.sin(u * 5.2 + i * 1.7));
    points.push([-30 + u * (W + 60), y]);
  }
  return {
    d: curve(points),
    mix: Math.round(perc * 100),
    opacity: Number((0.62 * (1 - 0.7 * Math.pow(perc, 0.4))).toFixed(3)),
    width: Number((0.6 + 1.3 * (1 - perc)).toFixed(2)),
  };
});

export function FinalStill() {
  return (
    <svg className="d3-final-still" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden focusable="false">
      {THREADS.map((thread, i) => (
        <path
          key={i}
          d={thread.d}
          vectorEffect="non-scaling-stroke"
          style={{ stroke: `color-mix(in srgb, var(--d2-teal), var(--d2-aqua) ${thread.mix}%)`, strokeWidth: thread.width, opacity: thread.opacity }}
        />
      ))}
    </svg>
  );
}
