
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { fetchProductBySlug, fetchSuggestions } from "../services/api";
import { formatINR } from "../utils/currency";


export default function ProductPage() {
  const { user, requireLogin } = useCustomerAuth();
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product data on mount
  useEffect(() => {
    if (!slug) return;
    fetchProductBySlug(slug).then((data) => setProduct(data)).catch(() => setProduct(null));
  }, [slug]);

  if (!product) {
    return (
      <main className="container product-page" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#888', fontSize: 20 }}>Loading product...</span>
      </main>
    );
  }

  return (
    <main className="container product-page">
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        alignItems: 'flex-start',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 16px 0 #0001',
        margin: '32px 0',
        minHeight: 400
      }}>
        <div style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 420, textAlign: 'center' }}>
          <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', maxWidth: 380, borderRadius: 12, objectFit: 'contain', background: '#f8fafc', boxShadow: '0 1px 8px #0001' }} />
        </div>
        <div style={{ flex: '2 1 340px', minWidth: 260 }}>
          <p className="category" style={{ fontWeight: 500, color: '#555', marginBottom: 4 }}>{product.category}</p>
          <h2 style={{ fontSize: 28, margin: '0 0 8px 0' }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 26 }}>{formatINR(product.price)}</span>
            {product.discountPrice && product.discountPrice < product.price && (
              <>
                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: 18 }}>{formatINR(product.discountPrice)}</span>
                <span className="badge-discount">{Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF</span>
              </>
            )}
          </div>
          <p style={{ margin: '16px 0', color: '#444', fontSize: 17 }}>{product.description}</p>
          {product.stock === 0 && <p className="out-of-stock-warning">⚠️ Currently Out of Stock</p>}
          {product.stock > 0 && product.stock <= 5 && <p className="low-stock-warning">⚠️ Only {product.stock} left in stock</p>}
          <div style={{ margin: '12px 0' }}>
            <div style={{ marginBottom: 4 }}>Select Size:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(product.sizes || []).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={selectedSize === size ? 'size-btn selected' : 'size-btn'}
                  style={{ padding: '6px 16px', borderRadius: 4, border: selectedSize === size ? '2px solid #2563eb' : '1px solid #ccc', background: selectedSize === size ? '#e0e7ff' : '#fff', fontWeight: 600 }}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div style={{ margin: '12px 0' }}>
            <div style={{ marginBottom: 4 }}>Select Color:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(product.colors || []).map((color, idx) => (
                <button
                  key={color.hex + color.name + idx}
                  type="button"
                  className={selectedColor && selectedColor.hex === color.hex ? 'color-btn selected' : 'color-btn'}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: selectedColor && selectedColor.hex === color.hex ? '2px solid #2563eb' : '1px solid #ccc',
                    background: color.hex,
                    display: 'inline-block',
                    position: 'relative',
                  }}
                  title={color.name}
                  onClick={() => setSelectedColor(color)}
                >
                  {selectedColor && selectedColor.hex === color.hex && <span style={{ position: 'absolute', top: 6, left: 10, color: '#fff', fontWeight: 700 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Quantity:</span>
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
            <input type="number" min={1} max={product.stock} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))} style={{ width: 48, textAlign: 'center' }} />
            <button type="button" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
          </div>
          <div className="action-row">
            <button
              onClick={() => addToCart(product, quantity, selectedSize, selectedColor)}
              disabled={product.stock === 0 || !selectedSize || !selectedColor}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button type="button" className="ghost-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Browse more</button>
          </div>
        </div>
      </div>
    </main>
  );
}
          
