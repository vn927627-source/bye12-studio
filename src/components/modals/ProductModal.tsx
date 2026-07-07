// src/components/modals/ProductModal.tsx
import React, { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { useStore } from "../../lib/store";
import type { Gender, Product, SizeStock } from "../../lib/types";
import {
  Field,
  GhostButton,
  Modal,
  PrimaryButton,
  inputCls,
  NumberInput,
} from "../common";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductModal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { addProduct, updateProduct } = useStore();
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [desc, setDesc] = useState(product?.desc ?? "");
  const [category, setCategory] = useState<Gender>(product?.category ?? "nam");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [image, setImage] = useState<string | undefined>(product?.image);
  const [sizes, setSizes] = useState<SizeStock[]>(
    product?.sizes?.length ? product.sizes : [{ size: "M", qty: 0 }],
  );

  const total = sizes.reduce((s, sz) => s + (sz.qty || 0), 0);

  function updateSize(i: number, patch: Partial<SizeStock>) {
    setSizes((s) => s.map((sz, idx) => (idx === i ? { ...sz, ...patch } : sz)));
  }
  function addSize() {
    const unused =
      DEFAULT_SIZES.find((s) => !sizes.some((sz) => sz.size === s)) ??
      "Free size";
    setSizes((s) => [...s, { size: unused, qty: 0 }]);
  }
  function removeSize(i: number) {
    setSizes((s) => s.filter((_, idx) => idx !== i));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || sizes.length === 0) return;
    const payload = { name: name.trim(), desc, category, price, image, sizes };
    if (isEdit && product) updateProduct(product.id, payload);
    else addProduct(payload);
    onClose();
  }

  return (
    <Modal
      title={isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
      subtitle="Tồn kho được chia theo từng size"
      onClose={onClose}
      width={560}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Hình ảnh">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload size={16} className="text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Bấm để tải ảnh lên
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </label>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên đồ">
            <input
              autoFocus
              className={inputCls}
              placeholder="Vest Nam, Áo dài..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Giá thuê / lượt">
            <NumberInput value={price} onChange={setPrice} placeholder="0" />
          </Field>
        </div>

        <Field label="Mô tả">
          <input
            className={inputCls}
            placeholder="Chất liệu, kiểu dáng..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </Field>

        <Field label="Giới tính">
          <div className="flex gap-2">
            {(
              [
                { id: "nam", label: "Nam" },
                { id: "nu", label: "Nữ" },
              ] as const
            ).map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => setCategory(g.id)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  category === g.id
                    ? "border-white/25 bg-white/[0.08] text-foreground"
                    : "border-white/[0.06] text-muted-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Tồn kho theo size (tổng: ${total})`}>
          <div className="space-y-2">
            {sizes.map((sz, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls + " w-24"}
                  value={sz.size}
                  onChange={(e) => updateSize(i, { size: e.target.value })}
                  placeholder="Size"
                />
                <NumberInput
                  value={sz.qty}
                  onChange={(v) => updateSize(i, { qty: Math.max(0, v) })}
                  className={inputCls}
                  placeholder="Số lượng"
                />
                <button
                  type="button"
                  onClick={() => removeSize(i)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-white/[0.04]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSize}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={12} /> Thêm size
            </button>
          </div>
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">
            {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
