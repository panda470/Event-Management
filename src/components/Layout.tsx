import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  BarChart3,
  Zap,
} from 'lucide-react'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['organizer', 'participant', 'sponsor'] },
    { name: 'Events', href: '/events', icon: Calendar, roles: ['organizer', 'participant', 'sponsor'] },
    { name: 'Create Event', href: '/events/create', icon: Zap, roles: ['organizer'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['participant'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['organizer', 'sponsor'] },
    { name: 'Profile', href: '/profile', icon: User, roles: ['organizer', 'participant', 'sponsor'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['organizer', 'participant', 'sponsor'] },
  ]

  const filteredNavigation = navigation.filter(item => 
    profile && item.roles.includes(profile.role)
  )

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                EventFlow
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="group flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-xl">
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                EventFlow
              </span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-6">
              <div className="space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600 hover:scale-105'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-1 flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex-1 flex items-center lg:ml-0">
                  <div className="max-w-lg w-full lg:max-w-xs">
                    <div className="relative">
                      <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-gray-400" />
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Search events, teams..."
                        type="search"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {profile?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout