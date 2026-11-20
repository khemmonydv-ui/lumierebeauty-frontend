import axios from 'axios'

// =========================================================
// 1. AXIOS CONFIGURATION
// =========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// =========================================================
// 2. PRODUCT CONVERSION
// =========================================================

// Convert backend product into frontend product.
const toFrontend = (p) => ({
  id: String(p.id ?? ''),
  name: p.name ?? '',

  brand: p.brand?.name ?? '',
  brandId: p.brand?.id ? String(p.brand.id) : '',

  category: p.category?.name ?? '',
  categoryId: p.category?.id ? String(p.category.id) : '',

  price: Number(p.price ?? 0),
  stock: Number(p.quantity ?? 0),

  status: p.status ?? 'Active',
  featured: p.featured ?? false,

  imageUrl: p.imageUrl || '/images/serum.svg',
  description: p.description ?? ''
})

// Convert frontend product into backend product.
//
// The frontend can send either:
// brand: "Dior"
// brand: { id: 1 }
//
// Or:
// brandId: "1"
//
// The same applies to category.

const toBackend = (p) => {
  const brandId =
    typeof p.brand === 'object'
      ? p.brand?.id
      : p.brandId || p.brand

  const categoryId =
    typeof p.category === 'object'
      ? p.category?.id
      : p.categoryId || p.category

  return {
    name: p.name,
    description: p.description ?? '',
    price: Number(p.price),
    quantity: Number(p.stock),
    // Send the picture so the backend saves it
    imageUrl: p.imageUrl,
    brand: brand ? { id: brand.id } : null,
    category: category ? { id: category.id } : null
  }
}

// =========================================================
// 3. PRODUCT API
// =========================================================

export const productApi = {

  // GET /api/products
  // Get all products.
  async getAll() {
    try {
      const response = await apiClient.get('/products')
      return response.data.map(toFrontend)
    } catch (error) {
      console.error('Unable to load products:', error)
      throw error
    }
  },

  // GET /api/products/{id}
  // Get one product.
  async getById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`)
      return toFrontend(response.data)
    } catch (error) {
      console.error(`Unable to load product ${id}:`, error)
      throw error
    }
  },

  // POST /api/products
  // Create a new product.
  async create(product) {
    try {
      const response = await apiClient.post(
        '/products',
        toBackend(product)
      )

      return toFrontend(response.data)
    } catch (error) {
      console.error('Unable to create product:', error)
      throw error
    }
  },

  // PUT /api/products/{id}
  // Update an existing product.
  async update(id, product) {
    try {
      const response = await apiClient.put(
        `/products/${id}`,
        toBackend(product)
      )

      return toFrontend(response.data)
    } catch (error) {
      console.error(`Unable to update product ${id}:`, error)
      throw error
    }
  },

  // DELETE /api/products/{id}
  // Delete a product.
  async remove(id) {
    try {
      await apiClient.delete(`/products/${id}`)
      return true
    } catch (error) {
      console.error(`Unable to delete product ${id}:`, error)
      throw error
    }
  },

  // GET /api/products/category?name=Skincare
  // Filter products by category name.
  async getByCategory(name) {
    try {
      const response = await apiClient.get('/products/category', {
        params: { name }
      })

      return response.data.map(toFrontend)
    } catch (error) {
      console.error('Unable to filter products by category:', error)
      throw error
    }
  }
}

// =========================================================
// 4. BRAND API
// =========================================================

export const brandApi = {

  // GET /api/brands
  // Return complete brand objects, including id and name.
  async getAll() {
    try {
      const response = await apiClient.get('/brands')
      return response.data
    } catch (error) {
      console.error('Unable to load brands:', error)
      throw error
    }
  }
}

// =========================================================
// 5. CATEGORY API
// =========================================================

export const categoryApi = {

  // GET /api/categories
  // Get all categories.
  async getAll() {
    try {
      const response = await apiClient.get('/categories')
      return response.data
    } catch (error) {
      console.error('Unable to load categories:', error)
      throw error
    }
  }
}

// =========================================================
// 6. AUTHENTICATION API
// =========================================================

export const authApi = {

  // POST /api/users
  // Register a new account.
  async register(accountData) {
    try {
      const response = await apiClient.post('/users', accountData)
      return response.data
    } catch (error) {
      console.error('Unable to register:', error)
      throw error
    }
  },

  // POST /api/users/login
  // Login.
  async login(credentials) {
    try {
      const response = await apiClient.post('/users/login', credentials)
      return response.data
    } catch (error) {
      console.error('Unable to login:', error)
      throw error
    }
  }
}

// =========================================================
// 7. ADMIN USER API
// =========================================================

export const adminUserApi = {

  // GET /api/admin/users
  async getAll() {
    try {
      const response = await apiClient.get('/admin/users')
      return response.data
    } catch (error) {
      console.error('Unable to load users:', error)
      throw error
    }
  },

  // GET /api/admin/users/{id}
  async getById(id) {
    try {
      const response = await apiClient.get(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Unable to load user ${id}:`, error)
      throw error
    }
  },

  // POST /api/admin/users
  async create(userData) {
    try {
      const response = await apiClient.post('/admin/users', userData)
      return response.data
    } catch (error) {
      console.error('Unable to create user:', error)
      throw error
    }
  },

  // PUT /api/admin/users/{id}
  async update(id, userData) {
    try {
      const response = await apiClient.put(
        `/admin/users/${id}`,
        userData
      )

      return response.data
    } catch (error) {
      console.error(`Unable to update user ${id}:`, error)
      throw error
    }
  },

  // PATCH /api/admin/users/{id}/role
  async updateRole(id, role) {
    try {
      const response = await apiClient.patch(
        `/admin/users/${id}/role`,
        null,
        {
          params: { role }
        }
      )

      return response.data
    } catch (error) {
      console.error(`Unable to update role for user ${id}:`, error)
      throw error
    }
  },

  // PATCH /api/admin/users/{id}/status
  async updateStatus(id, status) {
    try {
      const response = await apiClient.patch(
        `/admin/users/${id}/status`,
        null,
        {
          params: { status }
        }
      )

      return response.data
    } catch (error) {
      console.error(`Unable to update status for user ${id}:`, error)
      throw error
    }
  },

  // DELETE /api/admin/users/{id}
  async remove(id) {
    try {
      const response = await apiClient.delete(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Unable to delete user ${id}:`, error)
      throw error
    }
  }
}

// =========================================================
// 8. ORDER API
// =========================================================

export const orderApi = {

  // POST /api/orders
  // Create an order.
  async create(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Unable to create order:', error)
      throw error
    }
  },

  // GET /api/orders
  // Get current user's orders.
  async getMyOrders() {
    try {
      const response = await apiClient.get('/orders')
      return response.data
    } catch (error) {
      console.error('Unable to load orders:', error)
      throw error
    }
  }
}

// =========================================================
// 9. EXPORT AXIOS INSTANCE
// =========================================================

export default apiClient