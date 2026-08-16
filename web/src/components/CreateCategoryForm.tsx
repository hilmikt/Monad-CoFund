"use client";

import { useState } from "react";
import { createCategory } from "@/lib/contractActions";
import { isPositiveAmount } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { Plus, FolderPlus } from "@phosphor-icons/react";

interface CategoryRow {
  name: string;
  budget: string;
}

export default function CreateCategoryForm({
  fundId,
  onComplete,
}: {
  fundId: number;
  onComplete: () => void;
}) {
  const [categories, setCategories] = useState<CategoryRow[]>([{ name: "", budget: "" }]);
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const addRow = () => setCategories([...categories, { name: "", budget: "" }]);

  const updateRow = (i: number, field: keyof CategoryRow, value: string) => {
    const updated = [...categories];
    updated[i] = { ...updated[i], [field]: value };
    setCategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = categories.filter((c) => c.name && isPositiveAmount(c.budget));
    if (valid.length === 0) return;

    setStatus("confirming");
    try {
      for (let i = 0; i < valid.length; i++) {
        setCurrentIndex(i);
        const res = await createCategory(fundId, valid[i].name, Number(valid[i].budget));
        setTxHash(res.txHash);
      }
      setStatus("success");
      setTimeout(() => onComplete(), 2000);
    } catch {
      setStatus("failed");
    }
  };

  if (status === "confirming" || status === "pending") {
    return (
      <div className="p-6">
        <TransactionStatus
          status={status}
          message={`Creating category ${currentIndex + 1} of ${categories.filter((c) => c.name).length}…`}
        />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="p-6">
        <TransactionStatus status="success" message="Categories created on-chain!" txHash={txHash} />
      </div>
    );
  }

  const isFormValid = categories.some((c) => c.name && isPositiveAmount(c.budget));

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-surface-secondary border border-border rounded-full">
          <FolderPlus size={24} className="text-foreground" />
        </div>
        <div>
          <h3 className="font-serif text-xl">Add Budget Categories</h3>
          <p className="text-sm text-muted">Define spending buckets for this fund</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {categories.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-3">
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              placeholder="Category name (e.g. Villa)"
              className="bg-surface-secondary border border-border rounded-button px-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            <input
              type="number"
              value={row.budget}
              onChange={(e) => updateRow(i, "budget", e.target.value)}
              placeholder="MON"
              className="w-24 bg-surface-secondary border border-border rounded-button px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition-colors"
        >
          <Plus size={14} /> Add another category
        </button>
      </div>

      {status === "failed" && (
        <div className="mb-4">
          <TransactionStatus status="failed" />
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full py-3 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle"
      >
        Create Categories On-Chain
      </button>
    </form>
  );
}
