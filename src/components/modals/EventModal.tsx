// src/components/modals/EventModal.tsx
import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { Field, GhostButton, Modal, PrimaryButton, inputCls } from "../common";
import { todayISO } from "../../lib/utils";

export function EventModal({ onClose }: { onClose: () => void }) {
  const { addEvent } = useStore();
  const [date, setDate] = useState(todayISO());
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"studio" | "other">("studio");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    addEvent({ date, label: label.trim(), type });
    onClose();
  }

  return (
    <Modal title="Thêm sự kiện" onClose={onClose} width={420}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Ngày">
          <input
            type="date"
            className={inputCls}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Nội dung">
          <input
            autoFocus
            className={inputCls}
            placeholder="Studio shoot, họp lớp..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>
        <Field label="Loại">
          <div className="flex gap-2">
            {(
              [
                { id: "studio", label: "Sự kiện studio" },
                { id: "other", label: "Khác" },
              ] as const
            ).map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  type === t.id
                    ? "border-white/25 bg-white/[0.08] text-foreground"
                    : "border-white/[0.06] text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">Thêm sự kiện</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
