import React, { useState } from "react";
import { useStore } from "../../lib/store";
import type { Customer } from "../../lib/types";
import { Field, GhostButton, Modal, PrimaryButton, inputCls } from "../common";

export function CustomerModal({
  customer,
  onClose,
}: {
  customer?: Customer;
  onClose: () => void;
}) {
  const { addCustomer, updateCustomer, data } = useStore();
  const isEdit = !!customer;
  const [className, setClassName] = useState(customer?.className ?? "");
  const [teacherName, setTeacherName] = useState(customer?.teacherName ?? "");
  const [school, setSchool] = useState(customer?.school ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [studentCount, setStudentCount] = useState(customer?.studentCount ?? 0);
  const [note, setNote] = useState(customer?.note ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!className.trim()) return;
    const payload = {
      className: className.trim(),
      teacherName,
      school,
      phone,
      studentCount,
      note,
    };
    if (isEdit && customer) updateCustomer(customer.id, payload);
    else addCustomer(payload);
    onClose();
  }

  return (
    <Modal
      title={isEdit ? "Sửa thông tin lớp" : "Thêm lớp mới"}
      subtitle="Nhập thông tin lớp học"
      onClose={onClose}
      width={500}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Lớp">
          <input
            autoFocus
            className={inputCls}
            placeholder="Ví dụ: 12A1"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </Field>
        <Field label="Tên giáo viên chủ nhiệm">
          <input
            className={inputCls}
            placeholder="Cô Nguyễn Thị A"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
          />
        </Field>
        <Field label="Trường">
          <input
            className={inputCls}
            placeholder="THPT Chuyên Hà Nội"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </Field>
        <Field label="Số điện thoại liên hệ (lớp trưởng...)">
          <input
            className={inputCls}
            placeholder="09xx xxx xxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="Sĩ số (số học sinh)">
          <input
            type="number"
            min={0}
            className={inputCls}
            value={studentCount}
            onChange={(e) => setStudentCount(Math.max(0, +e.target.value))}
          />
        </Field>
        <Field label="Ghi chú">
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Dị ứng vải, yêu cầu đặc biệt..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">
            {isEdit ? "Lưu thay đổi" : "Thêm lớp"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
