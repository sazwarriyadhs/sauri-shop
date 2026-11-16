"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCart({ product }) {
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const add = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((c) => c.product_id === product.id);
    if (existing) existing.qty_kg += qty;
    else cart.push({ product_id: product.id, name: product.name, price: Number(product.price_per_kg), qty_kg: qty });
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/cart");
  };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
      <div style={{ flex: 1, maxWidth: 140 }}>
        <label>Jumlah (kg)</label>
        <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      </div>
      <button className="btn" onClick={add} style={{ marginTop: 18 }}>+ Tambah ke Keranjang</button>
    </div>
  );
}
