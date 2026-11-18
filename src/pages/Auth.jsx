import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function Auth({ register = false }) {

  // Store form information
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  // Store success and error messages
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Track form submission
  const [loading, setLoading] = useState(false)

  const title = register ? 'Create your account' : 'Welcome back'

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault()

  setSuccess('')
  setError('')

  try {
    setLoading(true)

    let response

    if (register) {
      // Register a new customer
      response = await authApi.register(formData)

      setSuccess('Your account has been created successfully!')

    } else {
      // Login an existing customer
      response = await authApi.login({
        email: formData.email,
        password: formData.password
      })

      console.log('Login successful:', response)

      setSuccess('Login successful! Welcome back.')

      // Redirect to homepage
      window.location.href = '/'
    }

    // Clear form after registration
    if (register) {
      setFormData({
        name: '',
        email: '',
        password: ''
      })
    }

  } catch (error) {

    console.error('Authentication error:', error)
    console.log('Backend response:', error.response?.data)

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
          Lumière account
        </p>

        <h1 className="mt-3 text-center font-display text-4xl">
          {title}
        </h1>

        <p className="mt-3 text-center text-sm text-muted">
          {register
            ? 'Join us for your everyday beauty ritual.'
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

        <p className="mt-5 text-center text-xs text-muted">
          {register
            ? 'Already have an account?'
            : 'New to Lumière?'}

          {' '}

          <Link
            className="font-semibold text-rose"
            to={register ? '/login' : '/register'}
          >
            {register ? 'Sign in' : 'Create an account'}
          </Link>
        </p>

      </form>
    </main>
  )
}