import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function StickyCartButton() {
  const { cartCount } = useCart();
  if (!cartCount) return null;

  return (
    <Link className="sticky-cart" to="/checkout">
      View cart ({cartCount})
    </Link>
  );
}
