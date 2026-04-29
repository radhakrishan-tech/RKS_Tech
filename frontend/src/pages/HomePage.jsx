import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import MainBannerSlider from "../components/MainBannerSlider";
import { FiGrid } from "react-icons/fi";
import { GiClothes } from "react-icons/gi";
import { GiTravelDress } from "react-icons/gi";
import { GiTrousers } from "react-icons/gi";
import { TbBath } from "react-icons/tb";
import { MdFace } from "react-icons/md";
import CategoryCard from "../components/CategoryCard";
// import { fetchCategories, fetchProducts } from "../services/api";
import {
  fetchCategories,
  fetchProducts,
  fetchCategorySales30d,
} from "../services/api";
import { useRef } from "react";

const initialFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  discount: "",
  availability: "",
  size: "",
  color: "",
  sortBy: "newest",
};

const CATEGORY_ICONS = [
  { name: "All", value: "", icon: FiGrid, order: 0 },
  { name: "Kurti", value: "Kurti", icon: GiClothes, order: 1 },
  { name: "Dupatta", value: "Dupatta", icon: GiTravelDress, order: 2 },
  { name: "Plazo", value: "Plazo", icon: GiTrousers, order: 3 },
  { name: "Bath Towel", value: "Bath Towel", icon: TbBath, order: 4 },
  { name: "Face Towel", value: "Face Towel", icon: MdFace, order: 5 },
];

const categoryRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.04, duration: 0.28 },
  },
};

const categoryItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

function getDiscountPercent(product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return 0;
  }
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorySales30d, setCategorySales30d] = useState(null);
  const fetchedSales = useRef(false);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    if (!fetchedSales.current) {
      fetchedSales.current = true;
      fetchCategorySales30d()
        .then(setCategorySales30d)
        .catch(() => setCategorySales30d([]));
    }
  }, []);

  useEffect(() => {
    const querySearch = searchParams.get("search") || "";
    setFilters((prev) => ({ ...prev, search: querySearch }));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setIsLoadingProducts(true);

    fetchProducts({
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    }, { suppressLoader: true })
      .then((data) => {
        if (!active) return;
        setProducts(data.products || []);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setIsLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [filters.search, filters.category, filters.minPrice, filters.maxPrice]);

  const processedProducts = useMemo(() => {
    let next = [...products];

    if (filters.discount === "10") {
      next = next.filter((product) => getDiscountPercent(product) >= 10);
    }
    if (filters.discount === "25") {
      next = next.filter((product) => getDiscountPercent(product) >= 25);
    }

    if (filters.availability === "in") {
      next = next.filter((product) => product.stock > 0);
    }
    if (filters.availability === "out") {
      next = next.filter((product) => product.stock <= 0);
    }

    if (filters.size.trim()) {
      const needle = filters.size.trim().toLowerCase();
      next = next.filter((product) =>
        (product.tags || []).some((tag) =>
          String(tag).toLowerCase().includes(needle)
        )
      );
    }

    if (filters.color.trim()) {
      const needle = filters.color.trim().toLowerCase();
      next = next.filter((product) =>
        (product.tags || []).some((tag) =>
          String(tag).toLowerCase().includes(needle)
        )
      );
    }

    if (filters.sortBy === "price-asc") {
      next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (filters.sortBy === "price-desc") {
      next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return next;
  }, [
    products,
    filters.discount,
    filters.availability,
    filters.size,
    filters.color,
    filters.sortBy,
  ]);

  const offerProducts = useMemo(
    () =>
      processedProducts.filter(
        (product) =>
          (product.compareAtPrice && product.compareAtPrice > product.price) ||
          product.stock <= 5 ||
          (Array.isArray(product.badges) && product.badges.length > 0)
      ),
    [processedProducts]
  );

  const recentlyViewed = useMemo(() => {
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
    try {
      const items = JSON.parse(localStorage.getItem("rks_recent") || "[]");
      const now = Date.now();
      const filtered = items.filter(item => item.viewedAt && (now - item.viewedAt < FIVE_DAYS));
      // Update localStorage to auto-remove expired
      if (filtered.length !== items.length) {
        localStorage.setItem("rks_recent", JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  }, [processedProducts]);

  const orderedCategoryIcons = useMemo(() => {
    const allOption = CATEGORY_ICONS.find((item) => item.value === "");
    const categoryOptions = CATEGORY_ICONS.filter((item) => item.value !== "");

    // Prefer 30d sales if available
    if (
      categorySales30d &&
      Array.isArray(categorySales30d) &&
      categorySales30d.length > 0
    ) {
      const salesMap = new Map(
        categorySales30d.map((c) => [c.category, c.sold])
      );
      const ranked = [...categoryOptions].sort((a, b) => {
        const soldDiff =
          (salesMap.get(b.value) || 0) - (salesMap.get(a.value) || 0);
        if (soldDiff !== 0) return soldDiff;
        return a.order - b.order;
      });
      return allOption ? [allOption, ...ranked] : ranked;
    }

    // Fallback: use lifetime soldCount
    const soldByCategory = new Map(
      categoryOptions.map((item) => [item.value, 0])
    );
    for (const product of products) {
      if (!soldByCategory.has(product.category)) continue;
      const current = soldByCategory.get(product.category) || 0;
      soldByCategory.set(
        product.category,
        current + Number(product.soldCount || 0)
      );
    }
    const ranked = [...categoryOptions].sort((a, b) => {
      const soldDiff =
        (soldByCategory.get(b.value) || 0) - (soldByCategory.get(a.value) || 0);
      if (soldDiff !== 0) return soldDiff;
      return a.order - b.order;
    });
    return allOption ? [allOption, ...ranked] : ranked;
  }, [products, categorySales30d]);

  const scrollToShop = () => {
    const target = document.getElementById("categories-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearFilters = () => {
    setFilters((prev) => ({ ...initialFilters, search: prev.search }));
  };

  return (
    <main className="container">
      <MainBannerSlider onCtaClick={scrollToShop} />

      <section className="catalog-main" id="categories-section">
        <motion.div
          className="category-icons-row premium-scroll"
          role="tablist"
          aria-label="Quick category filters"
          variants={categoryRowVariants}
          initial="hidden"
          animate="visible"
        >
          {orderedCategoryIcons.map((item) => {
            const isAll = item.value === "";
            const isActive = isAll
              ? !filters.category
              : filters.category === item.value;
            return (
              <CategoryCard
                key={item.name}
                icon={item.icon}
                label={item.name}
                active={isActive}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, category: item.value }))
                }
              />
            );
          })}
        </motion.div>

        <div className="catalog-filter-row">
          <input
            className="catalog-search"
            placeholder="Search products"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.name} key={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
          />

          <select
            value={filters.discount}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, discount: e.target.value }))
            }
          >
            <option value="">Discount</option>
            <option value="10">10% and above</option>
            <option value="25">25% and above</option>
          </select>

          <select
            value={filters.availability}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, availability: e.target.value }))
            }
          >
            <option value="">Availability</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <input
            placeholder="Size"
            value={filters.size}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, size: e.target.value }))
            }
          />
          <input
            placeholder="Color"
            value={filters.color}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, color: e.target.value }))
            }
          />

          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
            }
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
          </select>

          <button type="button" className="ghost-button" onClick={clearFilters}>
            Reset
          </button>
        </div>

        {isLoadingProducts ? (
          <div className="catalog-empty">Loading products...</div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${filters.category}-${filters.minPrice}-${filters.maxPrice}-${filters.discount}-${filters.availability}-${filters.size}-${filters.color}-${filters.sortBy}-${filters.search}`}
            initial={{ opacity: 0.35, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.2, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid"
          >
            {!isLoadingProducts &&
              processedProducts.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
          </motion.div>
        </AnimatePresence>

        {!isLoadingProducts && processedProducts.length === 0 ? (
          <div className="catalog-empty">
            No products found for selected filters.
          </div>
        ) : null}
      </section>

      <section className="offer-products-section">
        <div className="offer-products-header">
          <h3>Offer Products</h3>
          <p>Hot picks with active discounts and limited-time savings.</p>
        </div>
        {offerProducts.length > 0 ? (
          <div className="grid">
            {offerProducts.slice(0, 8).map((product) => (
              <ProductCard product={product} key={`offer-${product._id}`} />
            ))}
          </div>
        ) : (
          <div className="offer-empty-state">
            <p>
              No live offers right now. Add discounted products to see them
              highlighted here.
            </p>
          </div>
        )}
      </section>

      <section className="recently-viewed">
        <h3>Recently viewed</h3>
        <div className="recent-list">
          {recentlyViewed.length === 0 ? (
            <p>No recently viewed items yet.</p>
          ) : (
            recentlyViewed
              .slice(0, 6)
              .map((item) => <span key={item.slug}>{item.name}</span>)
          )}
        </div>
      </section>
    </main>
  );
}
