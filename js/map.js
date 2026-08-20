/**
 * Yatrii - Interactive Leaflet Map Controller
 * Handles route visualization, simulated nearby drivers, pickup/drop markers,
 * and live trip tracking animations.
 */

class YatriiMapController {
  constructor(containerId = 'yatrii-map') {
    this.containerId = containerId;
    this.map = null;
    this.pickupMarker = null;
    this.dropMarker = null;
    this.routePolyline = null;
    this.driverMarkers = [];
    this.liveTrackerMarker = null;
    this.isTracking = false;
    this.animationInterval = null;
    this.defaultCenter = [28.6139, 77.2090]; // Delhi Center default
    this.defaultZoom = 13;
  }

  // Initialize Map
  init() {
    const mapElement = document.getElementById(this.containerId);
    if (!mapElement) return;

    // Prevent re-initialization error
    if (this.map) {
      this.map.remove();
    }

    try {
      this.map = L.map(this.containerId, {
        zoomControl: false,
        attributionControl: false
      }).setView(this.defaultCenter, this.defaultZoom);

      // Add modern CartoDB Positron / Voyager clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(this.map);

      // Add custom positioned zoom controls
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);

      // Spawn initial nearby simulated drivers around the center
      this.spawnNearbyDrivers(this.defaultCenter[0], this.defaultCenter[1]);

      // Handle map resize when tab switches or window resizes
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 300);

    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
    }
  }

  // Spawn simulated animated nearby vehicle icons
  spawnNearbyDrivers(centerLat, centerLng) {
    // Clear old drivers
    this.driverMarkers.forEach(m => this.map.removeLayer(m));
    this.driverMarkers = [];

    const vehicleEmojis = ['🛺', '🚕', '🛵', '🚘', '🚙'];
    const offsets = [
      [0.008, 0.006],
      [-0.006, 0.009],
      [0.007, -0.008],
      [-0.009, -0.005],
      [0.012, 0.002]
    ];

    offsets.forEach((offset, idx) => {
      const lat = centerLat + offset[0];
      const lng = centerLng + offset[1];
      const emoji = vehicleEmojis[idx % vehicleEmojis.length];

      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `<div class="driver-pin-pulse"><span class="driver-emoji">${emoji}</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lat, lng], { icon: driverIcon }).addTo(this.map);
      marker.bindPopup(`<b>Nearby ${emoji} Driver</b><br>ETA ~${idx + 2} mins`);
      this.driverMarkers.push(marker);
    });
  }

  // Draw Route between Pickup and Drop coordinates
  drawRoute(pickupCoords, dropCoords, pickupName = 'Pickup', dropName = 'Destination') {
    if (!this.map) return;

    // Remove existing markers & polyline
    if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
    if (this.dropMarker) this.map.removeLayer(this.dropMarker);
    if (this.routePolyline) this.map.removeLayer(this.routePolyline);

    // Custom Pickup Icon
    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      html: `<div class="pin-badge pin-pickup"><i class="pin-dot"></i> <span>A</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Custom Drop Icon
    const dropIcon = L.divIcon({
      className: 'custom-marker drop-marker',
      html: `<div class="pin-badge pin-drop"><i class="pin-dot"></i> <span>B</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.pickupMarker = L.marker(pickupCoords, { icon: pickupIcon }).addTo(this.map);
    this.pickupMarker.bindPopup(`<b>Pickup Location</b><br>${pickupName}`).openPopup();

    this.dropMarker = L.marker(dropCoords, { icon: dropIcon }).addTo(this.map);
    this.dropMarker.bindPopup(`<b>Drop Destination</b><br>${dropName}`);

    // Generate realistic multi-segment curved route line between points
    const waypoints = this.generateRealisticRoute(pickupCoords, dropCoords);

    this.routePolyline = L.polyline(waypoints, {
      color: '#f4c542',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    // Smoothly fit bounds
    const bounds = L.latLngBounds([pickupCoords, dropCoords]);
    this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    // Update nearby drivers around the pickup point
    this.spawnNearbyDrivers(pickupCoords[0], pickupCoords[1]);
  }

  // Generate intermediate curve waypoints for realistic road trajectory simulation
  generateRealisticRoute(start, end) {
    const points = [start];
    const segments = 10;
    const dLat = (end[0] - start[0]) / segments;
    const dLng = (end[1] - start[1]) / segments;

    for (let i = 1; i < segments; i++) {
      // Add subtle road curve deviation
      const curveFactor = Math.sin((i / segments) * Math.PI) * 0.003;
      const lat = start[0] + dLat * i + (i % 2 === 0 ? curveFactor : -curveFactor * 0.5);
      const lng = start[1] + dLng * i + (i % 2 === 1 ? curveFactor : -curveFactor * 0.5);
      points.push([lat, lng]);
    }
    points.push(end);
    return points;
  }

  // Start animated vehicle movement on map for live tracking simulation
  startLiveTracking(pickupCoords, dropCoords, vehicleIcon = '🚕', onProgressUpdate = null, onComplete = null) {
    if (!this.map) return;
    this.stopLiveTracking();

    const waypoints = this.generateRealisticRoute(pickupCoords, dropCoords);
    let currentIndex = 0;
    const totalSteps = waypoints.length;

    // Create tracker marker
    const movingIcon = L.divIcon({
      className: 'live-tracking-driver-pin',
      html: `<div class="live-moving-bubble"><span class="driver-live-emoji">${vehicleIcon}</span><div class="radar-ripple"></div></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.liveTrackerMarker = L.marker(waypoints[0], { icon: movingIcon }).addTo(this.map);
    this.isTracking = true;

    this.animationInterval = setInterval(() => {
      if (!this.isTracking) return;

      currentIndex++;
      if (currentIndex < totalSteps) {
        const nextCoord = waypoints[currentIndex];
        this.liveTrackerMarker.setLatLng(nextCoord);
        this.map.panTo(nextCoord, { animate: true, duration: 1 });

        const progressPercent = Math.round((currentIndex / (totalSteps - 1)) * 100);
        const remainingMinutes = Math.max(1, Math.round((1 - currentIndex / totalSteps) * 12));

        if (onProgressUpdate) {
          onProgressUpdate(progressPercent, remainingMinutes);
        }
      } else {
        // Arrived!
        this.stopLiveTracking();
        if (onProgressUpdate) onProgressUpdate(100, 0);
        if (onComplete) onComplete();
      }
    }, 2400);
  }

  stopLiveTracking() {
    this.isTracking = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    if (this.liveTrackerMarker && this.map) {
      this.map.removeLayer(this.liveTrackerMarker);
      this.liveTrackerMarker = null;
    }
  }

  // Invalidate map size helper
  resize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }
}

// Global instance
window.yatriiMap = new YatriiMapController();
