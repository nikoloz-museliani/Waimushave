import { useRef } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { LatLng } from '../types'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const START_CENTER = { lat: 20, lng: 0 }

interface Props {
  value: LatLng | null
  onChange: (value: LatLng) => void
}

function MapView({ value, onChange }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: API_KEY ?? '' })

  function moveTo(pos: LatLng) {
    onChange(pos)
    mapRef.current?.panTo(pos)
    mapRef.current?.setZoom(15)
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (p) => moveTo({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => alert('Could not get your location'),
    )
  }

  if (loadError) return <p>Google Maps failed to load.</p>
  if (!isLoaded) return <p>Loading map...</p>

  return (
    <div>
      <button type="button" onClick={useMyLocation}>Use my current location</button>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '300px' }}
        center={START_CENTER}
        zoom={2}
        onLoad={(map) => { mapRef.current = map }}
        onClick={(e) => e.latLng && onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
      >
        {value && <Marker position={value} />}
      </GoogleMap>
      <p>{value ? `Pin: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'Click the map to drop a pin.'}</p>
    </div>
  )
}

// Without a key, skip Google entirely
function LocationPicker(props: Props) {
  if (!API_KEY) return <p>Map pin is disabled for now. Enter the city and street above.</p>
  return <MapView {...props} />
}

export default LocationPicker