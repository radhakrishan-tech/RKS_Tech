
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { fetchProductBySlug, fetchSuggestions } from "../services/api";
import { formatINR } from "../utils/currency";


export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { requireLogin } = useCustomerAuth();
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setSelectedSize("");
        setSelectedColor(null);
        setQuantity(1);
        setError("");
        const recent = JSON.parse(localStorage.getItem("rks_recent") || "[]");
        const deduped = [
          { slug: data.slug, name: data.name },
          ...recent.filter((item) => item.slug !== data.slug),
        ].slice(0, 10);
        localStorage.setItem("rks_recent", JSON.stringify(deduped));
        return fetchSuggestions(data._id);
      })
      .then((data) => setSuggestions(data.suggestions || []))
      .catch(console.error);
  }, [slug]);

  if (!product) return <main className="container">Loading product...</main>;

  const discountPercent = product.discountPercentage || (product.price && product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);

  const handleAddToCart = () => {
    setError("");
    if (!selectedSize) {
      setError("Please select a size.");
      return;
    }
    if (!selectedColor) {
      setError("Please select a color.");
      return;
    }
    requireLogin(() => addToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    }, quantity));
  };

  return (
    <main className="container product-page">
      <img src={product.images?.[0]} alt={product.name} className="hero-img" />
      <div>
        <p className="category">{product.category}</p>
        <h2>{product.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 22 }}>{formatINR(product.price)}</span>
          {product.discountPrice && product.discountPrice < product.price && (
            <>
              <span style={{ textDecoration: 'line-through', color: '#888' }}>{formatINR(product.discountPrice)}</span>
              <span className="badge-discount">{discountPercent}% OFF</span>
            </>
          )}
        </div>
        <div style={{ margin: '8px 0' }}>
          <span>Rating: </span>
          <span style={{ color: '#f59e42', fontWeight: 600 }}>{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
          <span style={{ marginLeft: 8, color: '#888' }}>({product.numReviews || 0} reviews)</span>
        </div>
        <p>{product.description}</p>
        {product.stock === 0 && <p className="out-of-stock-warning">⚠️ Currently Out of Stock</p>}
        {product.stock > 0 && product.stock <= 5 && <p className="low-stock-warning">⚠️ Only {product.stock} left in stock</p>}

        {/* Size Selector */}
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

        {/* Color Selector */}
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

        {/* Quantity Selector */}
        <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Quantity:</span>
          <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
          <input type="number" min={1} max={product.stock} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))} style={{ width: 48, textAlign: 'center' }} />
          <button type="button" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

        <div className="action-row">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || !selectedSize || !selectedColor}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          <button type="button" className="ghost-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Browse more</button>
        </div>

        {suggestions.map((item) => (
          <div className="upsell" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.product.name}</p>
            <button onClick={() => handleAddToCart(item.product)}>Add combo</button>
          </div>
        ))}
      </div>
    </main>
  );
}
