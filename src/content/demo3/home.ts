import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "home" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 *
 * Phần "tài sản lớn lên" (D3Story + StoryFlow / StoryNetwork) có HAI lối vào, mỗi lối một cảnh riêng:
 * - "site": bắt đầu từ website (gói Own · Grow); năm mốc lấy từ t.home.story.milestones của /demo2.
 * - "marketing": chỉ marketing (gói Amplify); năm mốc soạn từ các đầu việc ĐÃ XÁC NHẬN của Amplify trong demo2.ts
 *   (chiến lược kênh và nội dung, giọng văn và hình ảnh thương hiệu, landing page tặng kèm, lịch nội dung + bài đăng đa nền tảng, báo cáo tháng).
 * ⚑ NHÁP chờ duyệt: câu tiêu đề "One-off work fades.", tên hai lối, năm mốc của lối marketing, các nhãn trong cảnh.
 */
const copy = {
  en: {
    story: {
      ink: "One-off work fades.",
      tabsLabel: "Where do you start?",
      paths: {
        site: { tab: "Starting with a website", plans: "Own · Grow", flat: "A website left alone" },
        marketing: {
          tab: "Marketing only",
          plans: "Amplify",
          flat: "Posting that stops",
          milestones: [
            { title: "Strategy.", text: "A channel and content strategy built around your brand." },
            { title: "Brand voice.", text: "A voice and visual guide, so every post looks and sounds like you." },
            { title: "Landing page.", text: "Included for campaigns. Your existing website stays as it is." },
            { title: "Content.", text: "A content calendar, with posts produced and published across platforms." },
            { title: "Reach.", text: "Your channels bring the brand to people who haven't searched for it yet. A report every month." },
          ],
        },
      },
    },
    /** Nhãn trang trí trong hai cảnh (StoryFlow, StoryNetwork), minh hoạ ý tưởng, không có con số nào */
    chart: {
      kicker: "Same start, two paths",
      growth: "Growth by Aegis",
      site: "Website",
      owned: "Owned by you",
      reach: "New audiences",
      channels: "Social channels",
      brand: "Brand",
      landing: "Landing page",
      customers: "Customers",
      pause: "Pause the moving dots",
      play: "Play the moving dots",
    },
  },
  vi: {
    story: {
      ink: "Làm một lần rồi để đó thì sẽ phai.",
      tabsLabel: "Bạn bắt đầu từ đâu?",
      paths: {
        site: { tab: "Bắt đầu từ website", plans: "Own · Grow", flat: "Website bị bỏ đó" },
        marketing: {
          tab: "Chỉ marketing",
          plans: "Amplify",
          flat: "Đăng vài bài rồi ngừng",
          milestones: [
            { title: "Chiến lược.", text: "Chiến lược kênh và nội dung xây quanh thương hiệu của bạn." },
            { title: "Giọng thương hiệu.", text: "Bộ hướng dẫn giọng văn và hình ảnh, để bài đăng nào cũng đúng chất của bạn." },
            { title: "Landing page.", text: "Tặng kèm cho các chiến dịch. Website hiện có của bạn giữ nguyên." },
            { title: "Nội dung.", text: "Lịch nội dung, bài đăng được sản xuất và đăng trên nhiều nền tảng." },
            { title: "Tiếp cận.", text: "Các kênh đưa thương hiệu tới những người chưa từng tìm kiếm bạn. Báo cáo mỗi tháng." },
          ],
        },
      },
    },
    chart: {
      kicker: "Cùng điểm xuất phát, hai lối đi",
      growth: "Growth by Aegis",
      site: "Website",
      owned: "Thuộc về bạn",
      reach: "Khách hàng mới",
      channels: "Kênh mạng xã hội",
      brand: "Thương hiệu",
      landing: "Landing page",
      customers: "Khách hàng",
      pause: "Tạm dừng các chấm chuyển động",
      play: "Chạy tiếp các chấm chuyển động",
    },
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
