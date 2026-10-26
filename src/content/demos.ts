import type { Locale } from "@/config/space";

/**
 * Nội dung 3 demo minh họa trong Factory (AI, phần mềm quản trị, marketing).
 * Thương hiệu "Minh Phát" và mọi dữ liệu dưới đây là GIẢ ĐỊNH, chỉ để người xem hình dung cách Aegis tiếp cận một bài toán
 * điển hình. Không phải khách hàng, sản phẩm hay kết quả thật; không có số liệu hiệu quả (reach, doanh thu…).
 * Demo AI chạy theo kịch bản soạn sẵn, không gọi mô hình AI nào.
 */

export interface AiDemo {
  title: string;
  lead: string;
  scripted: string;
  docTitle: string;
  sections: { id: string; heading: string; body: string }[];
  askLabel: string;
  questions: { q: string; a: string; cite: string }[];
  you: string;
  assistant: string;
  sourceLabel: string;
  thinking: string;
  reset: string;
}

export interface OpsDemo {
  title: string;
  lead: string;
  columns: { id: string; name: string }[];
  orders: { id: string; customer: string; items: string; column: string }[];
  moveLabel: string;
  moveBack: string;
  approvalsTitle: string;
  approvals: { id: string; what: string; by: string }[];
  approve: string;
  reject: string;
  approved: string;
  rejected: string;
  stockTitle: string;
  stockFilter: string;
  all: string;
  low: string;
  stock: { sku: string; name: string; group: string; qty: number; min: number }[];
  qtyLabel: string;
  reset: string;
}

export interface CalendarDemo {
  title: string;
  lead: string;
  days: string[];
  channels: { id: string; name: string }[];
  backlogTitle: string;
  ideas: { id: string; title: string; channel: string; caption: string }[];
  pick: string;
  picked: string;
  place: string;
  remove: string;
  previewTitle: string;
  previewEmpty: string;
  brand: string;
  reset: string;
}

export interface DemoContent {
  ai: AiDemo;
  software: OpsDemo;
  marketing: CalendarDemo;
}

const vi: DemoContent = {
  ai: {
    title: "Trợ lý tài liệu nội bộ",
    lead: "Nhân viên hỏi bằng câu thường ngày, trợ lý trả lời dựa trên đúng tài liệu nội bộ và chỉ ra đoạn được dùng. Bấm một câu hỏi để xem.",
    scripted: "Câu trả lời trong demo là kịch bản soạn sẵn, không gọi mô hình AI.",
    docTitle: "Minh Phát · Quy định đổi trả hàng (bản nội bộ)",
    sections: [
      { id: "s1", heading: "1. Thời hạn đổi trả", body: "Khách được đổi hoặc trả hàng trong 7 ngày kể từ ngày nhận, nếu sản phẩm còn nguyên tem và hóa đơn." },
      { id: "s2", heading: "2. Hàng không áp dụng", body: "Hàng giảm giá cuối mùa và hàng đặt may theo số đo không áp dụng đổi trả, trừ khi lỗi do nhà sản xuất." },
      { id: "s3", heading: "3. Hoàn tiền", body: "Tiền được hoàn về đúng phương thức thanh toán ban đầu trong 3 ngày làm việc sau khi kho xác nhận nhận lại hàng." },
      { id: "s4", heading: "4. Người duyệt", body: "Trưởng cửa hàng duyệt các yêu cầu dưới 5 triệu đồng; yêu cầu lớn hơn chuyển phòng vận hành." },
    ],
    askLabel: "Câu hỏi gợi ý",
    questions: [
      { q: "Khách mua 10 ngày rồi có trả được không?", a: "Không. Thời hạn đổi trả là 7 ngày kể từ ngày nhận hàng, nên đơn đã 10 ngày nằm ngoài quy định.", cite: "s1" },
      { q: "Áo đặt may theo số đo bị hỏng đường chỉ thì sao?", a: "Hàng đặt may không áp dụng đổi trả, nhưng lỗi đường chỉ là lỗi do nhà sản xuất nên vẫn được xử lý.", cite: "s2" },
      { q: "Bao lâu thì khách nhận lại tiền?", a: "Trong 3 ngày làm việc sau khi kho xác nhận đã nhận lại hàng, hoàn về đúng phương thức thanh toán ban đầu.", cite: "s3" },
      { q: "Yêu cầu trả hàng 8 triệu ai duyệt?", a: "Yêu cầu từ 5 triệu đồng trở lên được chuyển cho phòng vận hành duyệt, không do trưởng cửa hàng.", cite: "s4" },
    ],
    you: "Bạn",
    assistant: "Trợ lý",
    sourceLabel: "Nguồn",
    thinking: "Đang tra tài liệu…",
    reset: "Làm lại",
  },
  software: {
    title: "Bảng điều phối vận hành",
    lead: "Đơn hàng, phiếu cần duyệt và tồn kho nằm trên một màn hình, theo đúng quy trình của doanh nghiệp. Chuyển đơn sang bước sau, duyệt phiếu, lọc hàng sắp hết.",
    columns: [
      { id: "new", name: "Mới" },
      { id: "doing", name: "Đang xử lý" },
      { id: "ship", name: "Giao hàng" },
      { id: "done", name: "Hoàn tất" },
    ],
    orders: [
      { id: "DH-1042", customer: "Cửa hàng Quận 3", items: "12 áo sơ mi", column: "new" },
      { id: "DH-1043", customer: "Đại lý Thủ Đức", items: "40 quần tây", column: "new" },
      { id: "DH-1039", customer: "Cửa hàng Quận 1", items: "8 áo khoác", column: "doing" },
      { id: "DH-1036", customer: "Đại lý Biên Hòa", items: "25 áo thun", column: "ship" },
      { id: "DH-1031", customer: "Cửa hàng Quận 7", items: "6 bộ vest", column: "done" },
    ],
    moveLabel: "Chuyển sang bước sau",
    moveBack: "Trả về bước trước",
    approvalsTitle: "Phiếu chờ duyệt",
    approvals: [
      { id: "PN-208", what: "Nhập 200 m vải kaki", by: "Kho tổng" },
      { id: "PC-117", what: "Chi phí vận chuyển tháng", by: "Kế toán" },
      { id: "PX-095", what: "Xuất hàng cho đại lý Thủ Đức", by: "Bán hàng" },
    ],
    approve: "Duyệt",
    reject: "Từ chối",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    stockTitle: "Tồn kho",
    stockFilter: "Lọc",
    all: "Tất cả",
    low: "Sắp hết",
    stock: [
      { sku: "SM-01", name: "Áo sơ mi trắng", group: "Áo", qty: 14, min: 30 },
      { sku: "QT-04", name: "Quần tây xám", group: "Quần", qty: 86, min: 40 },
      { sku: "AK-02", name: "Áo khoác kaki", group: "Áo", qty: 9, min: 15 },
      { sku: "AT-07", name: "Áo thun cổ tròn", group: "Áo", qty: 120, min: 50 },
      { sku: "VS-03", name: "Bộ vest xanh than", group: "Bộ", qty: 22, min: 10 },
    ],
    qtyLabel: "Tồn / mức tối thiểu",
    reset: "Làm lại",
  },
  marketing: {
    title: "Lịch nội dung đa kênh",
    lead: "Lên lịch đăng cho cả tuần trên nhiều kênh. Chọn một ý tưởng trong danh sách rồi đặt vào ô (ngày × kênh); bấm vào bài đã đặt để xem trước.",
    days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    channels: [
      { id: "fb", name: "Facebook" },
      { id: "ig", name: "Instagram" },
      { id: "web", name: "Blog website" },
    ],
    backlogTitle: "Ý tưởng chờ lên lịch",
    ideas: [
      { id: "i1", title: "Mở bán bộ sưu tập mùa thu", channel: "fb", caption: "Bộ sưu tập mùa thu đã có tại tất cả cửa hàng Minh Phát. Ghé xem những gam màu mới nhé!" },
      { id: "i2", title: "Hậu trường xưởng may", channel: "ig", caption: "Một ngày ở xưởng may: từ cuộn vải đến chiếc áo hoàn chỉnh." },
      { id: "i3", title: "Cách chọn áo sơ mi theo dáng người", channel: "web", caption: "Hướng dẫn ngắn giúp bạn chọn áo sơ mi vừa vặn với dáng người." },
      { id: "i4", title: "Giới thiệu cửa hàng Quận 7", channel: "fb", caption: "Cửa hàng mới ở Quận 7 đã mở cửa. Hẹn gặp bạn cuối tuần này!" },
      { id: "i5", title: "Phối đồ công sở 5 ngày", channel: "ig", caption: "Năm bộ phối đồ công sở cho cả tuần, dễ mặc mà vẫn chỉn chu." },
    ],
    pick: "Chọn",
    picked: "Đang chọn",
    place: "Đặt vào",
    remove: "Gỡ khỏi lịch",
    previewTitle: "Xem trước bài đăng",
    previewEmpty: "Bấm vào một bài trong lịch để xem trước.",
    brand: "Minh Phát",
    reset: "Làm lại",
  },
};

const en: DemoContent = {
  ai: {
    title: "Internal document assistant",
    lead: "Staff ask in everyday language, and the assistant answers from the right internal document and points to the passage it used. Tap a question to see it.",
    scripted: "Answers in this demo are pre-written scripts; no AI model is called.",
    docTitle: "Minh Phát · Returns policy (internal)",
    sections: [
      { id: "s1", heading: "1. Return window", body: "Customers can exchange or return items within 7 days of delivery, provided the tags and receipt are intact." },
      { id: "s2", heading: "2. Exclusions", body: "End-of-season sale items and made-to-measure items cannot be returned, unless the fault is the manufacturer's." },
      { id: "s3", heading: "3. Refunds", body: "Refunds go back to the original payment method within 3 working days after the warehouse confirms it has received the item." },
      { id: "s4", heading: "4. Approvers", body: "Store managers approve requests under 5 million VND; larger requests go to the operations team." },
    ],
    askLabel: "Suggested questions",
    questions: [
      { q: "A customer bought this 10 days ago. Can they return it?", a: "No. The return window is 7 days from delivery, so a 10-day-old order is outside the policy.", cite: "s1" },
      { q: "A made-to-measure shirt has a broken seam. What now?", a: "Made-to-measure items can't be returned, but a broken seam is a manufacturer's fault, so it is still handled.", cite: "s2" },
      { q: "How long until the customer gets their money back?", a: "Within 3 working days after the warehouse confirms receipt, refunded to the original payment method.", cite: "s3" },
      { q: "Who approves an 8 million VND return?", a: "Requests of 5 million VND or more go to the operations team for approval, not the store manager.", cite: "s4" },
    ],
    you: "You",
    assistant: "Assistant",
    sourceLabel: "Source",
    thinking: "Checking the document…",
    reset: "Start over",
  },
  software: {
    title: "Operations board",
    lead: "Orders, pending approvals and stock on one screen, following the business's own process. Move orders to the next stage, approve requests, filter low stock.",
    columns: [
      { id: "new", name: "New" },
      { id: "doing", name: "In progress" },
      { id: "ship", name: "Shipping" },
      { id: "done", name: "Done" },
    ],
    orders: [
      { id: "DH-1042", customer: "District 3 store", items: "12 shirts", column: "new" },
      { id: "DH-1043", customer: "Thu Duc reseller", items: "40 trousers", column: "new" },
      { id: "DH-1039", customer: "District 1 store", items: "8 jackets", column: "doing" },
      { id: "DH-1036", customer: "Bien Hoa reseller", items: "25 T-shirts", column: "ship" },
      { id: "DH-1031", customer: "District 7 store", items: "6 suits", column: "done" },
    ],
    moveLabel: "Move to next stage",
    moveBack: "Move back",
    approvalsTitle: "Pending approvals",
    approvals: [
      { id: "PN-208", what: "Receive 200 m of khaki fabric", by: "Main warehouse" },
      { id: "PC-117", what: "Monthly shipping costs", by: "Accounting" },
      { id: "PX-095", what: "Dispatch to Thu Duc reseller", by: "Sales" },
    ],
    approve: "Approve",
    reject: "Reject",
    approved: "Approved",
    rejected: "Rejected",
    stockTitle: "Stock",
    stockFilter: "Filter",
    all: "All",
    low: "Low stock",
    stock: [
      { sku: "SM-01", name: "White shirt", group: "Tops", qty: 14, min: 30 },
      { sku: "QT-04", name: "Grey trousers", group: "Bottoms", qty: 86, min: 40 },
      { sku: "AK-02", name: "Khaki jacket", group: "Tops", qty: 9, min: 15 },
      { sku: "AT-07", name: "Crew-neck T-shirt", group: "Tops", qty: 120, min: 50 },
      { sku: "VS-03", name: "Navy suit", group: "Sets", qty: 22, min: 10 },
    ],
    qtyLabel: "Stock / minimum",
    reset: "Start over",
  },
  marketing: {
    title: "Multi-channel content calendar",
    lead: "Plan a week of posts across channels. Pick an idea from the list, then place it in a slot (day × channel); tap a scheduled post to preview it.",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    channels: [
      { id: "fb", name: "Facebook" },
      { id: "ig", name: "Instagram" },
      { id: "web", name: "Website blog" },
    ],
    backlogTitle: "Ideas to schedule",
    ideas: [
      { id: "i1", title: "Autumn collection launch", channel: "fb", caption: "The autumn collection is now in every Minh Phát store. Come and see the new colours!" },
      { id: "i2", title: "Behind the scenes at the workshop", channel: "ig", caption: "A day at the workshop: from a roll of fabric to a finished shirt." },
      { id: "i3", title: "Choosing a shirt for your build", channel: "web", caption: "A short guide to finding a shirt that fits your build." },
      { id: "i4", title: "Meet the District 7 store", channel: "fb", caption: "Our new District 7 store is open. See you this weekend!" },
      { id: "i5", title: "Five days of office outfits", channel: "ig", caption: "Five office outfits for the week, easy to wear and still sharp." },
    ],
    pick: "Pick",
    picked: "Picked",
    place: "Place in",
    remove: "Remove from calendar",
    previewTitle: "Post preview",
    previewEmpty: "Tap a post in the calendar to preview it.",
    brand: "Minh Phát",
    reset: "Start over",
  },
};

export const demoContent: Record<Locale, DemoContent> = { vi, en };
