
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { formatINR } from "../utils/currency";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { requireLogin } = useCustomerAuth();

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    requireLogin(() => addToCart(product));
  };

  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/products/${product.slug}`} className="media-wrap">
        <img src={product.images?.[0]} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-content">
        <p className="category">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="badges">
          {product.stock === 0 && <span className="badge-stock-out">Out of Stock</span>}
          {discountPercent > 0 ? <span className="badge-sale">Sale</span> : null}
          {discountPercent > 0 ? <span className="badge-discount">{discountPercent}% OFF</span> : null}
          {product.stock > 0 && product.stock <= 5 ? <span className="badge-limited">Limited Offer</span> : null}
          {product.badges?.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <div className="price-row">
          <strong>{formatINR(product.price)}</strong>
          {product.compareAtPrice ? <s>{formatINR(product.compareAtPrice)}</s> : null}
        </div>
        <p className="delivery-mini">Free delivery on 123001 orders above Rs 499</p>
        <div className="action-row">
          <button onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? "Out of Stock" : "Add to cart"}
          </button>
          <Link to={`/products/${product.slug}`}>View details</Link>
        </div>
      </div>
    </motion.article>
  );
}
