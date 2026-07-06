import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload, Trash2, Save, ShieldAlert } from "lucide-react";
import { useStore } from "../lib/store";
import { Field, GhostButton, PrimaryButton, inputCls, PINK, VIOLET, RED } from "../components/common";

export function SettingsPage() {
  const { data, updateSettings, resetAll, exportJson, importJson } = useStore();
  const [form, setForm] = useState(data.settings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleExport() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.settings.shopName}-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(reader.result as string);
      if (!ok) alert("File không hợp lệ.");
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (confirm("Xóa toàn bộ dữ liệu (khách hàng, đơn thuê, kho đồ, ghi chú)? Hành động này không thể hoàn tác.")) {
      resetAll();
    }
  }

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Cài đặt</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Thông tin cửa hàng, mặc định tính giá, và dữ liệu</p>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-foreground">Thông tin cửa hàng</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên cửa hàng">
            <input className={inputCls} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
          </Field>
          <Field label="Mô tả ngắn">
            <input className={inputCls} value={form.shopTagline} onChange={(e) => setForm({ ...form, shopTagline: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Đơn vị tiền tệ">
            <input className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </Field>
          <Field label="% cọc mặc định">
            <input type="number" min={0} max={100} className={inputCls} value={form.defaultDepositPercent} onChange={(e) => setForm({ ...form, defaultDepositPercent: +e.target.value })} />
          </Field>
        </div>
        <Field label="Ngưỡng cảnh báo sắp hết hàng (số lượng còn lại)">
          <input type="number" min={0} className={inputCls} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: +e.target.value })} />
        </Field>
        <Field label="Link Google Sheets đối chiếu">
          <input className={inputCls} placeholder="https://docs.google.com/spreadsheets/..." value={form.googleSheetLink} onChange={(e) => setForm({ ...form, googleSheetLink: e.target.value })} />
        </Field>
        <div className="flex justify-end">
          <PrimaryButton onClick={save}>
            <Save size={14} /> {saved ? "Đã lưu ✓" : "Lưu thay đổi"}
          </PrimaryButton>
        </div>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-foreground">Sao lưu & khôi phục dữ liệu</h3>
        <p className="text-xs text-muted-foreground">Toàn bộ dữ liệu được lưu ngay trên trình duyệt này. Xuất file để sao lưu hoặc chuyển sang máy khác.</p>
        <div className="flex gap-3">
          <GhostButton onClick={handleExport}><Download size={14} /> Xuất dữ liệu (.json)</GhostButton>
          <GhostButton onClick={() => fileRef.current?.click()}><Upload size={14} /> Nhập dữ liệu</GhostButton>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-3" style={{ borderColor: `${RED}30` }}>
        <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: RED }}>
          <ShieldAlert size={15} /> Vùng nguy hiểm
        </h3>
        <p className="text-xs text-muted-foreground">Xóa toàn bộ khách hàng, đơn thuê, kho đồ, lịch trình và ghi chú để bắt đầu lại từ đầu.</p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors"
          style={{ color: RED, borderColor: `${RED}40` }}
        >
          <Trash2 size={13} /> Đặt lại toàn bộ dữ liệu
        </button>
      </div>
    </div>
  );
}
