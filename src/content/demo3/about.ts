import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "about" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 *
 * Ban điều hành (BOD): tên, chức danh và ảnh do người dùng cung cấp. Phần giới thiệu (`bio`) để trống tới khi có nội dung
 * được xác nhận: thẻ không hiện dòng giới thiệu nào cho tới lúc đó. `photo: null` = chưa có ảnh, thẻ hiện ô chữ cái đầu.
 * Thêm ảnh: bỏ file vào public/team/ rồi điền `photo` (tỉ lệ dọc, mặt ở nửa trên khung).
 */

export type D3Photo = { src: string; width: number; height: number };

export type D3Member = {
  id: string;
  name: string;
  /** Chữ cái đầu cho ô thay ảnh (chỉ hiện khi chưa có ảnh) */
  initials: string;
  photo: D3Photo | null;
  /** Viết tắt chức danh (CEO, CTO…) */
  short: string;
  /** Chức danh đầy đủ theo ngôn ngữ */
  role: string;
  /** Giới thiệu ngắn; null = chưa có, không hiển thị */
  bio: string | null;
};

type Person = Omit<D3Member, "short" | "role" | "bio">;

const people: Person[] = [
  { id: "bao", name: "Trương Ngô Gia Bảo", initials: "TB", photo: { src: "/team/gia-bao.jpg", width: 1100, height: 1652 } },
  { id: "chi", name: "Nguyễn Thị Diệu Chi", initials: "NC", photo: { src: "/team/dieu-chi.jpg", width: 1100, height: 1650 } },
  { id: "nhi", name: "Nguyễn Tuệ Nhi", initials: "NN", photo: null },
  { id: "cuong", name: "Trần Bá Cường", initials: "TC", photo: null },
];

const members = (roles: Record<string, { short: string; role: string }>): D3Member[] =>
  people.map((person) => ({ ...person, ...roles[person.id], bio: null }));

const copy = {
  en: {
    team: {
      label: "Board of Directors",
      title: "The people behind Aegis",
      members: members({
        bao: { short: "CEO", role: "Founder / Chief Executive Officer" },
        chi: { short: "CTO", role: "Chief Technology Officer" },
        nhi: { short: "CMO", role: "Chief Marketing Officer" },
        cuong: { short: "CAO", role: "Chief Automation Officer" },
      }),
    },
  },
  vi: {
    team: {
      label: "Ban giám đốc",
      title: "Những người đứng sau Aegis",
      members: members({
        bao: { short: "CEO", role: "Nhà sáng lập / Giám đốc điều hành" },
        chi: { short: "CTO", role: "Giám đốc công nghệ" },
        nhi: { short: "CMO", role: "Giám đốc marketing" },
        cuong: { short: "CAO", role: "Giám đốc tự động hóa" },
      }),
    },
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
