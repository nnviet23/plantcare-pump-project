# Kiểm tra và chạy SmartFarm

## Chạy local

- Backend đọc thông tin kết nối từ `backend/.env` (đã sao chép cấu hình hiện có từ `frontend/env`). Không đưa khóa backend vào biến `VITE_*`.
- Frontend dùng `frontend/.env.development`: `http://localhost:5000/api` và Socket.IO `http://localhost:5000`.
- Khởi động lại backend và Vite sau khi sửa biến môi trường:

```powershell
cd backend
npm.cmd start
```

Mở terminal khác:

```powershell
cd frontend
npm.cmd run dev
```

Đăng nhập lại nếu token cũ hết hạn. `/api/health` trả trạng thái MongoDB và MQTT thực tế; HTTP 503 nghĩa là cơ sở dữ liệu chưa sẵn sàng.

## Cấu hình triển khai

`frontend/.env.production` đã chuyển từ biến React cũ sang `VITE_API_URL` và `VITE_SOCKET_URL`. URL Azure hiện có không phân giải được DNS tại thời điểm kiểm tra; cần thay bằng địa chỉ backend thực đang chạy rồi build/triển khai lại frontend.

Backend nhận danh sách origin frontend qua `CORS_ORIGINS` hoặc `CLIENT_URL` (URL đầy đủ, nhiều URL cách nhau bởi dấu phẩy).

## Kết nối MongoDB hiện tại

Kiểm tra ngày 07/09/2026: DNS mặc định không truy vấn được SRV MongoDB. Bộ phân giải riêng cho Node `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` đã tìm được ba nút. Kết nối tiếp theo thất bại với `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` ở cả ba nút.

Cần kiểm tra trạng thái cluster, Network Access/IP của máy chạy backend, URI kết nối hiện tại và đường mạng/TLS tới Atlas. Không tắt kiểm tra chứng chỉ để bỏ qua lỗi. Có thể kiểm tra lại, không in khóa hoặc mật khẩu:

```powershell
node backend/scripts/check-database.cjs
```

## Dữ liệu và máy bơm

- Frontend lấy dữ liệu từ API; mỗi nhóm dữ liệu tải độc lập, thử lại mỗi 15 giây và khi Socket.IO kết nối lại. Lỗi nhật ký không khóa điều khiển.
- Các gói MQTT chỉ lưu số đo thực đã nhận, không điền giá trị cảm biến giả. `light_raw` được giữ là ADC; chỉ `light_percent` là phần trăm.
- Chuyển AUTO/MANUAL gửi tới `plantcare/group15/device/mode` và đồng bộ qua sự kiện `settings_update`.
- Bật/tắt gửi `{pump:1/0}` tới `plantcare/group15/device/pump`. Bật thủ công chỉ được phép trong MANUAL; lỗi broker không được báo thành công.
- Trạng thái nhận từ thiết bị trên topic `plantcare/group15/mode` có thể chứa `mode`, `pump` hoặc `pumpStatus`. MQTT QoS 1 xác nhận broker nhận lệnh, không thay thế xác nhận vật lý của ESP32.
- Lưu ngưỡng hiện lưu tại backend. Repository chưa có firmware ESP32 hoặc giao thức nhận ngưỡng; cần phần firmware tương ứng để xác nhận ngưỡng này điều khiển thuật toán AUTO trên thiết bị.
- Không chạy `mockESP32.js` khi muốn xem dữ liệu cảm biến thật; bộ kiểm thử không khởi động trình giả lập này.

## Trợ lý AI

Khóa Gemini hiện có đã trả lời được câu hỏi trồng trọt. Luồng dùng kiểm tra chủ đề đầu vào, trả lời theo số đo backend (hoặc ghi thiếu dữ liệu), rồi kiểm tra phạm vi đầu ra. Yêu cầu trộn chăm cây với viết code đã bị từ chối khi thử dịch vụ thật. Lỗi dịch vụ hiển thị trong khung chat và có nút thử lại. Bộ lọc AI không phải bảo đảm tuyệt đối với mọi cách diễn đạt; kiểm thử nên được bổ sung khi có trường hợp vượt phạm vi.

```powershell
node backend/scripts/check-live-chat.cjs
```

## Kiểm thử

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix frontend test
npm.cmd --prefix frontend run build
```

Kiểm thử giao diện chạy Edge, dùng API fixtures trong trình duyệt để kiểm tra hành vi và payload. Kiểm thử backend dùng mô hình/MQTT thay thế để không bật máy bơm thật. Các script `check-*` kiểm tra riêng dịch vụ thật; không gửi lệnh điều khiển thiết bị.
