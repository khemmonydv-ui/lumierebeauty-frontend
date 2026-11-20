import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../services/api'
import { useShop } from '../context/ShopContext'

export default function Auth({ register = false, admin = false }) {

  const navigate = useNavigate()
  const location = useLocation()

  const {
    setUser,
    addToCart
  } = useShop()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const title = register
    ? 'Create your account'
    : admin
      ? 'Admin Sign In'
      : 'Welcome back'

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSuccess('')
    setError('')

    try {
      setLoading(true)

      // ================================================
      // REGISTER
      // ================================================

      if (register) {

        await authApi.register(formData)

        setSuccess(
          'Your account has been created successfully! Please sign in.'
        )

        setFormData({
          name: '',
          email: '',
          password: ''
        })

        return
      }

      // ================================================
      // LOGIN
      // ================================================

      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      })

      console.log('Login successful:', response)

      // Check account role.
      if (admin && response.role !== 'ADMIN') {
        setError('Access denied. Admin account required.')
        return
      }

      if (!admin && response.role !== 'CUSTOMER') {
        setError('Please use the Admin login page.')
        return
      }

      // Save logged-in user.
      setUser(response)

      setSuccess('Login successful!')

      // ================================================
      // ADMIN LOGIN
      // ================================================

      if (admin) {
        navigate('/admin')
        return
      }

      // ================================================
      // CUSTOMER LOGIN
      // ================================================

      // Check whether the customer selected a product
      // before going to the login page.
      const pendingProduct = sessionStorage.getItem(
        'lumiere-pending-cart-product'
      )

      if (pendingProduct) {
        try {
          const product = JSON.parse(pendingProduct)

          // Add the selected product to the cart.
          addToCart(product)

          // Remove the temporary saved product.
          sessionStorage.removeItem(
            'lumiere-pending-cart-product'
          )
        } catch (error) {
          console.error('Could not restore selected product:', error)

          sessionStorage.removeItem(
            'lumiere-pending-cart-product'
          )
        }
      }

      // Return to the Shop page.
      navigate(location.state?.from || '/shop')

    } catch (error) {

      console.error('Authentication error:', error)

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Something went wrong. Please try again.'

      setError(errorMessage)

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container-page flex min-h-[65vh] items-center justify-center py-14">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-line p-8 shadow-soft"
      >

        <p className="eyebrow text-center text-rose">
          {admin ? 'Lumière Administration' : 'Lumière account'}
        </p>

        <h1 className="mt-3 text-center font-display text-4xl">
          {title}
        </h1>

        <p className="mt-3 text-center text-sm text-muted">
          {register
            ? 'Join us for your everyday beauty ritual.'
            : admin
              ? 'Sign in to manage your Lumière Beauty store.'
              : 'Sign in to view your account and orders.'}
        </p>

        {register && (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="field mt-7"
            placeholder="Full name"
          />
        )}

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="field mt-5"
          placeholder="Email address"
        />

        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          className="field mt-3"
          placeholder="Password"
        />

        {success && (
          <p className="mt-4 text-sm text-green-600">
            {success}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          {loading
            ? 'Please wait...'
            : register
              ? 'Create account'
              : 'Sign in'}
        </button>

        {!admin && (
          <p className="mt-5 text-center text-xs text-muted">

            {register
              ? 'Already have an account?'
              : 'New to Lumière?'}

            {' '}

            <Link
              className="font-semibold text-rose"
              to={register ? '/login' : '/register'}
              state={location.state}
            >
              {register ? 'Sign in' : 'Create an account'}
            </Link>

          </p>
        )}

      </form>

    </main>
  )
}