import axios from 'axios'

// Base URL of the Java Spring Boot REST API.
// Change VITE_API_BASE_URL in the .env file when the backend is ready.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Create one Axios instance so all API requests share the same configuration.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Axios returns the response body inside response.data.
// async/await makes asynchronous HTTP requests easier to read.


//Dariya
// Backend product -> the format the pages use
// ---------------------------------------------------------
// toFrontend: backend product -> the format the pages use
// ---------------------------------------------------------
// Takes ONE product object from the backend (p) and returns
// a NEW object shaped the way Shop, Home and Admin expect.
const toFrontend = (p) => ({
  // Backend id is a number (3). Pages compare ids as text ("3"),
  // because ids taken from the URL are always text.
  id: String(p.id),

  // ?? '' means: if p.name is null or undefined, use '' instead.
  name: p.name ?? '',

  // Backend sends brand as an object { id, name, ... }.
  // ?. means: only read .name if brand exists (no crash if null).
  // The pages only want the name text, e.g. "Dior".
  brand: p.brand?.name ?? '',

  // Same idea as brand: keep only the category name.
  category: p.category?.name ?? '',

  // Make sure price is a number, use 0 if it's missing.
  price: Number(p.price ?? 0),

  // Backend calls it "quantity", the pages call it "stock".
  stock: p.quantity ?? 0,

  // Backend has no status. Shop hides products that aren't
  // 'Active', so we give every product 'Active' by default.
  status: p.status ?? 'Active',

  // Backend has no featured flag, so default to false.
  featured: p.featured ?? false,

  // || means: if imageUrl is empty, show a placeholder picture.
  imageUrl: p.imageUrl || '/images/serum.svg',

  description: p.description ?? ''
})

// ---------------------------------------------------------
// toBackend: form data -> the format the backend expects
// ---------------------------------------------------------
// async because we must ask the backend for brands and
// categories before we can build the object.
async function toBackend(p) {
  // Load every brand and category from the backend.
  // .data is the JSON list the backend sent back.
  const brands = (await apiClient.get('/brands')).data
  const categories = (await apiClient.get('/categories')).data

  // The form only knows names ("Dior"), but the backend links
  // products by id. Find the brand/category with the same name.
  // The name you type must match EXACTLY, or nothing is found.
  const brand = brands.find(b => b.name === p.brand)
  const category = categories.find(c => c.name === p.category)

  // Build the object your Spring Boot Product entity expects.
  return {
    name: p.name,
    description: p.description,
    // Form inputs give text ("25"); the backend wants numbers.
    price: Number(p.price),
    // Pages say "stock", backend says "quantity".
    quantity: Number(p.stock),
    // Send only the id. If no match was found, send null.
    brand: brand ? { id: brand.id } : null,
    category: category ? { id: category.id } : null
  }
}

// ---------------------------------------------------------
// productApi: one function per request to /api/products
// ---------------------------------------------------------
export const productApi = {
  // GET /api/products -> list of all products.
  // .map(toFrontend) converts EVERY product in the list.
  async getAll() {
    const response = await apiClient.get('/products')
    return response.data.map(toFrontend)
  },

  // GET /api/products/3 -> one product.
  async getById(id) {
    const response = await apiClient.get(`/products/${id}`)
    return toFrontend(response.data)
  },

  // POST /api/products -> creates a new product.
  // We convert the form data first, then convert the saved
  // product (now with its real id) back for the pages.
  async create(product) {
    const response = await apiClient.post('/products', await toBackend(product))
    return toFrontend(response.data)
  },

  // PUT /api/products/3 -> replaces product 3 with the new data.
  async update(id, product) {
    const response = await apiClient.put(`/products/${id}`, await toBackend(product))
    return toFrontend(response.data)
  },

  // DELETE /api/products/3 -> removes it. Nothing comes back.
  async remove(id) {
    await apiClient.delete(`/products/${id}`)
  }
}

// ---------------------------------------------------------
// brandApi: used by the brand buttons on the Shop page
// ---------------------------------------------------------
export const brandApi = {
  // GET /api/brands -> [{ id: 1, name: "Dior" }, ...]
  // The buttons only need the names, e.g. ["Dior", "Rare Beauty"].
  async getAll() {
    const response = await apiClient.get('/brands')
    return response.data.map(b => b.name)
  }
}
//Dariya

export const authApi = {
  // POST /api/auth/login
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  // POST /api/auth/register
  async register(accountData) {
    try {
      const response = await apiClient.post('/auth/register', accountData)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }
}

export const orderApi = {
  // POST /api/orders
  async create(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Unable to create order:', error)
      throw error
    }
  },

  // GET /api/orders/my
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
