import { useEffect, useMemo, useState } from 'react'
import {
  UserPlus,
  Search,
  UserRound,
  Ban,
  CheckCircle2,
  Trash2
} from 'lucide-react'

import { adminUserApi } from '../services/api'

export default function AdminUsers() {
  // Store users received from the backend
  const [users, setUsers] = useState([])

  // Loading state
  const [loading, setLoading] = useState(true)

  // Search
  const [query, setQuery] = useState('')

  // Form visibility
  const [showForm, setShowForm] = useState(false)

  // Form data
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  })

  // Message
  const [message, setMessage] = useState('')

  const [error, setError] = useState('')

  // Get error message from backend
  const getErrorMessage = (error) => {
    return (
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong. Please try again.'
    )
  }

  // 1. GET ALL USERS
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await adminUserApi.getAll()

      setUsers(data)
    } catch (error) {
      console.error('Unable to load users:', error)
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Load users when page opens
  useEffect(() => {
    loadUsers()
  }, [])

  // Search users
  const filtered = useMemo(() => {
    return users.filter(user =>
      `${user.name} ${user.email} ${user.role}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [users, query])

  // 2. CREATE USER
  const addUser = async (event) => {
    event.preventDefault()

    try {
      setMessage('')
      setError('')

      await adminUserApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      })

      setForm({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
      })

      setShowForm(false)

      setMessage('User created successfully!')

      await loadUsers()
    } catch (error) {
      console.error('Unable to create user:', error)
      setError(getErrorMessage(error))
    }
  }

  // 3. UPDATE USER ROLE
  const handleRoleChange = async (id, role) => {
    try {
      setMessage('')
      setError('')

      await adminUserApi.updateRole(id, role)

      setMessage('User role updated successfully!')

      await loadUsers()
    } catch (error) {
      console.error('Unable to update role:', error)
      setError(getErrorMessage(error))
    }
  }

  // 4. UPDATE USER STATUS
  const handleStatusChange = async (id, status) => {
    try {
      setMessage('')
      setError('')

      await adminUserApi.updateStatus(id, status)

      setMessage('User status updated successfully!')

      await loadUsers()
    } catch (error) {
      console.error('Unable to update status:', error)
      setError(getErrorMessage(error))
    }
  }

  // 5. DELETE USER
  const removeUser = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this account?'
    )

    if (!confirmed) return

    try {
      setMessage('')
      setError('')

      await adminUserApi.remove(id)

      setMessage('User deleted successfully!')

      await loadUsers()
    } catch (error) {
      console.error('Unable to delete user:', error)
      setError(getErrorMessage(error))
    }
  }

  // Convert backend role into readable text
  const displayRole = (role) => {
    return role === 'ADMIN' ? 'Admin' : 'Customer'
  }

  // Convert backend status into readable text
  const displayStatus = (status) => {
    return status === 'ACTIVE' ? 'Active' : 'Suspended'
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-sage">Store access</p>

          <h1 className="mt-2 font-display text-4xl text-wine">
            User management
          </h1>

          <p className="mt-2 text-sm text-muted">
            Add administrators and manage account roles and access status.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(value => !value)
            setMessage('')
            setError('')
          }}
          className="btn-primary"
        >
          <UserPlus size={16} />
          Add user
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-muted">Total accounts</p>

          <p className="mt-2 font-display text-3xl text-wine">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-muted">Administrators</p>

          <p className="mt-2 font-display text-3xl text-wine">
            {users.filter(user => user.role === 'ADMIN').length}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-muted">Active accounts</p>

          <p className="mt-2 font-display text-3xl text-wine">
            {users.filter(user => user.status === 'ACTIVE').length}
          </p>
        </div>

      </div>

      {/* ADD USER FORM */}
      {showForm && (
        <form
          onSubmit={addUser}
          className="mt-6 rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-display text-2xl text-wine">
                Add an account
              </h2>

              <p className="mt-1 text-xs text-muted">
                Create a customer or administrator account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-muted"
            >
              Close
            </button>

          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* NAME */}
            <label className="text-xs font-semibold text-ink">
              Full name

              <input
                required
                className="field mt-2 text-sm"
                value={form.name}
                onChange={e =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. Alex Morgan"
              />
            </label>

            {/* EMAIL */}
            <label className="text-xs font-semibold text-ink">
              Email address

              <input
                required
                type="email"
                className="field mt-2 text-sm"
                value={form.email}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="name@example.com"
              />
            </label>

            {/* PASSWORD */}
            <label className="text-xs font-semibold text-ink">
              Password

              <input
                required
                type="password"
                minLength={8}
                className="field mt-2 text-sm"
                value={form.password}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="At least 8 characters"
              />
            </label>

            {/* ROLE */}
            <label className="text-xs font-semibold text-ink">
              Role

              <select
                className="field mt-2 text-sm"
                value={form.role}
                onChange={e =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </label>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            <button type="submit" className="btn-primary">
              Save account
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <p className="mt-4 rounded-xl bg-cream p-4 text-sm text-sage">
          {message}
        </p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* SEARCH */}
      <div className="mt-7">

        <label className="relative block w-full max-w-xl">

          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            className="field !h-12 !min-h-12 !rounded-xl !pl-11 !pr-4 text-sm leading-normal"
            placeholder="Search name, email or role"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

        </label>

      </div>

      {/* USERS TABLE */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">

        <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(190px,1.5fr)_minmax(125px,1fr)_minmax(135px,1fr)_112px] items-center gap-4 bg-cream px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted md:grid">

          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-center">Actions</span>

        </div>

        {/* LOADING */}
        {loading && (
          <p className="p-10 text-center text-sm text-muted">
            Loading users...
          </p>
        )}

        {/* USER LIST */}
        {!loading && filtered.map(user => (

          <div
            key={user.id}
            className="grid gap-4 border-t border-line p-4 md:grid-cols-[minmax(180px,1.4fr)_minmax(190px,1.5fr)_minmax(125px,1fr)_minmax(135px,1fr)_112px] md:items-center md:gap-4 md:px-5 md:py-5"
          >

            {/* USER INFORMATION */}
            <div className="flex items-center gap-3">

              <span className="grid h-10 w-10 place-items-center rounded-full bg-blush text-rose">
                <UserRound size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold text-ink">
                  {user.name}
                </p>

                <p className="text-[11px] text-muted">
                  Account #{user.id}
                </p>
              </div>

            </div>

            {/* EMAIL */}
            <span className="break-all text-xs text-muted">
              {user.email}
            </span>

            {/* ROLE */}
            <label className="text-[10px] text-muted md:text-xs">
              Role

              <select
                aria-label={`Role for ${user.name}`}
                className="field mt-1 py-2 text-xs"
                value={user.role}
                onChange={e =>
                  handleRoleChange(user.id, e.target.value)
                }
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            {/* STATUS */}
            <label className="text-[10px] text-muted md:text-xs">
              Status

              <select
                aria-label={`Status for ${user.name}`}
                className="field mt-1 py-2 text-xs"
                value={user.status}
                onChange={e =>
                  handleStatusChange(user.id, e.target.value)
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>

            {/* ACTIONS */}
            <div className="flex items-center justify-start gap-2 md:justify-center">

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(
                    user.id,
                    user.status === 'SUSPENDED'
                      ? 'ACTIVE'
                      : 'SUSPENDED'
                  )
                }
                title={
                  user.status === 'SUSPENDED'
                    ? 'Activate account'
                    : 'Suspend account'
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-sage transition hover:bg-blush"
              >
                {user.status === 'SUSPENDED'
                  ? <CheckCircle2 size={17} />
                  : <Ban size={17} />
                }
              </button>

              <button
                type="button"
                onClick={() => removeUser(user.id)}
                title="Remove account"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-rose transition hover:bg-blush"
              >
                <Trash2 size={17} />
              </button>

            </div>

          </div>

        ))}

        {/* EMPTY RESULT */}
        {!loading && filtered.length === 0 && !error && (
          <p className="p-10 text-center text-sm text-muted">
            No matching accounts.
          </p>
        )}

      </div>

      {/* FOOTER INFORMATION */}
      <p className="mt-4 rounded-xl border border-[#E8DED4] bg-[#F5F3E9] p-4 text-xs leading-6 text-muted">

        <strong className="text-wine">
          Account management:
        </strong>

        {' '}User records are now loaded and managed through your Spring Boot API and PostgreSQL database.

      </p>

    </div>
  )
}