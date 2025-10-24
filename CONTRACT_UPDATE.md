# GenDaily Contract Update

## Contract Address Mới
- **Contract Address**: `0x362DAaCBaca07c64E7C9fa32787A6c1F0001A076`
- **Network**: GenLayer Studio Net
- **API URL**: `https://studio.genlayer.com/api`

## Các Thay Đổi Đã Thực Hiện

### 1. Cập Nhật Contract Address
- ✅ Cập nhật trong `src/lib/genlayer.ts`
- ✅ Cập nhật trong `src/hooks/useCheckinAction.ts`
- ✅ Cập nhật trong `src/hooks/useCheckinData.ts`
- ✅ Cập nhật trong `src/components/CheckInButton.tsx`
- ✅ Tạo file `.env` với contract address mới

### 2. Debug Logs Đã Thêm
- ✅ Log contract address trong `getMyStats()`
- ✅ Log contract address trong `checkInWithContent()`
- ✅ Log chi tiết trong `useCheckinAction`
- ✅ Log chi tiết trong `CheckInButton`

## Cách Test Contract Mới

### 1. Chạy Ứng Dụng
```bash
npm run dev
```

### 2. Kiểm Tra Console Logs
- Mở Developer Console (F12)
- Kết nối wallet
- Kiểm tra logs với prefix `🔍` để xác nhận contract address mới

### 3. Test Check-in
- Nhập nội dung vào textarea
- Nhấn nút "Check In"
- Kiểm tra logs để xác nhận transaction được gửi đến contract mới

## Các Function Names Trong Contract Mới

### Write Functions
- `checkin_sentence(content_text: str)` - Check-in với nội dung
- `set_policy(...)` - Cập nhật policy (owner only)
- `transfer_ownership(new_owner_hex: str)` - Chuyển quyền sở hữu (owner only)

### View Functions
- `get_my_stats()` - Lấy stats của user hiện tại
- `get_user_stats(account_address: str)` - Lấy stats của user khác
- `is_checked_today()` - Kiểm tra đã check-in hôm nay chưa
- `current_day_index()` - Lấy day index hiện tại
- `next_reset_time()` - Lấy thời gian reset tiếp theo
- `get_day_range_counts(start_day: int, end_day: int)` - Lấy counts trong khoảng ngày
- `my_today_cid()` - Lấy CID của check-in hôm nay
- `get_checkin(cid: int)` - Lấy thông tin check-in theo CID
- `get_policy()` - Lấy policy hiện tại

### Enhanced Functions (Mới)
- `get_user_streak_details(account_address: str)` - Lấy thông tin streak chi tiết
- `get_my_streak_details()` - Lấy thông tin streak của user hiện tại
- `validate_all_streaks()` - Validate tất cả streaks (owner only)

## Lưu Ý
- Contract mới có logic streak đã được sửa
- Tất cả debug logs đã được thêm để dễ dàng troubleshoot
- File `.env` đã được tạo với contract address mới
