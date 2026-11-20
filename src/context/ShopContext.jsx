import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { productApi } from '../services/api'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([])

  useEffect(() => {
    productApi
      .getAll()
      .then((data) => setProducts(data))
      .catch((error) => console.error('Could not load products:', error))
  }, [])

  const saveProduct = async (product) => {
    const exists = products.some(
      (p) => String(p.id) === String(product.id)
    )

    if (exists) {
      const saved = await productApi.update(product.id, product)

      setProducts((current) =>
        current.map((p) =>
          String(p.id) === String(saved.id) ? saved : p
        )
      )
    } else {
      const saved = await productApi.create(product)
      setProducts((current) => [saved, ...current])
    }
  }

  const deleteProduct = async (id) => {
    await productApi.remove(id)

    setProducts((current) =>
      current.filter((p) => String(p.id) !== String(id))
    )
  }

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lumiere-user')) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('lumiere-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('lumiere-user')
    }
  }, [user])

  // Only CUSTOMER accounts can use the customer shopping cart.
  const isAuthenticated = user?.role === 'CUSTOMER'

  const logout = () => {
    setUser(null)
    localStorage.removeItem('lumiere-user')
  }

  // =====================================================
  // CART
  // =====================================================

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lumiere-cart')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('lumiere-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find(
        (item) => String(item.id) === String(product.id)
      )

      if (found) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...current,
        { ...product, quantity: 1 }
      ]
    })
  }

  const updateQuantity = (id, quantity) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => String(item.id) !== String(id))
        : current.map((item) =>
            String(item.id) === String(id)
              ? { ...item, quantity }
              : item
          )
    )
  }

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => String(item.id) !== String(id))
    )
  }

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = useMemo(
    () => ({
      products,
      cart,

      user,
      isAuthenticated,
      setUser,
      logout,

      addToCart,
      updateQuantity,
      removeFromCart,

      saveProduct,
      deleteProduct
    }),
    [products, cart, user, isAuthenticated]
  )

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => useContext(ShopContext)