/** Thay {khóa} trong chuỗi mẫu bằng giá trị: fill("Tối đa {n} ký tự", { n: 100 }) */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
