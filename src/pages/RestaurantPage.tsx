import { useParams } from 'react-router-dom'

export default function RestaurantPage() {
  const { id } = useParams()
  return (
    <div>
      <p className="text-gray-400 text-sm">Restaurant #{id} — TODO FE-2</p>
    </div>
  )
}
