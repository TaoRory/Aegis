import type { Locale } from "@/config/space";

/**
 * Chữ giao diện của form liên hệ "Bản vẽ của bạn" và thông báo kiểm tra dữ liệu, theo ngôn ngữ.
 * Câu hỏi và lựa chọn nằm ở contact-flow.ts (tiếng Việt, nguồn gốc) và contact-flow-i18n.ts (bản dịch).
 * Mẫu chuỗi dùng {n}, {total}, {name}, {code}, {channel}.
 */

export interface ContactMessages {
  chooseOne: string;
  invalidChoice: string;
  onlyOne: string;
  specifyOther: string;
  maxChars: string;
  chooseService: string;
  describe: string;
  messageMax: string;
  nameRequired: string;
  nameMax: string;
  contactRequired: string;
  contactFormat: string;
  companyMax: string;
  otherPrefix: string;
}

export interface WizardCopy {
  errors: { VALIDATION: string; NOT_CONFIGURED: string; RATE_LIMITED: string; SPAM: string; DELIVERY_FAILED: string; BAD_REQUEST: string; NETWORK: string };
  received: string;
  receivedLead: string;
  receivedEm: string;
  thanks: string;
  channelEmail: string;
  channelPhone: string;
  another: string;
  step: string;
  stepAria: string;
  stepAriaTotal: string;
  noJs: string;
  questionNumber: string;
  questionFallback: string;
  otherOption: string;
  otherSpecify: string;
  skip: string;
  next: string;
  moreLabel: string;
  nameLabel: string;
  contactLabel: string;
  companyLabel: string;
  optional: string;
  toReview: string;
  sheetCoded: string;
  sheetPlain: string;
  reviewService: string;
  reviewMore: string;
  reviewContact: string;
  none: string;
  pending: string;
  pendingBody: string;
  back: string;
  cannotSend: string;
  sending: string;
  send: string;
  branch: string;
  edit: string;
  briefTitle: string;
  briefService: string;
  briefMark: string;
}

export const contactMessages: Record<Locale, ContactMessages> = {
  vi: {
    chooseOne: "Vui lòng chọn một câu trả lời.",
    invalidChoice: "Lựa chọn không hợp lệ.",
    onlyOne: "Chỉ chọn một câu trả lời.",
    specifyOther: "Vui lòng ghi rõ lựa chọn “Khác”.",
    maxChars: "Tối đa {n} ký tự.",
    chooseService: "Vui lòng chọn hạng mục bạn cần.",
    describe: "Vui lòng mô tả ngắn bài toán (tối thiểu {n} ký tự).",
    messageMax: "Nội dung tối đa {n} ký tự.",
    nameRequired: "Vui lòng nhập họ tên.",
    nameMax: "Họ tên tối đa {n} ký tự.",
    contactRequired: "Vui lòng nhập email hoặc số điện thoại.",
    contactFormat: "Email hoặc số điện thoại chưa đúng định dạng.",
    companyMax: "Tên công ty tối đa {n} ký tự.",
    otherPrefix: "Khác",
  },
  en: {
    chooseOne: "Please choose an answer.",
    invalidChoice: "That choice isn't valid.",
    onlyOne: "Please choose only one answer.",
    specifyOther: "Please say what you mean by “Other”.",
    maxChars: "Up to {n} characters.",
    chooseService: "Please choose the category you need.",
    describe: "Please briefly describe the problem (at least {n} characters).",
    messageMax: "Up to {n} characters.",
    nameRequired: "Please enter your name.",
    nameMax: "Name: up to {n} characters.",
    contactRequired: "Please enter an email or phone number.",
    contactFormat: "That email or phone number doesn't look right.",
    companyMax: "Company name: up to {n} characters.",
    otherPrefix: "Other",
  },
};

export const wizardCopy: Record<Locale, WizardCopy> = {
  vi: {
    errors: {
      VALIDATION: "Một vài câu trả lời cần kiểm tra lại.",
      NOT_CONFIGURED: "Kênh tiếp nhận thông tin chưa được kết nối nên chưa gửi được. Vui lòng quay lại sau.",
      RATE_LIMITED: "Bạn đã gửi nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút.",
      SPAM: "Không gửi được. Vui lòng tải lại trang và thử lại.",
      DELIVERY_FAILED: "Hệ thống chưa gửi được thông tin. Câu trả lời của bạn vẫn còn nguyên, vui lòng thử lại sau.",
      BAD_REQUEST: "Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.",
      NETWORK: "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
    },
    received: "Đã nhận",
    receivedLead: "Aegis đã nhận ",
    receivedEm: "phiếu của bạn.",
    thanks: "Cảm ơn bạn. Aegis sẽ liên hệ lại qua {channel} bạn để lại để trao đổi chi tiết.",
    channelEmail: "email",
    channelPhone: "số điện thoại",
    another: "Gửi yêu cầu khác",
    step: "Bước",
    stepAria: "Bước {n}",
    stepAriaTotal: "Bước {n} trên {total}",
    noJs: "Trình duyệt đang tắt JavaScript: bạn vẫn xem được toàn bộ câu hỏi bên dưới, nhưng cần bật JavaScript để gửi.",
    questionNumber: "Câu {n}",
    questionFallback: "Câu hỏi",
    otherOption: "Khác",
    otherSpecify: "Ghi rõ lựa chọn “Khác”",
    skip: "Bỏ qua",
    next: "Tiếp",
    moreLabel: "Mô tả thêm",
    nameLabel: "Họ tên",
    contactLabel: "Email hoặc SĐT / Zalo",
    companyLabel: "Công ty",
    optional: "Không bắt buộc",
    toReview: "Xem lại phiếu",
    sheetCoded: "Phiếu {code}",
    sheetPlain: "Phiếu yêu cầu",
    reviewService: "Hạng mục",
    reviewMore: "Mô tả thêm",
    reviewContact: "Liên hệ",
    none: "Không có",
    pending: "Trạng thái: chờ kết nối",
    pendingBody: "Kênh tiếp nhận của form đang chờ kết nối nên phiếu hiện chưa thể gửi đi. Form sẽ hoạt động ngay khi kênh nhận được cấu hình.",
    back: "← Quay lại",
    cannotSend: "Chưa thể gửi",
    sending: "Đang gửi…",
    send: "Gửi phiếu",
    branch: "Nếu chọn {name}",
    edit: "Sửa",
    briefTitle: "Phiếu yêu cầu",
    briefService: "Hạng mục",
    briefMark: "+ Aegis · tỉ lệ 1:1",
  },
  en: {
    errors: {
      VALIDATION: "A few answers need another look.",
      NOT_CONFIGURED: "The channel that receives requests isn't connected yet, so nothing can be sent. Please come back later.",
      RATE_LIMITED: "You've sent several requests in a short time. Please try again in a few minutes.",
      SPAM: "It couldn't be sent. Please reload the page and try again.",
      DELIVERY_FAILED: "The system couldn't send your request. Your answers are still here; please try again later.",
      BAD_REQUEST: "That request wasn't valid. Please reload the page and try again.",
      NETWORK: "Couldn't reach the server. Please check your connection and try again.",
    },
    received: "Received",
    receivedLead: "Aegis has received ",
    receivedEm: "your request.",
    thanks: "Thank you. Aegis will get back to you by {channel} to discuss the details.",
    channelEmail: "the email you left",
    channelPhone: "the phone number you left",
    another: "Send another request",
    step: "Step",
    stepAria: "Step {n}",
    stepAriaTotal: "Step {n} of {total}",
    noJs: "JavaScript is turned off in your browser: you can still read every question below, but you need JavaScript to send.",
    questionNumber: "Question {n}",
    questionFallback: "Question",
    otherOption: "Other",
    otherSpecify: "Say what you mean by “Other”",
    skip: "Skip",
    next: "Next",
    moreLabel: "More detail",
    nameLabel: "Full name",
    contactLabel: "Email or phone / Zalo",
    companyLabel: "Company",
    optional: "Optional",
    toReview: "Review the sheet",
    sheetCoded: "Sheet {code}",
    sheetPlain: "Request sheet",
    reviewService: "Category",
    reviewMore: "More detail",
    reviewContact: "Contact",
    none: "None",
    pending: "Status: waiting to be connected",
    pendingBody: "The channel that receives this form isn't connected yet, so the sheet can't be sent for now. The form will work as soon as the channel is configured.",
    back: "← Back",
    cannotSend: "Can't send yet",
    sending: "Sending…",
    send: "Send the sheet",
    branch: "If you choose {name}",
    edit: "Edit",
    briefTitle: "Request sheet",
    briefService: "Category",
    briefMark: "+ Aegis · scale 1:1",
  },
};
