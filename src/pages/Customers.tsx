// src/pages/Customers.tsx
import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  Save,
  X as XIcon,
} from "lucide-react";
import { useStore } from "../lib/store";
import { CustomerModal } from "../components/modals/CustomerModal";
import {
  PINK,
  VIOLET,
  inputCls,
  Modal,
  Field,
  PrimaryButton,
  GhostButton,
  NumberInput,
} from "../components/common";
import type { Customer, Student } from "../lib/types";
import { calculateSize } from "../lib/utils";

export function Customers() {
  const { data, deleteCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const filtered = data.customers.filter(
    (c) =>
      c.className.toLowerCase().includes(query.toLowerCase()) ||
      c.teacherName?.toLowerCase().includes(query.toLowerCase()),
  );

  function orderCount(customerId: string) {
    return data.orders.filter((o) => o.customerId === customerId).length;
  }

  function studentCount(customerId: string) {
    return data.students.filter((s) => s.customerId === customerId).length;
  }

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Quản lý Khách hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.customers.length} lớp · {data.students.length} học sinh
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${PINK}, ${VIOLET})` }}
        >
          <Plus size={14} /> Thêm khách hàng
        </button>
      </div>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-white/20"
          placeholder="Tìm kiếm theo lớp hoặc giáo viên..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted-foreground text-center">
            {data.customers.length === 0
              ? 'Chưa có lớp nào. Bấm "Thêm khách hàng" để bắt đầu.'
              : "Không tìm thấy lớp phù hợp."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="text-left font-medium px-6 py-3">Lớp</th>
                <th className="text-left font-medium px-6 py-3">Giáo viên</th>
                <th className="text-left font-medium px-6 py-3">Trường</th>
                <th className="text-left font-medium px-6 py-3">Sĩ số</th>
                <th className="text-left font-medium px-6 py-3">Đơn thuê</th>
                <th className="text-left font-medium px-6 py-3">Ghi chú</th>
                <th className="text-right font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.04] group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${PINK}, ${VIOLET})`,
                        }}
                      >
                        {c.className.slice(0, 1)}
                      </span>
                      <span className="text-foreground font-medium">
                        {c.className}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {c.teacherName || "—"}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {c.school || "—"}
                  </td>
                  <td className="px-6 py-3 text-foreground font-medium">
                    {studentCount(c.id)}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {orderCount(c.id)} đơn
                  </td>
                  <td className="px-6 py-3 text-muted-foreground truncate max-w-[200px]">
                    {c.note || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                        title="Quản lý học sinh"
                      >
                        <Users size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(c);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CustomerModal customer={editing} onClose={() => setShowModal(false)} />
      )}

      {selectedCustomer && (
        <StudentTableModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

// ─── Student Table Modal ────────────────────────────────

function StudentTableModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const { data, addStudent, updateStudent, deleteStudent } = useStore();
  const students = data.students.filter((s) => s.customerId === customer.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: "",
    height: 0,
    weight: 0,
    note: "",
  });

  const handleAdd = () => {
    if (!newStudent.name) return;
    const size = calculateSize(newStudent.height || 0, newStudent.weight || 0);
    addStudent({
      customerId: customer.id,
      name: newStudent.name.trim(),
      height: newStudent.height || 0,
      weight: newStudent.weight || 0,
      size,
      note: newStudent.note,
    });
    setNewStudent({ name: "", height: 0, weight: 0, note: "" });
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData({ ...student });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const size = calculateSize(editData.height || 0, editData.weight || 0);
    updateStudent(editingId, { ...editData, size });
    setEditingId(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const getSizeFromInput = (h: number, w: number) => {
    return calculateSize(h, w);
  };

  return (
    <Modal
      title={`Quản lý sĩ số - ${customer.className}`}
      subtitle={`Giáo viên: ${customer.teacherName || "Chưa có"} | Trường: ${customer.school || "Chưa có"}`}
      onClose={onClose}
      width={820}
    >
      <div className="space-y-4">
        {/* Bảng danh sách học sinh */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70 border-b border-white/[0.05]">
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Họ và tên</th>
                <th className="text-left px-3 py-2">Chiều cao (cm)</th>
                <th className="text-left px-3 py-2">Cân nặng (kg)</th>
                <th className="text-left px-3 py-2">Size</th>
                <th className="text-left px-3 py-2">Ghi chú</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const isEditing = editingId === s.id;
                return (
                  <tr
                    key={s.id}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-3 py-2 text-muted-foreground text-center">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputCls + " w-full"}
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                        />
                      ) : (
                        <span className="text-foreground">{s.name}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <NumberInput
                          value={editData.height}
                          onChange={(v) => {
                            setEditData({ ...editData, height: v });
                            const size = calculateSize(v, editData.weight || 0);
                            setEditData((prev) => ({
                              ...prev,
                              height: v,
                              size,
                            }));
                          }}
                          className="w-20"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {s.height || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <NumberInput
                          value={editData.weight}
                          onChange={(v) => {
                            setEditData({ ...editData, weight: v });
                            const size = calculateSize(editData.height || 0, v);
                            setEditData((prev) => ({
                              ...prev,
                              weight: v,
                              size,
                            }));
                          }}
                          className="w-20"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {s.weight || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: `${PINK}20`, color: PINK }}
                      >
                        {isEditing
                          ? getSizeFromInput(
                              editData.height || 0,
                              editData.weight || 0,
                            ) || "..."
                          : s.size || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          className={inputCls + " w-full"}
                          value={editData.note || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, note: e.target.value })
                          }
                          placeholder="Ghi chú"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {s.note || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 rounded hover:bg-white/[0.06] text-green-400"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteStudent(s.id)}
                            className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Form thêm học sinh mới */}
        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Thêm học sinh mới
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Họ tên">
              <input
                className={inputCls}
                placeholder="Nguyễn Văn A"
                value={newStudent.name || ""}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
              />
            </Field>
            <Field label="Chiều cao (cm)">
              <NumberInput
                value={newStudent.height}
                onChange={(v) => {
                  setNewStudent({ ...newStudent, height: v });
                  const size = calculateSize(v, newStudent.weight || 0);
                  setNewStudent((prev) => ({ ...prev, height: v, size }));
                }}
                className="w-28"
              />
            </Field>
            <Field label="Cân nặng (kg)">
              <NumberInput
                value={newStudent.weight}
                onChange={(v) => {
                  setNewStudent({ ...newStudent, weight: v });
                  const size = calculateSize(newStudent.height || 0, v);
                  setNewStudent((prev) => ({ ...prev, weight: v, size }));
                }}
                className="w-28"
              />
            </Field>
            <Field label="Size (tự động)">
              <span className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground block min-w-[60px]">
                {newStudent.size || "..."}
              </span>
            </Field>
            <Field label="Ghi chú">
              <input
                className={inputCls + " w-40"}
                placeholder="Dị ứng..."
                value={newStudent.note || ""}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, note: e.target.value })
                }
              />
            </Field>
            <PrimaryButton onClick={handleAdd} className="mb-0.5">
              Thêm
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
