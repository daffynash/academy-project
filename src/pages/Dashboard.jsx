import { useEffect, useState } from 'react'
import { getTeamsByCoach } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])

  useEffect(() => {
    if (!user) return
    // load teams for coach using uid
    getTeamsByCoach(user.uid).then(setTeams).catch(() => setTeams([]))
  }, [user])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="space-y-4">
        {teams.length === 0 && <p>No teams found for this coach.</p>}
        {teams.map(t => (
          <div key={t.id} className="p-4 border rounded">
            <h2 className="font-medium">{t.name}</h2>
            <p className="text-sm">ID: {t.id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
