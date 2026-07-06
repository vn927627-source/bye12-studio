import React, { useState } from "react";
import { useStore } from "../../lib/store";
import type { Customer } from "../../lib/types";
import { Field, GhostButton, Modal, PrimaryButton, inputCls } from "../common";

export function CustomerModal({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { addCustomer, updateCustomer, updateSettings, data } = useStore();
  const isEdit = !!customer;
  const [className, setClassName] = useState(customer?.className ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [studentCount, setStudentCount] = useState(customer?.studentCount ?? 0);
  const [note, setNote] = useState(customer?.note ?? "");
  const [sheetLink, setSheetLink] = useState(data.settings.googleSheetLink);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!className.trim()) return;
    const payload = { className: className.trim(), phone, studentCount, note };
    if (isEdit && customer) updateCustomer(customer.id, payload);
    else addCustomer(payload);
    if (sheetLink !== data.settings.googleSheetLink) updateSettings({ googleSheetLink: sheetLink });
    onClose();
  }

  return (
    <Modal title={isEdit ? "Sửa thông tin lớp" : "Thêm lớp mới"} subtitle="Dữ liệu có thể đối chiếu với Google Sheets" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Lớp">
          <input autoFocus className={inputCls} placeholder="Ví dụ: 12A1" value={className} onChange={(e) => setClassName(e.target.value)} />
        </Field>
        <Field label="Số điện thoại liên hệ (lớp trưởng...)">
          <input className={inputCls} placeholder="09xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Số lượng học sinh">
          <input type="number" min={0} className={inputCls} value={studentCount} onChange={(e) => setStudentCount(Math.max(0, +e.target.value))} />
        </Field>
        <Field label="Ghi chú">
          <textarea className={inputCls} rows={2} placeholder="Dị ứng vải, yêu cầu đặc biệt..." value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field label="Link Google Sheets đối chiếu (tùy chọn)">
          <input
            className={inputCls}
            placeholder="https://docs.google.com/spreadsheets/..."
            value={sheetLink}
            onChange={(e) => setSheetLink(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">Lưu ở Cài đặt, dùng chung cho mọi lớp để đối chiếu số lượng khách thuê.</p>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">{isEdit ? "Lưu thay đổi" : "Thêm lớp"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
