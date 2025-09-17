import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Mail, Calendar, MapPin, Edit3, Save, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { profile, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    skills: [] as string[],
    interests: [] as string[],
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: '',
  })

  const availableSkills = [
    'Frontend Development', 'Backend Development', 'UI/UX Design', 'Data Science',
    'Machine Learning', 'Mobile Development', 'DevOps', 'Product Management',
    'Marketing', 'Business Development', 'Research', 'Writing', 'Photography',
    'Video Production', 'Project Management', 'Sales', 'Public Speaking',
    'Event Planning', 'Content Creation', 'Strategy', 'Analytics'
  ]

  const availableInterests = [
    'Technology', 'Business', 'Healthcare', 'Education', 'Arts & Culture',
    'Sports & Recreation', 'Science', 'Social Impact', 'Entertainment',
    'Travel', 'Food & Drink', 'Music', 'Books', 'Gaming', 'Fashion',
    'Environment', 'Politics', 'History', 'Philosophy', 'Psychology'
  ]

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        bio: '',
        location: '',
        website: '',
        linkedin: '',
        twitter: '',
      })
      setAvatarPreview(profile.avatar_url || null)
    }
  }, [profile])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    try {
      let avatarUrl = profile.avatar_url

      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar()
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          skills: formData.skills,
          interests: formData.interests,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setEditing(false)
      setAvatarFile(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-purple-100 capitalize">{profile.role}</p>
                <div className="flex items-center mt-2 text-purple-100">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile.email}
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-300"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditing(false)
                      setAvatarFile(null)
                      setAvatarPreview(profile.avatar_url || null)
                    }}
                    className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                      !editing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                      !editing ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                          !editing ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                        !editing ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => editing && toggleSkill(skill)}
                    disabled={!editing}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      formData.skills.includes(skill)
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : editing
                        ? 'border-gray-300 hover:border-gray-400 text-gray-700 cursor-pointer'
                        : 'border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Interests</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => editing && toggleInterest(interest)}
                    disabled={!editing}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : editing
                        ? 'border-gray-300 hover:border-gray-400 text-gray-700 cursor-pointer'
                        : 'border-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Events Attended</span>
                  <span className="font-semibold text-purple-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Teams Joined</span>
                  <span className="font-semibold text-purple-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-purple-600">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="text-gray-900">Joined team "React Innovators"</p>
                    <p className="text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="text-gray-900">Registered for "AI Workshop"</p>
                    <p className="text-gray-500">5 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="text-gray-900">Updated profile skills</p>
                    <p className="text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile