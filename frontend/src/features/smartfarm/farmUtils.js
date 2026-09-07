export function normalizeSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim().replace(/\s+/g, ' ');
}
const entries = [
  { path: '/', title: 'Trang chủ', description: 'Cảm biến, độ ẩm đất, nhiệt độ, ánh sáng, mực nước', keywords: 'tong quan dashboard du lieu data do am dat nhiet do anh sang be nuoc cam bien' },
  { path: '/control', title: 'Điều khiển máy bơm', description: 'Chế độ tự động, thủ công và cấu hình ngưỡng tưới', keywords: 'thiet bi bat tat bom tuoi nuoc nguong auto manual tu dong thu cong' },
  { path: '/history', title: 'Nhật ký & Thống kê', description: 'Lịch sử tưới, biểu đồ và dữ liệu cảm biến', keywords: 'lich su thong ke du lieu data bieu do nhat ky' },
  { path: '/chatbot', title: 'Trợ lý AI', description: 'Tư vấn trồng trọt, chăm sóc cây và sâu bệnh', keywords: 'chat ai cay trong trong trot phan bon vang la sau benh' },
  { path: '/settings', title: 'Cài đặt', description: 'Giao diện, tài khoản, xuất dữ liệu CSV', keywords: 'tai khoan giao dien mau toi sang xuat csv cau hinh' },
  { path: '/support', title: 'Hỗ trợ', description: 'Câu hỏi thường gặp và hướng dẫn sử dụng', keywords: 'huong dan tro giup faq lien he ket noi loi' },
];
export function searchFeatures(query) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return entries.filter(item => terms.every(term => normalizeSearch(`${item.title} ${item.description} ${item.keywords}`).includes(term)));
}
export function apiError(error) {
  if ([401, 403].includes(error?.response?.status)) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (error?.code === 'ECONNABORTED') return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
  return error?.response?.data?.message || 'Không kết nối được backend. Kiểm tra máy chủ và địa chỉ API.';
}
export function localDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
