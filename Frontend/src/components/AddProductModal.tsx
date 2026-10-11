// components/modals/AddProductModal.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import type { Category } from "../types";

interface FormDataState {
  name: string;
  price: string;
  description: string;
  category: string;
  type: string;
  stock: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const AddProductModal = ({ isOpen, onClose, onSubmit }: AddProductModalProps) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    price: "",
    description: "",
    category: "mobile-accessories",
    type: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    axios
      .get<Category[]>(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => {
        if (!cancelled && res.data.length > 0) setCategories(res.data);
      })
      .catch((err) => console.error("Failed to load categories", err));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // clean up the blob preview URL when it changes/unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Product name is required";
    if (!formData.price || Number(formData.price) < 0) e.price = "Valid price is required";
    if (!formData.description.trim()) e.description = "Description is required";
    if (!formData.type.trim()) e.type = "Type is required";
    if (formData.stock === "" || Number(formData.stock) < 0)
      e.stock = "Valid stock quantity is required";
    return e;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setImageFile(selected);
    setImagePreview(URL.createObjectURL(selected));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "mobile-accessories",
      type: "",
      stock: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", Number(formData.price).toString());
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("type", formData.type);
      payload.append("stock", Number(formData.stock).toString());
      if (imageFile) payload.append("image", imageFile);

      await onSubmit(payload);
      onClose();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (field: string) =>
    `w-full bg-[var(--adm-card)] border ${errors[field] ? "border-red-500" : "border-[var(--adm-border)]"} 
     text-[var(--adm-heading)] text-sm rounded-lg px-4 py-2.5 placeholder-[var(--adm-placeholder)]
     focus:outline-none focus:ring-2 ${errors[field] ? "focus:ring-red-500" : "focus:ring-[var(--adm-accent)]"}
     focus:border-transparent transition-all duration-200`;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--adm-card)] border-b border-[var(--adm-border)] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--adm-heading)]">New Product</h2>
            <p className="text-xs text-[var(--adm-muted)] mt-0.5">Fill in the details to add a new product</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] p-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Case"
              className={inputClass("name")}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--adm-placeholder)] text-sm">$</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass("price")} pl-7`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className={inputClass("stock")}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${inputClass("category")} cursor-pointer`}
              >
                {categories.length > 0
                  ? categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))
                  : <>
                      <option value="mobile-accessories">Mobile Accessories</option>
                      <option value="gadgets">Gadgets</option>
                    </>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g. Case, Charger, Earbuds"
                className={inputClass("type")}
              />
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Write a short product description..."
              className={`${inputClass("description")} resize-none`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider">
              Product Image <span className="text-[var(--adm-placeholder)] normal-case font-normal">(optional)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-[var(--adm-card)] border border-[var(--adm-border)] text-[var(--adm-label)] text-sm rounded-lg
                  file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0
                  file:bg-[var(--adm-accent)] file:text-[var(--adm-accent-contrast)] file:text-xs file:font-semibold file:cursor-pointer
                  hover:file:bg-[var(--adm-accent-hover)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-14 w-14 rounded-lg object-cover border border-[var(--adm-border)] flex-shrink-0"
                />
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--adm-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-[var(--adm-accent-contrast)] bg-[var(--adm-accent)] hover:bg-[var(--adm-accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
