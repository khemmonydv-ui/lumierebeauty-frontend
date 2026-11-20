import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { productApi } from "../services/api";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  // PRODUCTS: now loaded from the backend
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productApi
      .getAll()
      .then((data) => setProducts(data))
      .catch((error) => console.error("Could not load products", error));
  }, []);

  const saveProduct = async (product) => {
    const exists = products.some((p) => p.id === product.id);
    if (exists) {
      const saved = await productApi.update(product.id, product);
      setProducts((current) =>
        current.map((p) => (p.id === saved.id ? saved : p)),
      );
    } else {
      const saved = await productApi.create(product);
      setProducts((current) => [saved, ...current]);
    }
  };

  const deleteProduct = async (id) => {
    await productApi.remove(id);
    setProducts((current) => current.filter((p) => p.id !== id));
  };

  // CART: unchanged, still saved in the browser
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lumiere-cart")) || [];
    } catch {
      return [];
    }
  });
  useEffect(
    () => localStorage.setItem("lumiere-cart", JSON.stringify(cart)),
    [cart],
  );

  const addToCart = (product) =>
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
  const updateQuantity = (id, quantity) =>
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
    );
  const removeFromCart = (id) =>
    setCart((current) => current.filter((item) => item.id !== id));

  const value = useMemo(
    () => ({
      products,
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      saveProduct,
      deleteProduct,
    }),
    [products, cart],
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
