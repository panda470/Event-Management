import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Star
} from 'lucide-react'

const Analytics: React.FC = () => {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalEngagement: 0,
    conversionRate: 0,
  })

  // Mock data - In a real app, this would come from your database
  const eventPerformanceData = [
    { name: 'Jan', events: 4, participants: 120, engagement: 85 },
    { name: 'Feb', events: 6, participants: 180, engagement: 92 },
    { name: 'Mar', events: 8, participants: 240, engagement: 78 },
    { name: 'Apr', events: 5, participants: 150, engagement: 88 },
    { name: 'May', events: 7, participants: 210, engagement: 94 },
    { name: 'Jun', events: 9, participants: 270, engagement: 86 },
  ]

  const categoryData = [
    { name: 'Technology', value: 35, color: '#8B5CF6' },
    { name: 'Business', value: 25, color: '#3B82F6' },
    { name: 'Education', value: 20, color: '#10B981' },
    { name: 'Healthcare', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' },
  ]

  const engagementMetrics = [
    { metric: 'Event Views', value: 2847, change: 12.5, icon: Eye },
    { metric: 'Registrations', value: 1240, change: 8.2, icon: Users },
    { metric: 'Favorites', value: 456, change: -2.1, icon: Heart },
    { metric: 'Shares', value: 128, change: 15.7, icon: MessageCircle },
  ]

  useEffect(() => {
    fetchAnalytics()
  }, [profile, timeRange])

  const fetchAnalytics = async () => {
    if (!profile) return

    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch events data
      if (profile.role === 'organizer') {
        const { data: events } = await supabase
          .from('events')
          .select('id, created_at')
          .eq('organizer_id', profile.id)
          .gte('created_at', startDate.toISOString())

        // Fetch registrations data
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .in('event_id', events?.map(e => e.id) || [])

        setAnalytics({
          totalEvents: events?.length || 0,
          totalParticipants: registrations?.length || 0,
          totalEngagement: Math.round(Math.random() * 100),
          conversionRate: Math.round(Math.random() * 15) + 5,
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    // Mock export functionality
    const csvContent = eventPerformanceData
      .map(row => `${row.name},${row.events},${row.participants},${row.engagement}`)
      .join('\n')

    const blob = new Blob([`Month,Events,Participants,Engagement\n${csvContent}`], {
      type: 'text/csv;charset=utf-8;'
    })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'analytics-export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-2">
                Track performance and gain insights from your events
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {engagementMetrics.map((metric, index) => (
            <div
              key={metric.metric}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.metric}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      metric.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Event Performance Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Events Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Event Creation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performing Events */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Events</h3>
            <div className="space-y-4">
              {[
                { name: 'Tech Innovation Summit', participants: 120, rating: 4.8 },
                { name: 'Digital Marketing Workshop', participants: 95, rating: 4.6 },
                { name: 'AI & Machine Learning Conference', participants: 150, rating: 4.9 },
                { name: 'Startup Pitch Competition', participants: 80, rating: 4.5 },
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                      {event.name}
                    </h4>
                    <div className="flex items-center mt-1">
                      <Users className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">{event.participants}</span>
                      <Star className="w-3 h-3 text-yellow-400 ml-3 mr-1" />
                      <span className="text-xs text-gray-600">{event.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            AI-Powered Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-purple-700">Performance Insights</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Your technology events have 25% higher engagement rates</li>
                <li>• Weekend events show 15% better attendance</li>
                <li>• Virtual events have lower cancellation rates (8% vs 12%)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Consider hosting more technology-focused events</li>
                <li>• Try scheduling more weekend sessions</li>
                <li>• Implement team formation features for better engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics