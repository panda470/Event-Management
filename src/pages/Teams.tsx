import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Team, Event } from '../lib/supabase'
import { Users, Plus, Search, Star, MessageCircle, Calendar, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const Teams: React.FC = () => {
  const { profile } = useAuth()
  const [teams, setTeams] = useState<(Team & { events: Event })[]>([])
  const [myTeams, setMyTeams] = useState<string[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    event_id: '',
    max_members: 4,
    skills_required: [] as string[],
  })

  const availableSkills = [
    'Frontend Development', 'Backend Development', 'UI/UX Design', 'Data Science',
    'Machine Learning', 'Mobile Development', 'DevOps', 'Product Management',
    'Marketing', 'Business Development', 'Research', 'Writing', 'Photography',
    'Video Production', 'Project Management', 'Sales'
  ]

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    if (!profile) return

    try {
      // Fetch available events for team formation
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())

      if (eventsData) setEvents(eventsData)

      // Fetch all teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*, events(*)')
        .order('created_at', { ascending: false })

      if (teamsData) setTeams(teamsData as any)

      // Fetch user's team memberships
      const { data: membershipsData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', profile.id)

      if (membershipsData) {
        setMyTeams(membershipsData.map(m => m.team_id))
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
      toast.error('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          ...newTeam,
          leader_id: profile.id,
        }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        // Add the creator as the first team member
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: data[0].id,
            user_id: profile.id,
          }])

        if (memberError) throw memberError

        toast.success('Team created successfully!')
        setShowCreateTeam(false)
        setNewTeam({
          name: '',
          description: '',
          event_id: '',
          max_members: 4,
          skills_required: [],
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error('Failed to create team')
    }
  }

  const joinTeam = async (teamId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: profile.id,
        }])

      if (error) throw error

      toast.success('Successfully joined team!')
      fetchData()
    } catch (error) {
      console.error('Error joining team:', error)
      toast.error('Failed to join team')
    }
  }

  const leaveTeam = async (teamId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', profile.id)

      if (error) throw error

      toast.success('Left team successfully')
      fetchData()
    } catch (error) {
      console.error('Error leaving team:', error)
      toast.error('Failed to leave team')
    }
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = selectedEvent === '' || team.event_id === selectedEvent
    return matchesSearch && matchesEvent
  })

  const toggleSkill = (skill: string) => {
    setNewTeam(prev => ({
      ...prev,
      skills_required: prev.skills_required.includes(skill)
        ? prev.skills_required.filter(s => s !== skill)
        : [...prev.skills_required, skill]
    }))
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
              <h1 className="text-3xl font-bold text-gray-900">Team Formation</h1>
              <p className="text-gray-600 mt-2">
                Find teammates with complementary skills and join forces
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={() => setShowCreateTeam(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600 mb-8">
              Be the first to create a team for upcoming events!
            </p>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                      {team.events && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {team.events.title}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Team Size</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {myTeams.includes(team.id) ? '1' : '0'}/{team.max_members}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {team.description}
                  </p>

                  {/* Skills Required */}
                  {team.skills_required && team.skills_required.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</div>
                      <div className="flex flex-wrap gap-2">
                        {team.skills_required.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {team.skills_required.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{team.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Team Location/Event Info */}
                  {team.events && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {team.events.location_type === 'virtual' ? 'Virtual Event' : team.events.location}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {myTeams.includes(team.id) ? (
                      <>
                        <button
                          onClick={() => leaveTeam(team.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-center py-3 rounded-lg font-medium transition-colors"
                        >
                          Leave Team
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-center py-3 rounded-lg font-medium transition-all flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                        <button
                          onClick={() => joinTeam(team.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-center py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                        >
                          Join Team
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

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
            </div>
            <form onSubmit={createTeam} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Describe your team and what you're looking for..."
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={newTeam.event_id}
                    onChange={(e) => setNewTeam({ ...newTeam, event_id: e.target.value })}
                  >
                    <option value="">Select an event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={newTeam.max_members}
                    onChange={(e) => setNewTeam({ ...newTeam, max_members: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skills Looking For
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        newTeam.skills_required.includes(skill)
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teams