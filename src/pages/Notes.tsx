import { useState, type FormEvent } from "react";
import { Plus, Pin, PinOff, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { PINK, VIOLET, inputCls, Modal, Field, GhostButton, PrimaryButton } from "../components/common";

export function NotesPage() {
  const { data, addNote, updateNote, deleteNote } = useStore();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...data.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Ghi chú</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Ghi nhanh việc cần làm, số đo khách đặc biệt, hẹn lịch gọi...</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${PINK}, ${VIOLET})` }}
        >
          <Plus size={14} /> Ghi chú mới
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-card border border-white/[0.06] rounded-2xl px-6 py-14 text-center text-sm text-muted-foreground">
          Chưa có ghi chú nào. Bấm "Ghi chú mới" để bắt đầu.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {sorted.map((n) => (
            <div key={n.id} className="bg-card border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{n.title || "Không có tiêu đề"}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateNote(n.id, { pinned: !n.pinned })} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                    {n.pinned ? <Pin size={13} style={{ color: PINK }} /> : <PinOff size={13} />}
                  </button>
                  <button onClick={() => deleteNote(n.id)} className="p-1 rounded-lg text-muted-foreground hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap flex-1">{n.content}</p>
              <p className="text-[10px] text-muted-foreground/50">{new Date(n.updatedAt).toLocaleDateString("vi-VN")}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewNoteModal onClose={() => setShowModal(false)} onSave={addNote} />}
    </div>
  );
}

function NewNoteModal({ onClose, onSave }: { onClose: () => void; onSave: (n: { title: string; content: string; pinned: boolean }) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), pinned: false });
    onClose();
  }

  return (
    <Modal title="Ghi chú mới" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tiêu đề">
          <input autoFocus className={inputCls} placeholder="Việc cần làm, số đo..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Nội dung">
          <textarea className={inputCls} rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">Lưu ghi chú</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
