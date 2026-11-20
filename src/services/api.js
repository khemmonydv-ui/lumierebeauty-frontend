import axios from 'axios'

// Base URL of the Java Spring Boot REST API.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Create one Axios instance.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// ---------------------------------------------------------
// toFrontend: backend product -> frontend product
// ---------------------------------------------------------
const toFrontend = (p) => ({
  id: String(p.id),
  name: p.name ?? '',
  brand: p.brand?.name ?? '',
  category: p.category?.name ?? '',
  price: Number(p.price ?? 0),
  stock: p.quantity ?? 0,
  status: p.status ?? 'Active',
  featured: p.featured ?? false,
  imageUrl: p.imageUrl || '/images/serum.svg',
  description: p.description ?? ''
})

// ---------------------------------------------------------
// toBackend: frontend form -> backend product
// ---------------------------------------------------------
async function toBackend(p) {
  const brands = (await apiClient.get('/brands')).data
  const categories = (await apiClient.get('/categories')).data

  const brand = brands.find(b => b.name === p.brand)
  const category = categories.find(c => c.name === p.category)

  return {
    name: p.name,
    description: p.description,
    price: Number(p.price),
    quantity: Number(p.stock),
    brand: brand ? { id: brand.id } : null,
    category: category ? { id: category.id } : null
  }
}

// ---------------------------------------------------------
// productApi
// ---------------------------------------------------------
export const productApi = {
  async getAll() {
    const response = await apiClient.get('/products')
    return response.data.map(toFrontend)
  },

  async getById(id) {
    const response = await apiClient.get(`/products/${id}`)
    return toFrontend(response.data)
  },

  async create(product) {
    const response = await apiClient.post(
      '/products',
      await toBackend(product)
    )

    return toFrontend(response.data)
  },

  async update(id, product) {
    const response = await apiClient.put(
      `/products/${id}`,
      await toBackend(product)
    )

    return toFrontend(response.data)
  },

  async remove(id) {
    await apiClient.delete(`/products/${id}`)
  }
}

// ---------------------------------------------------------
// brandApi
// ---------------------------------------------------------
export const brandApi = {
  async getAll() {
    const response = await apiClient.get('/brands')
    return response.data.map(b => b.name)
  }
}

// ---------------------------------------------------------
// categoryApi
// ---------------------------------------------------------
export const categoryApi = {
  async getAll() {
    const response = await apiClient.get('/categories')
    return response.data
  }
}


export const authApi = {
  async register(accountData) {
    const response = await apiClient.post('/users', accountData)
    return response.data
  },

  async login(credentials) {
    const response = await apiClient.post('/users/login', credentials)
    return response.data
  }
}

export const adminUserApi = {

  // GET /api/admin/users
  // Get all users
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
  // Get user by ID
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
  // Create a new customer or admin
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
  // Update user information
  async update(id, userData) {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error(`Unable to update user ${id}:`, error)
      throw error
    }
  },

  // PATCH /api/admin/users/{id}/role
  // Change user role
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
  // Activate or suspend user
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
  // Delete user
  async remove(id) {
    try {
      const response = await apiClient.delete(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Unable to delete user ${id}:`, error)
      throw error
    }
  },
};





export const orderApi = {
  async create(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Unable to create order:', error)
      throw error
    }
  },

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

export default apiClient