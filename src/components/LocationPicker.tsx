import './LocationPicker.css'
import { usePreferences } from '../context/usePreferences'
import { useRef } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { LatLng } from '../types'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const START_CENTER = { lat: 41.7151, lng: 44.8271 }

interface Props {
  value: LatLng | null
  onChange: (value: LatLng) => void
}

function MapView({ value, onChange }: Props) {
  const { t } = usePreferences()
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
      () => alert(t('Could not get your location')),
    )
  }

  if (loadError) return <p>{t('Google Maps failed to load.')}</p>
  if (!isLoaded) return <p>{t('Loading map...')}</p>

  return (
    <div>
      <button type="button" onClick={useMyLocation}>
        {t('Use my current location')}
      </button>
      <GoogleMap
        mapContainerClassName="location-map"
        center={START_CENTER}
        zoom={7}
        onLoad={(map) => {
          mapRef.current = map
        }}
        onClick={(e) => e.latLng && onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
      >
        {value && <Marker position={value} />}
      </GoogleMap>
      <p>
        {value
          ? `${t('Pin')}: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
          : t('Click the map to drop a pin.')}
      </p>
    </div>
  )
}

// Without a key, skip Google entirely
function LocationPicker(props: Props) {
  const { t } = usePreferences()
  if (!API_KEY) return <p>{t('Map pin is disabled for now. Enter the city and street above.')}</p>
  return <MapView {...props} />
}

export default LocationPicker
