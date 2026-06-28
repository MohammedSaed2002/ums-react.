import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

const API_URL = 'https://ums12.runasp.net/api/users'

const getUsers = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

const createUser = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

const updateUser = async ({ id, formData }) => {
  const response = await axios.patch(`${API_URL}/${id}`, {
    name: formData.get('name'),
    email: formData.get('email'),
    age: Number(formData.get('age')),
  })
  return response.data
}

const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`)
  return response.data
}

export default function Users() {
  const queryClient = useQueryClient()

  const [form, setForm] = useState({ name: '', email: '', age: '', image: null })
  const [editingId, setEditingId] = useState(null)

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setForm({ name: '', email: '', age: '', image: null })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingId(null)
      setForm({ name: '', email: '', age: '', image: null })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setForm((prev) => ({ ...prev, image: files[0] }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.age) return
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('age', form.age)
    if (form.image) formData.append('image', form.image)

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (user) => {
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, age: user.age, image: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleReset = () => {
    setForm({ name: '', email: '', age: '', image: null })
    setEditingId(null)
    createMutation.reset()
    updateMutation.reset()
  }

  const isSuccess = editingId ? updateMutation.isSuccess : createMutation.isSuccess
  const isError2 = editingId ? updateMutation.isError : createMutation.isError
  const mutError = editingId ? updateMutation.error : createMutation.error
  const isPending = editingId ? updateMutation.isPending : createMutation.isPending

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans text-gray-900">
      <h1 className="text-xl font-medium mb-6">User Management</h1>

      {/* Add / Edit User Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
          {editingId ? `Edit user #${editingId}` : 'Add new user'}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alaa Test"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alaa@example.com"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="30"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Profile image</label>
            <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition">
              <span>{form.image ? form.image.name : 'Choose file'}</span>
              <input type="file" name="image" className="hidden" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        {isSuccess && (
          <p className="mt-3 text-sm text-green-600">
            ✓ User {editingId ? 'updated' : 'added'} successfully!
          </p>
        )}
        {isError2 && (
          <p className="mt-3 text-sm text-red-500">✗ Error: {mutError?.message}</p>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Saving...' : editingId ? 'Update user' : 'Add user'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">All users</span>
            {data && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {data.users?.length ?? data.length} users
              </span>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        )}

        {isError && (
          <div className="text-center py-10 text-red-500">Error: {error.message}</div>
        )}

        {data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100 w-10">#</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100">Name</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100">Email</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100 w-16">Age</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100">Image</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.users ?? data).map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 text-gray-400 border-b border-gray-100">{index + 1}</td>
                    <td className="px-3 py-3 font-medium border-b border-gray-100">{user.name}</td>
                    <td className="px-3 py-3 text-blue-500 border-b border-gray-100">{user.email}</td>
                    <td className="px-3 py-3 border-b border-gray-100">{user.age}</td>
                    <td className="px-3 py-3 text-gray-400 border-b border-gray-100">{user.image ?? '—'}</td>
                    <td className="px-3 py-3 border-b border-gray-100">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-2 py-1 text-xs border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                          className="px-2 py-1 text-xs border border-red-100 rounded-md text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}