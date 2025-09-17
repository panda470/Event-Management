import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Event, EventRegistration } from '../lib/supabase'
import { Calendar, Users, TrendingUp, Zap, Clock, MapPin, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard: React.FC = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    completedEvents: 0,
  })
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [profile])

  const fetchDashboardData = async () => {
    if (!profile) return

    try {
      if (profile.role === 'organizer') {
        // Fetch organizer stats
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: allEvents } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', profile.id)

        if (events) setRecentEvents(events)
        if (allEvents) {
          setStats({
            totalEvents: allEvents.length,
            upcomingEvents: allEvents.filter(e => new Date(e.start_date) > new Date()).length,
            completedEvents: allEvents.filter(e => e.status === 'completed').length,
            totalParticipants: 0, // Would need to join with registrations
          })
        }
      } else {
        // Fetch participant/sponsor stats
        const { data: userRegistrations } = await supabase
          .from('event_registrations')
          .select('*, events(*)')
          .eq('user_id', profile.id)
          .order('registered_at', { ascending: false })

        const { data: upcomingEvents } = await supabase
          .from('events')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .eq('status', 'published')
          .order('start_date', { ascending: true })
          .limit(5)

        if (userRegistrations) {
          setRegistrations(userRegistrations)
          setStats({
            totalEvents: userRegistrations.length,
            upcomingEvents: userRegistrations.filter(r => 
              r.events && new Date(r.events.start_date) > new Date()
            ).length,
            completedEvents: userRegistrations.filter(r => 
              r.events && r.events.status === 'completed'
            ).length,
            totalParticipants: 0,
          })
        }
        if (upcomingEvents) setRecentEvents(upcomingEvents)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleSpecificContent = () => {
    switch (profile?.role) {
      case 'organizer':
        return {
          title: 'Event Organizer Dashboard',
          subtitle: 'Manage your events and track engagement',
          primaryAction: { text: 'Create New Event', href: '/events/create' },
          stats: [
            { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'bg-blue-500' },
            { label: 'Upcoming', value: stats.upcomingEvents, icon: Clock, color: 'bg-green-500' },
            { label: 'Completed', value: stats.completedEvents, icon: TrendingUp, color: 'bg-purple-500' },
            { label: 'Total Reach', value: '2.4K', icon: Users, color: 'bg-orange-500' },
          ]
        }
      case 'sponsor':
        return {
          title: 'Sponsor Dashboard',
          subtitle: 'Track your sponsorship ROI and engagement',
          primaryAction: { text: 'View Analytics', href: '/analytics' },
          stats: [
            { label: 'Sponsored Events', value: stats.totalEvents, icon: Calendar, color: 'bg-blue-500' },
            { label: 'Active Campaigns', value: stats.upcomingEvents, icon: Zap, color: 'bg-green-500' },
            { label: 'Total Impressions', value: '15.7K', icon: TrendingUp, color: 'bg-purple-500' },
            { label: 'Engagement Rate', value: '8.2%', icon: Users, color: 'bg-orange-500' },
          ]
        }
      default:
        return {
          title: 'Participant Dashboard',
          subtitle: 'Discover and join amazing events',
          primaryAction: { text: 'Browse Events', href: '/events' },
          stats: [
            { label: 'Registered Events', value: stats.totalEvents, icon: Calendar, color: 'bg-blue-500' },
            { label: 'Upcoming', value: stats.upcomingEvents, icon: Clock, color: 'bg-green-500' },
            { label: 'Completed', value: stats.completedEvents, icon: TrendingUp, color: 'bg-purple-500' },
            { label: 'Teams Joined', value: '3', icon: Users, color: 'bg-orange-500' },
          ]
        }
    }
  }

  const content = getRoleSpecificContent()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {profile?.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">{content.subtitle}</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <a
            href={content.primaryAction.href}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {content.primaryAction.text}
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.role === 'organizer' ? 'Recent Events' : 'Recommended Events'}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No events found</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location_type === 'virtual' ? 'Virtual' : event.location}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {profile?.role === 'organizer' ? 'Create Event' : 'Browse Events'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    {profile?.role === 'organizer' ? 'View Analytics' : 'Join Teams'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>

              <button className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    View Reports
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard