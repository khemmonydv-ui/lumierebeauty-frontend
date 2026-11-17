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

  // Update input values
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSuccess('')
    setError('')

    // Login API has not been implemented yet
    if (!register) {
      setError('Login functionality is not available yet.')
      return
    }

    try {
      setLoading(true)

      // Send registration data to Spring Boot
      const response = await authApi.register(formData)

      console.log('Registration successful:', response)

      setSuccess('Your account has been created successfully!')

      // Clear the form
      setFormData({
        name: '',
        email: '',
        password: ''
      })

    } catch (error) {

  console.error('Registration error:', error)

  console.log('Backend response:', error.response?.data)
  console.log('HTTP status:', error.response?.status)

  const errorMessage =
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.message ||
    'Registration failed. Please try again.'

  setError(errorMessage)

}finally {
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

        {/* Success message */}
        {success && (
          <p className="mt-5 rounded-lg bg-green-100 p-3 text-center text-sm text-green-700">
            {success}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-5 rounded-lg bg-red-100 p-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Full name */}
        {register && (
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="field mt-7"
            placeholder="Full name"
          />
        )}

        {/* Email */}
        <input
          required
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="field mt-5"
          placeholder="Email address"
        />

        {/* Password */}
        <input
          required
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="field mt-3"
          placeholder="Password"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? 'Please wait...'
            : register
              ? 'Create account'
              : 'Sign in'}
        </button>

        {/* Navigation */}
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