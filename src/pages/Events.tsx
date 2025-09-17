import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Event } from '../lib/supabase'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  Plus,
  Clock,
  Star,
  ExternalLink,
  Heart
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Events: React.FC = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([])

  const categories = [
    'All', 'Technology', 'Business', 'Healthcare', 'Education', 
    'Arts & Culture', 'Sports & Recreation', 'Science', 'Social Impact', 'Entertainment'
  ]

  const eventTypes = ['All', 'Physical', 'Virtual', 'Hybrid']

  useEffect(() => {
    fetchEvents()
    fetchFavorites()
  }, [])

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*, profiles!events_organizer_id_fkey(full_name)')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })

      const { data, error } = await query
      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!profile) return
    
    try {
      const { data, error } = await supabase
        .from('event_favorites')
        .select('event_id')
        .eq('user_id', profile.id)

      if (error) throw error
      setFavoriteEvents(data?.map(f => f.event_id) || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const toggleFavorite = async (eventId: string) => {
    if (!profile) return

    try {
      const isFavorited = favoriteEvents.includes(eventId)
      
      if (isFavorited) {
        const { error } = await supabase
          .from('event_favorites')
          .delete()
          .eq('user_id', profile.id)
          .eq('event_id', eventId)

        if (error) throw error
        setFavoriteEvents(prev => prev.filter(id => id !== eventId))
        toast.success('Removed from favorites')
      } else {
        const { error } = await supabase
          .from('event_favorites')
          .insert({ user_id: profile.id, event_id: eventId })

        if (error) throw error
        setFavoriteEvents(prev => [...prev, eventId])
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const registerForEvent = async (eventId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: profile.id,
          event_id: eventId,
          status: 'registered'
        })

      if (error) throw error
      toast.success('Successfully registered for event!')
    } catch (error) {
      console.error('Error registering for event:', error)
      toast.error('Failed to register for event')
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || event.category === selectedCategory
    const matchesType = selectedType === '' || selectedType === 'All' || 
                       event.location_type.toLowerCase() === selectedType.toLowerCase()
    
    return matchesSearch && matchesCategory && matchesType
  })

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
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.role === 'organizer' ? 'My Events' : 'Discover Events'}
              </h1>
              <p className="text-gray-600 mt-2">
                {profile?.role === 'organizer' 
                  ? 'Manage and track your organized events'
                  : 'Find amazing events to join and expand your network'
                }
              </p>
            </div>
            {profile?.role === 'organizer' && (
              <div className="mt-4 lg:mt-0">
                <Link
                  to="/events/create"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type === 'All' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-8">
              {profile?.role === 'organizer' 
                ? "You haven't created any events yet."
                : 'No events match your current filters.'}
            </p>
            {profile?.role === 'organizer' && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {profile?.role !== 'organizer' && (
                      <button
                        onClick={() => toggleFavorite(event.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                          favoriteEvents.includes(event.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${favoriteEvents.includes(event.id) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      event.location_type === 'virtual' 
                        ? 'bg-blue-500/80 text-white'
                        : event.location_type === 'hybrid'
                        ? 'bg-purple-500/80 text-white'
                        : 'bg-green-500/80 text-white'
                    }`}>
                      {event.location_type === 'virtual' ? 'Virtual' : 
                       event.location_type === 'hybrid' ? 'Hybrid' : 'In-Person'}
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 hover:text-purple-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">{event.category}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-purple-600" />
                      {format(new Date(event.start_date), 'MMM dd, yyyy • h:mm a')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="truncate">
                        {event.location_type === 'virtual' ? 'Virtual Event' : event.location}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-600" />
                      Up to {event.capacity} participants
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {profile?.role === 'organizer' ? (
                      <>
                        <Link
                          to={`/events/${event.id}/manage`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-medium transition-colors"
                        >
                          Manage
                        </Link>
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-center py-3 rounded-lg font-medium transition-all"
                        >
                          View Details
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          View Details
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                        <button
                          onClick={() => registerForEvent(event.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events