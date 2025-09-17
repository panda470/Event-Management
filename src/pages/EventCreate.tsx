import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Calendar, MapPin, Users, Upload, Palette, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EventCreate: React.FC = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    location_type: 'physical' as 'physical' | 'virtual' | 'hybrid',
    category: '',
    capacity: 50,
    theme: 'modern',
    status: 'draft' as 'draft' | 'published',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const themes = [
    { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-r from-purple-600 to-blue-600' },
    { id: 'nature', name: 'Nature', preview: 'bg-gradient-to-r from-green-600 to-teal-600' },
    { id: 'corporate', name: 'Corporate', preview: 'bg-gradient-to-r from-gray-600 to-slate-600' },
    { id: 'creative', name: 'Creative', preview: 'bg-gradient-to-r from-pink-600 to-orange-600' },
    { id: 'tech', name: 'Tech', preview: 'bg-gradient-to-r from-cyan-600 to-blue-600' },
    { id: 'festive', name: 'Festive', preview: 'bg-gradient-to-r from-yellow-600 to-red-600' },
  ]

  const categories = [
    'Technology', 'Business', 'Healthcare', 'Education', 'Arts & Culture',
    'Sports & Recreation', 'Science', 'Social Impact', 'Entertainment', 'Other'
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            ...formData,
            status,
            organizer_id: profile.id,
            image_url: imageUrl,
          },
        ])
        .select()

      if (error) throw error

      toast.success(status === 'published' ? 'Event published successfully!' : 'Event saved as draft!')
      navigate('/events')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create New Event</h1>
            <p className="text-purple-100 mt-2">Build an amazing experience for your participants</p>
          </div>

          <form className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    placeholder="Describe your event..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Date & Time
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Location
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'physical', label: 'In-Person' },
                      { value: 'virtual', label: 'Virtual' },
                      { value: 'hybrid', label: 'Hybrid' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.location_type === type.value
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, location_type: type.value as any })}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.location_type === 'virtual' ? 'Meeting Link/Platform' : 'Venue Address'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder={
                        formData.location_type === 'virtual'
                          ? 'e.g., Zoom link, Google Meet'
                          : 'Enter venue address'
                      }
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design & Media */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Design & Media
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose Theme
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.theme === theme.id
                            ? 'border-purple-600 ring-2 ring-purple-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, theme: theme.id })}
                      >
                        <div className={`h-12 rounded-lg mb-2 ${theme.preview}`} />
                        <span className="text-sm font-medium text-gray-700">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Event preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div>
                          <label className="cursor-pointer">
                            <span className="text-purple-600 font-medium">Upload an image</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                Save as Draft
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Publish Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EventCreate