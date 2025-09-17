import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Bell, 
  Shield, 
  Eye, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  UserX,
  Download,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings: React.FC = () => {
  const { profile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    teamInvitations: true,
    marketingEmails: false,
    profileVisibility: 'public' as 'public' | 'private' | 'members',
    showEmail: false,
    showSkills: true,
    twoFactorEnabled: false,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSettingsUpdate = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    try {
      // In a real app, you'd save these settings to the database
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      // Mock data export
      const userData = {
        profile: profile,
        settings: settings,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'my-data-export.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  const deleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )

    if (!confirmation) return

    try {
      // In a real app, you'd call an API endpoint to handle account deletion
      // This would include deleting user data, events, etc.
      toast.success('Account deletion request submitted')
      await signOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="space-y-8">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('emailNotifications', !settings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('pushNotifications', !settings.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Event Reminders</h3>
                  <p className="text-sm text-gray-600">Get reminded about upcoming events</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('eventReminders', !settings.eventReminders)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.eventReminders ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.eventReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Team Invitations</h3>
                  <p className="text-sm text-gray-600">Get notified when invited to join teams</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('teamInvitations', !settings.teamInvitations)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.teamInvitations ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.teamInvitations ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                    { value: 'members', label: 'Members Only', desc: 'Only EventFlow members can view' },
                    { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={settings.profileVisibility === option.value}
                        onChange={(e) => handleSettingsUpdate('profileVisibility', e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Email Address</h3>
                  <p className="text-sm text-gray-600">Make your email visible to other users</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('showEmail', !settings.showEmail)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.showEmail ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.showEmail ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Skills & Interests</h3>
                  <p className="text-sm text-gray-600">Display your skills and interests publicly</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('showSkills', !settings.showSkills)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.showSkills ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.showSkills ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
            </div>
            
            <div className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 mr-2 inline" />
                    Update Password
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate('twoFactorEnabled', !settings.twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    settings.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Download className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Your Data</h3>
                  <p className="text-sm text-gray-600">Download a copy of all your data</p>
                </div>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={deleteAccount}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings