/**
 * Yatrii - Core Application Controller (Connected with Express REST API Backend)
 * Handles state, REST API calls, dynamic fare calculations, hotel filtering,
 * interactive driver chat, booking cancellations, reviews, and user profile.
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    mode: 'rides', // 'rides', 'hotels', 'rentals', 'outstation'
    user: JSON.parse(localStorage.getItem('yatrii_user') || JSON.stringify({
      id: 'usr_001',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      walletBalance: 1500
    })),
    pickup: {
      name: 'Indira Gandhi International Airport (DEL)',
      lat: 28.5562,
      lng: 77.1000
    },
    drop: {
      name: 'Connaught Place Central Hub',
      lat: 28.6315,
      lng: 77.2167
    },
    selectedVehicleId: 'cab_prime',
    selectedHotel: null,
    selectedRoom: null,
    distanceKm: 18.4,
    durationMins: 32,
    activeCoupon: null,
    currentCheckoutItem: null,
    bookings: [],
    theme: localStorage.getItem('yatrii_theme') || 'light',
    hotelFilters: {
      city: 'Jaipur',
      maxPrice: 12000,
      stars: 'all',
      amenities: [],
      sortBy: 'recommended'
    }
  };

  // --- Initialize App ---
  async function initApp() {
    applyTheme(state.theme);
    updateUserProfileUI();
    initMap();
    await fetchBookingsFromBackend();
    renderVehicleFleet();
    renderHotels();
    renderOffers();
    renderTestimonials();
    setupEventListeners();
    setDefaultDates();
  }

  // --- User Profile & Theme Controller ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yatrii_theme', theme);

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
  }

  function updateUserProfileUI() {
    const nameEl = document.getElementById('nav-user-name');
    const passNameInput = document.getElementById('passenger-name');
    const passPhoneInput = document.getElementById('passenger-phone');
    const passEmailInput = document.getElementById('passenger-email');

    if (nameEl) nameEl.textContent = state.user.name.split(' ')[0] + ' ' + (state.user.name.split(' ')[1] ? state.user.name.split(' ')[1][0] + '.' : '');
    if (passNameInput) passNameInput.value = state.user.name;
    if (passPhoneInput) passPhoneInput.value = state.user.phone;
    if (passEmailInput) passEmailInput.value = state.user.email;
  }

  // --- Backend API Sync: Fetch Bookings ---
  async function fetchBookingsFromBackend() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const json = await res.json();
        state.bookings = json.data || [];
      } else {
        state.bookings = JSON.parse(localStorage.getItem('yatrii_bookings') || '[]');
      }
    } catch (e) {
      console.warn('Backend offline, using local storage cache:', e);
      state.bookings = JSON.parse(localStorage.getItem('yatrii_bookings') || '[]');
    }
    updateBookingCountBadge();
  }

  // --- Initialize Leaflet Map ---
  function initMap() {
    if (window.yatriiMap) {
      window.yatriiMap.init();
      recalculateRouteAndFares();
    }
  }

  function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const checkinInput = document.getElementById('hotel-checkin');
    const checkoutInput = document.getElementById('hotel-checkout');

    if (checkinInput && checkoutInput) {
      checkinInput.value = tomorrow.toISOString().split('T')[0];
      checkoutInput.value = dayAfter.toISOString().split('T')[0];
    }
  }

  // --- Distance & Fare Recalculation (Backend API Call with Client Fallback) ---
  async function recalculateRouteAndFares() {
    if (!state.pickup || !state.drop) return;

    // Try backend calculation
    try {
      const res = await fetch('/api/fares/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: state.pickup.lat,
          pickupLng: state.pickup.lng,
          dropLat: state.drop.lat,
          dropLng: state.drop.lng,
          mode: state.mode
        })
      });

      if (res.ok) {
        const json = await res.json();
        state.distanceKm = json.data.distanceKm;
        state.durationMins = json.data.durationMins;
      } else {
        fallbackDistanceCalc();
      }
    } catch (e) {
      fallbackDistanceCalc();
    }

    // Update UI Stats
    const distEl = document.getElementById('route-dist-val');
    const timeEl = document.getElementById('route-time-val');
    const routeText = document.getElementById('map-route-text');

    if (distEl) distEl.textContent = `${state.distanceKm} km`;
    if (timeEl) timeEl.textContent = `${state.durationMins} mins`;
    if (routeText) {
      routeText.textContent = `${state.pickup.name.split(',')[0]} ➔ ${state.drop.name.split(',')[0]}`;
    }

    // Update Map
    if (window.yatriiMap) {
      window.yatriiMap.drawRoute(
        [state.pickup.lat, state.pickup.lng],
        [state.drop.lat, state.drop.lng],
        state.pickup.name,
        state.drop.name
      );
    }

    renderVehicleFleet();
  }

  function fallbackDistanceCalc() {
    const R = 6371;
    const dLat = (state.drop.lat - state.pickup.lat) * Math.PI / 180;
    const dLon = (state.drop.lng - state.pickup.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(state.pickup.lat * Math.PI / 180) * Math.cos(state.drop.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    state.distanceKm = Math.max(2, parseFloat((R * c).toFixed(1)));
    state.durationMins = Math.max(8, Math.round((state.distanceKm / 32) * 60));
  }

  // --- Render Vehicle Fleet Cards ---
  function renderVehicleFleet() {
    const container = document.getElementById('vehicle-fleet-list');
    if (!container) return;

    let vehicles = YatriiData.vehicles;
    if (state.mode === 'rentals') {
      vehicles = vehicles.filter(v => v.category === 'rentals');
    } else if (state.mode === 'outstation') {
      vehicles = vehicles.filter(v => v.category === 'outstation');
    } else {
      vehicles = vehicles.filter(v => v.category === 'daily');
    }

    if (!vehicles.find(v => v.id === state.selectedVehicleId) && vehicles.length > 0) {
      state.selectedVehicleId = vehicles[0].id;
    }

    container.innerHTML = vehicles.map(v => {
      let fare = 0;
      let pricingLabel = '';

      if (v.category === 'rentals') {
        fare = v.dailyRate;
        pricingLabel = `/ day (₹${v.hourlyRate}/hr)`;
      } else if (v.category === 'outstation') {
        const outstationDist = Math.max(80, state.distanceKm * 2);
        fare = Math.round(v.baseFare + (outstationDist * v.perKm));
        pricingLabel = ' (Roundtrip Est.)';
      } else {
        fare = Math.round(Math.max(v.minFare, v.baseFare + (state.distanceKm * v.perKm)));
        pricingLabel = '';
      }

      const isSelected = v.id === state.selectedVehicleId;

      return `
        <div class="vehicle-card ${isSelected ? 'selected' : ''}" data-vehicle-id="${v.id}">
          <div class="vehicle-main-info">
            <div class="vehicle-icon-wrap">${v.icon}</div>
            <div class="vehicle-details">
              <div class="vehicle-title-row">
                <span class="vehicle-name">${v.name}</span>
                <span class="vehicle-tag tag-${v.tagColor}">${v.tag}</span>
              </div>
              <div class="vehicle-meta-specs">
                <span><i class="ri-user-3-line"></i> ${v.seats} Seats</span>
                <span>•</span>
                <span><i class="ri-suitcase-line"></i> ${v.luggage}</span>
                <span>•</span>
                <span><i class="ri-shield-check-line"></i> Sanitized</span>
              </div>
            </div>
          </div>
          <div class="vehicle-pricing-info">
            <div class="vehicle-fare">₹${fare.toLocaleString('en-IN')}<span style="font-size: 0.72rem; font-weight: 500; color: var(--text-muted);">${pricingLabel}</span></div>
            <div class="vehicle-eta-text"><i class="ri-flashlight-fill"></i> ${v.eta}</div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => {
        state.selectedVehicleId = card.getAttribute('data-vehicle-id');
        container.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  // --- Render Hotels Grid ---
  function renderHotels() {
    const grid = document.getElementById('hotels-grid');
    if (!grid) return;

    let list = [...YatriiData.hotels];

    if (state.hotelFilters.city && state.hotelFilters.city.trim() !== '') {
      const q = state.hotelFilters.city.toLowerCase().trim();
      const cityMatches = list.filter(h =>
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q)
      );
      list = cityMatches;
    }

    list = list.filter(h => h.pricePerNight <= state.hotelFilters.maxPrice);

    if (state.hotelFilters.stars !== 'all') {
      const minStars = parseInt(state.hotelFilters.stars);
      list = list.filter(h => h.stars >= minStars);
    }

    if (state.hotelFilters.amenities.length > 0) {
      list = list.filter(h =>
        state.hotelFilters.amenities.every(amenity => h.amenities.includes(amenity))
      );
    }

    if (state.hotelFilters.sortBy === 'price_low') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (state.hotelFilters.sortBy === 'price_high') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (state.hotelFilters.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-glass-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <i class="ri-hotel-line" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block;"></i>
          <h3 style="margin-bottom: 0.5rem;">No Stays Found Matching Filters</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">Try increasing your max budget or resetting some amenity filters.</p>
          <button class="btn-primary-search" id="btn-empty-reset-hotel" style="margin: 0 auto; min-height: 42px; font-size: 0.9rem;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('btn-empty-reset-hotel')?.addEventListener('click', resetHotelFilters);
      return;
    }

    grid.innerHTML = list.map(hotel => `
      <div class="hotel-card" data-hotel-id="${hotel.id}">
        <div class="hotel-image-wrapper">
          <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image" loading="lazy">
          <span class="hotel-badge-floating">${hotel.badge}</span>
          <div class="hotel-rating-floating">
            <i class="ri-star-fill star"></i> ${hotel.rating} (${hotel.reviewCount})
          </div>
        </div>
        <div class="hotel-body">
          <h3 class="hotel-name">${hotel.name}</h3>
          <div class="hotel-location-text">
            <i class="ri-map-pin-2-fill text-warning"></i> ${hotel.location}
          </div>
          <div class="hotel-amenity-tags">
            ${hotel.amenities.slice(0, 3).map(a => `<span class="amenity-chip">${a}</span>`).join('')}
            ${hotel.amenities.length > 3 ? `<span class="amenity-chip">+${hotel.amenities.length - 3} more</span>` : ''}
          </div>
          <div class="hotel-footer-pricing">
            <div class="hotel-price-block">
              <span class="price-original">₹${hotel.originalPrice.toLocaleString('en-IN')}</span>
              <span class="price-current">₹${hotel.pricePerNight.toLocaleString('en-IN')} <span>/ night</span></span>
            </div>
            <button class="btn-view-hotel" data-hotel-id="${hotel.id}">
              View & Book <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.hotel-card, .btn-view-hotel').forEach(el => {
      el.addEventListener('click', () => {
        const hotelId = el.getAttribute('data-hotel-id');
        openHotelDetailModal(hotelId);
      });
    });
  }

  // --- Hotel Detail Modal ---
  function openHotelDetailModal(hotelId) {
    const hotel = YatriiData.hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    state.selectedHotel = hotel;
    state.selectedRoom = hotel.rooms[0];

    const modal = document.getElementById('hotel-detail-modal');
    const titleEl = document.getElementById('hotel-modal-title');
    const bodyEl = document.getElementById('hotel-modal-body');

    if (!modal || !bodyEl) return;

    titleEl.textContent = hotel.name;

    bodyEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="position: relative; width: 100%; height: 260px; border-radius: var(--radius-lg); overflow: hidden;">
          <img src="${hotel.gallery[0]}" alt="${hotel.name}" id="main-hotel-preview-img" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; bottom: 10px; left: 10px; display: flex; gap: 6px;">
            ${hotel.gallery.map((img, i) => `
              <img src="${img}" class="gallery-thumb" data-full="${img}" style="width: 54px; height: 38px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${i === 0 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.7)'};">
            `).join('')}
          </div>
        </div>

        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <div style="font-size: 0.95rem; color: var(--text-muted);"><i class="ri-map-pin-2-fill text-warning"></i> ${hotel.location}, ${hotel.city}</div>
            <div class="hotel-rating-floating" style="position: static; display: inline-flex;"><i class="ri-star-fill star"></i> ${hotel.rating} (${hotel.reviewCount} reviews)</div>
          </div>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55;">${hotel.description}</p>
        </div>

        <div>
          <h4 style="font-size: 1rem; margin-bottom: 0.65rem;"><i class="ri-sparkling-fill text-warning"></i> Property Inclusions & Amenities</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${hotel.amenities.map(a => `<span class="amenity-chip" style="background: var(--brand-primary-light); color: var(--brand-primary); border-color: rgba(255,107,0,0.3); font-weight: 600;">✓ ${a}</span>`).join('')}
          </div>
        </div>

        <div>
          <h4 style="font-size: 1rem; margin-bottom: 0.75rem;"><i class="ri-hotel-bed-fill text-warning"></i> Select Room Tier</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${hotel.rooms.map((room, idx) => `
              <div class="room-option-card ${idx === 0 ? 'selected' : ''}" data-room-index="${idx}" style="padding: 1rem; border-radius: var(--radius-md); background: var(--bg-tertiary); border: 1.5px solid ${idx === 0 ? 'var(--brand-primary)' : 'var(--border-color)'}; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                  <div>
                    <div style="font-weight: 700; font-size: 1.05rem;">${room.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${room.size} • ${room.bed} • ${room.capacity}</div>
                  </div>
                  <div style="font-size: 1.25rem; font-weight: 800; color: var(--brand-primary);">₹${room.price.toLocaleString('en-IN')}<span style="font-size: 0.75rem; color: var(--text-muted);">/night</span></div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; font-size: 0.78rem; color: var(--color-success);">
                  ${room.features.map(f => `<span>✓ ${f}</span>`).join(' • ')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn-book-vehicle-action" id="btn-proceed-hotel-booking">
          <i class="ri-calendar-check-fill"></i> Reserve Room for ₹${hotel.rooms[0].price.toLocaleString('en-IN')}
        </button>
      </div>
    `;

    bodyEl.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const fullImg = thumb.getAttribute('data-full');
        const mainImg = document.getElementById('main-hotel-preview-img');
        if (mainImg) mainImg.src = fullImg;
        bodyEl.querySelectorAll('.gallery-thumb').forEach(t => t.style.borderColor = 'rgba(255,255,255,0.7)');
        thumb.style.borderColor = 'var(--brand-primary)';
      });
    });

    bodyEl.querySelectorAll('.room-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const roomIdx = parseInt(card.getAttribute('data-room-index'));
        state.selectedRoom = hotel.rooms[roomIdx];
        bodyEl.querySelectorAll('.room-option-card').forEach(c => {
          c.classList.remove('selected');
          c.style.borderColor = 'var(--border-color)';
        });
        card.classList.add('selected');
        card.style.borderColor = 'var(--brand-primary)';

        const reserveBtn = document.getElementById('btn-proceed-hotel-booking');
        if (reserveBtn) {
          reserveBtn.innerHTML = `<i class="ri-calendar-check-fill"></i> Reserve Room for ₹${state.selectedRoom.price.toLocaleString('en-IN')}`;
        }
      });
    });

    document.getElementById('btn-proceed-hotel-booking')?.addEventListener('click', () => {
      closeModal('hotel-detail-modal');
      openCheckoutModal('hotel');
    });

    openModal('hotel-detail-modal');
  }

  // --- Offers & Testimonials ---
  function renderOffers() {
    const grid = document.getElementById('offers-grid');
    if (!grid) return;

    grid.innerHTML = YatriiData.coupons.map(c => `
      <div class="offer-card">
        <div>
          <span class="offer-badge">${c.discountType === 'flat' ? `Flat ₹${c.value} OFF` : `${c.value}% OFF`}</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">${c.description}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Min booking value: ₹${c.minOrder} • Valid on ${c.applicableTo.toUpperCase()}</p>
        </div>
        <div class="offer-code-row">
          <span class="coupon-code-text">${c.code}</span>
          <button class="btn-copy-code" data-code="${c.code}">Copy Code</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        navigator.clipboard.writeText(code).then(() => {
          showToast(`Coupon code ${code} copied!`, 'success');
          const couponInput = document.getElementById('checkout-coupon-input');
          if (couponInput) couponInput.value = code;
        }).catch(() => {
          showToast(`Coupon code: ${code}`, 'info');
        });
      });
    });
  }

  function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    grid.innerHTML = YatriiData.testimonials.map(t => `
      <div class="testimonial-card">
        <div>
          <div style="color: #fbbf24; margin-bottom: 0.65rem; font-size: 1.1rem;">
            ${'★'.repeat(t.rating)}
          </div>
          <p class="testimonial-text">"${t.comment}"</p>
        </div>
        <div class="testimonial-user">
          <img src="${t.avatar}" alt="${t.name}" class="user-avatar">
          <div>
            <div class="user-meta-name">${t.name}</div>
            <div class="user-meta-role">${t.role} • <span style="color: var(--brand-primary); font-weight: 700;">${t.tag}</span></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- Open Unified Checkout Modal ---
  function openCheckoutModal(type = 'ride') {
    state.activeCoupon = null;
    const modal = document.getElementById('checkout-modal');
    const previewBox = document.getElementById('checkout-item-preview');
    const titleEl = document.getElementById('checkout-modal-title');
    const couponInput = document.getElementById('checkout-coupon-input');
    const couponFeedback = document.getElementById('coupon-feedback');

    if (!modal || !previewBox) return;

    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.innerHTML = '';

    if (type === 'ride') {
      const vehicle = YatriiData.vehicles.find(v => v.id === state.selectedVehicleId) || YatriiData.vehicles[0];
      let baseFare = 0;

      if (vehicle.category === 'rentals') {
        baseFare = vehicle.dailyRate;
      } else if (vehicle.category === 'outstation') {
        baseFare = Math.round(vehicle.baseFare + (Math.max(80, state.distanceKm * 2) * vehicle.perKm));
      } else {
        baseFare = Math.round(Math.max(vehicle.minFare, vehicle.baseFare + (state.distanceKm * vehicle.perKm)));
      }

      state.currentCheckoutItem = {
        type: 'ride',
        vehicle: vehicle,
        baseFare: baseFare,
        pickup: state.pickup.name,
        drop: state.drop.name,
        distance: state.distanceKm,
        duration: state.durationMins
      };

      titleEl.innerHTML = `<i class="ri-taxi-fill text-warning"></i> Confirm Ride: ${vehicle.name}`;

      previewBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.6rem;">${vehicle.icon}</span>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem;">${vehicle.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${state.distanceKm} km • ~${state.durationMins} mins</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--brand-primary);">₹${baseFare.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.72rem; color: var(--color-success); font-weight: 700;">Zero Surge</div>
          </div>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
          <strong>Pickup:</strong> ${state.pickup.name}<br>
          <strong>Drop:</strong> ${state.drop.name}
        </div>
      `;
    } else {
      const hotel = state.selectedHotel || YatriiData.hotels[0];
      const room = state.selectedRoom || hotel.rooms[0];
      const baseFare = room.price;

      state.currentCheckoutItem = {
        type: 'hotel',
        hotel: hotel,
        room: room,
        baseFare: baseFare,
        city: hotel.city
      };

      titleEl.innerHTML = `<i class="ri-hotel-bed-fill text-warning"></i> Confirm Stay: ${hotel.name}`;

      previewBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${hotel.image}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover;">
            <div>
              <div style="font-weight: 800; font-size: 1.05rem;">${hotel.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${room.name} (${room.bed})</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--brand-primary);">₹${baseFare.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">per night</div>
          </div>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
          <strong>Location:</strong> ${hotel.location}, ${hotel.city}<br>
          <strong>Inclusions:</strong> ${hotel.amenities.slice(0, 3).join(', ')}
        </div>
      `;
    }

    updateCheckoutSummary();
    openModal('checkout-modal');
  }

  function updateCheckoutSummary() {
    if (!state.currentCheckoutItem) return;

    const baseFare = state.currentCheckoutItem.baseFare;
    const tax = Math.round(baseFare * 0.05);

    let addOns = 0;
    const chkInsurance = document.getElementById('chk-insurance');
    const chkCarbon = document.getElementById('chk-carbon');

    if (chkInsurance && chkInsurance.checked) addOns += 19;
    if (chkCarbon && chkCarbon.checked) addOns += 10;

    let discount = 0;
    if (state.activeCoupon) {
      if (state.activeCoupon.discountType === 'flat') {
        discount = state.activeCoupon.value;
      } else if (state.activeCoupon.discountType === 'percentage') {
        discount = Math.min(state.activeCoupon.maxDiscount || 9999, Math.round(baseFare * (state.activeCoupon.value / 100)));
      }
    }

    const total = Math.max(0, baseFare + tax + addOns - discount);

    document.getElementById('summary-base-fare').textContent = `₹${baseFare.toLocaleString('en-IN')}`;
    document.getElementById('summary-tax').textContent = `₹${(tax + addOns).toLocaleString('en-IN')} (Incl. GST & Addons)`;

    const discountRow = document.getElementById('summary-discount-row');
    const discountEl = document.getElementById('summary-discount');

    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-₹${discount.toLocaleString('en-IN')}`;
    } else {
      discountRow.style.display = 'none';
    }

    document.getElementById('summary-total-fare').textContent = `₹${total.toLocaleString('en-IN')}`;
    state.currentCheckoutItem.finalTotal = total;
  }

  // --- Validate Promo Coupon via Backend API ---
  async function applyCoupon() {
    const input = document.getElementById('checkout-coupon-input');
    const feedback = document.getElementById('coupon-feedback');
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      feedback.innerHTML = '<span style="color: var(--color-danger);">Please enter a coupon code.</span>';
      return;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          orderAmount: state.currentCheckoutItem.baseFare,
          category: state.currentCheckoutItem.type === 'ride' ? 'rides' : 'hotels'
        })
      });

      const json = await res.json();
      if (res.ok) {
        state.activeCoupon = json.data;
        feedback.innerHTML = `<span style="color: var(--color-success);"><i class="ri-check-line"></i> Coupon Applied: ${json.data.description}</span>`;
        showToast(`🎉 Coupon ${code} applied successfully!`, 'success');
        updateCheckoutSummary();
      } else {
        feedback.innerHTML = `<span style="color: var(--color-danger);">${json.error}</span>`;
      }
    } catch (e) {
      // Fallback
      const coupon = YatriiData.coupons.find(c => c.code === code);
      if (coupon) {
        state.activeCoupon = coupon;
        feedback.innerHTML = `<span style="color: var(--color-success);"><i class="ri-check-line"></i> Coupon Applied: ${coupon.description}</span>`;
        updateCheckoutSummary();
      }
    }
  }

  // --- Confirm Booking & Save to Backend API ---
  async function confirmBooking() {
    const nameInput = document.getElementById('passenger-name');
    const phoneInput = document.getElementById('passenger-phone');
    const emailInput = document.getElementById('passenger-email');

    const passengerName = nameInput ? nameInput.value.trim() : state.user.name;
    const passengerPhone = phoneInput ? phoneInput.value.trim() : state.user.phone;
    const passengerEmail = emailInput ? emailInput.value.trim() : state.user.email;

    const bookingPayload = {
      item: state.currentCheckoutItem,
      passenger: { name: passengerName, phone: passengerPhone, email: passengerEmail },
      paymentMethod: document.querySelector('.pay-option-card.selected')?.getAttribute('data-payment') || 'upi'
    };

    let newBooking = null;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (res.ok) {
        const json = await res.json();
        newBooking = json.data;
      }
    } catch (e) {
      console.warn('Backend offline, creating local booking:', e);
    }

    if (!newBooking) {
      const pnr = 'YTR-' + Math.floor(10000 + Math.random() * 90000);
      const otp = Math.floor(1000 + Math.random() * 9000);
      const now = new Date();
      const createdAt = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' +
                        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      newBooking = {
        pnr,
        otp,
        item: state.currentCheckoutItem,
        passenger: bookingPayload.passenger,
        createdAt,
        status: 'Confirmed'
      };
    }

    state.bookings.unshift(newBooking);
    localStorage.setItem('yatrii_bookings', JSON.stringify(state.bookings));
    updateBookingCountBadge();

    closeModal('checkout-modal');
    renderTicketPass(newBooking);
    openModal('ticket-modal');
    showToast('🎉 Booking Confirmed! Digital Boarding Pass Generated', 'success');
  }

  // --- Render Digital Boarding Pass Content ---
  function renderTicketPass(booking) {
    const item = booking.item;
    document.getElementById('ticket-pnr-val').textContent = booking.pnr;
    document.getElementById('ticket-passenger-name').textContent = booking.passenger.name;
    document.getElementById('ticket-datetime-val').textContent = booking.createdAt;
    document.getElementById('ticket-amount-val').textContent = `₹${item.finalTotal.toLocaleString('en-IN')}`;
    document.getElementById('ticket-otp-val').textContent = booking.otp;

    const serviceNameEl = document.getElementById('ticket-service-name');
    const fromCityEl = document.getElementById('ticket-from-city');
    const pickupLocEl = document.getElementById('ticket-pickup-loc');
    const toCityEl = document.getElementById('ticket-to-city');
    const dropLocEl = document.getElementById('ticket-drop-loc');

    if (item.type === 'ride') {
      serviceNameEl.textContent = item.vehicle.name;
      fromCityEl.textContent = 'PICKUP';
      pickupLocEl.textContent = item.pickup.split(',')[0];
      toCityEl.textContent = 'DROP';
      dropLocEl.textContent = item.drop.split(',')[0];
    } else {
      serviceNameEl.textContent = item.hotel.name;
      fromCityEl.textContent = item.hotel.city.toUpperCase();
      pickupLocEl.textContent = item.hotel.location;
      toCityEl.textContent = 'CHECKOUT';
      dropLocEl.textContent = item.room.name;
    }
  }

  // --- Live Ride Simulation Engine ---
  function startLiveRideSimulation() {
    closeModal('ticket-modal');
    openModal('tracker-modal');

    const statusText = document.getElementById('tracker-status-text');
    const etaVal = document.getElementById('tracker-eta-val');
    const stepMatched = document.getElementById('step-matched');
    const stepArriving = document.getElementById('step-arriving');
    const stepTransit = document.getElementById('step-transit');
    const stepCompleted = document.getElementById('step-completed');

    statusText.textContent = 'Driver Rajesh Kumar is arriving in Swift Dzire (DL 01 AB 4321)';
    etaVal.textContent = '3 mins';
    stepMatched.className = 'timeline-step completed';
    stepArriving.className = 'timeline-step active';
    stepTransit.className = 'timeline-step';
    stepCompleted.className = 'timeline-step';

    if (window.yatriiMap) {
      window.yatriiMap.startLiveTracking(
        [state.pickup.lat, state.pickup.lng],
        [state.drop.lat, state.drop.lng],
        '🚕',
        (progress, remainingMins) => {
          if (progress > 10 && progress < 80) {
            statusText.textContent = `Trip in Progress • Reached ${progress}% of route`;
            etaVal.textContent = `${remainingMins} mins`;
            stepArriving.className = 'timeline-step completed';
            stepTransit.className = 'timeline-step active';
          }
        },
        () => {
          statusText.textContent = '🎉 You have reached your destination!';
          etaVal.textContent = 'Arrived';
          stepTransit.className = 'timeline-step completed';
          stepCompleted.className = 'timeline-step completed';
          showToast('✅ Trip completed! Thank you for traveling with Yatrii.', 'success');
          // Open Review Modal after 1.5s
          setTimeout(() => {
            closeModal('tracker-modal');
            openModal('review-modal');
          }, 1500);
        }
      );
    }
  }

  // --- Two-Way Interactive Driver Chat Engine (UX Upgrade) ---
  function sendDriverChatMessage(text) {
    if (!text || !text.trim()) return;

    const container = document.getElementById('chat-messages-log');
    if (!container) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble user-msg';
    userMsg.innerHTML = `
      <span class="chat-sender">You</span>
      <p>${text}</p>
      <span class="chat-time">Just now</span>
    `;
    container.appendChild(userMsg);
    container.scrollTop = container.scrollHeight;

    const input = document.getElementById('chat-text-input');
    if (input) input.value = '';

    // Simulated Driver Contextual Response after 1.2s
    setTimeout(() => {
      let reply = 'Got it! I will be there in a moment.';
      const lower = text.toLowerCase();
      if (lower.includes('pillar') || lower.includes('gate') || lower.includes('waiting')) {
        reply = 'Understood! I have spotted your pickup point and turning into the lane now.';
      } else if (lower.includes('ac')) {
        reply = 'Sure! AC is turned on at full cooling for your comfort.';
      } else if (lower.includes('luggage') || lower.includes('bag')) {
        reply = 'No problem at all! The car boot is empty and ready for your bags.';
      } else if (lower.includes('where')) {
        reply = 'I am just crossing the roundabout ~500m from your spot.';
      }

      const driverMsg = document.createElement('div');
      driverMsg.className = 'chat-bubble driver-msg';
      driverMsg.innerHTML = `
        <span class="chat-sender">Rajesh Kumar</span>
        <p>${reply}</p>
        <span class="chat-time">Just now</span>
      `;
      container.appendChild(driverMsg);
      container.scrollTop = container.scrollHeight;
    }, 1200);
  }

  // --- My Bookings Drawer Controller & Cancellation ---
  function renderBookingsDrawer() {
    const listContainer = document.getElementById('drawer-bookings-list');
    if (!listContainer) return;

    if (state.bookings.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="ri-ticket-line" style="font-size: 3.5rem; margin-bottom: 0.5rem; display: block;"></i>
          <h4 style="color: var(--text-primary); margin-bottom: 0.35rem;">No Active Bookings</h4>
          <p style="font-size: 0.88rem;">Your confirmed ride passes and hotel reservations will appear here.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = state.bookings.map((b, idx) => `
      <div class="booking-item-card">
        <div class="booking-item-header">
          <span style="font-family: monospace; font-weight: 800; font-size: 0.95rem; color: var(--brand-primary);">${b.pnr}</span>
          <span class="booking-item-badge ${b.status === 'Cancelled' ? 'badge-cancelled' : 'badge-confirmed'}">${b.status}</span>
        </div>
        <div style="font-weight: 700; font-size: 1.05rem;">
          ${b.item.type === 'ride' ? b.item.vehicle.name : b.item.hotel.name}
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">
          ${b.item.type === 'ride' ? `${b.item.pickup.split(',')[0]} ➔ ${b.item.drop.split(',')[0]}` : `${b.item.hotel.location} • ${b.item.room.name}`}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">${b.createdAt}</span>
          <span style="font-weight: 800; color: var(--text-primary);">₹${b.item.finalTotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="nav-pill-btn btn-view-pass" data-booking-index="${idx}" style="flex: 1; background: var(--bg-tertiary); justify-content: center; font-size: 0.82rem; padding: 0.4rem;">
            <i class="ri-qr-code-line"></i> View Pass
          </button>
          ${b.status !== 'Cancelled' ? `
            <button class="btn-cancel-trip" data-pnr="${b.pnr}">
              <i class="ri-close-circle-line"></i> Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    listContainer.querySelectorAll('.btn-view-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-booking-index'));
        const booking = state.bookings[idx];
        closeDrawer();
        renderTicketPass(booking);
        openModal('ticket-modal');
      });
    });

    listContainer.querySelectorAll('.btn-cancel-trip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pnr = btn.getAttribute('data-pnr');
        if (confirm(`Are you sure you want to cancel booking ${pnr}? You will receive a 100% full refund.`)) {
          try {
            await fetch(`/api/bookings/${pnr}/cancel`, { method: 'PATCH' });
          } catch (e) {}

          const b = state.bookings.find(x => x.pnr === pnr);
          if (b) b.status = 'Cancelled';
          localStorage.setItem('yatrii_bookings', JSON.stringify(state.bookings));
          renderBookingsDrawer();
          showToast(`Booking ${pnr} cancelled. Refund credited!`, 'info');
        }
      });
    });
  }

  function updateBookingCountBadge() {
    const badge = document.getElementById('nav-booking-count');
    if (badge) badge.textContent = state.bookings.length;
  }

  function resetHotelFilters() {
    state.hotelFilters = {
      city: '',
      maxPrice: 15000,
      stars: 'all',
      amenities: [],
      sortBy: 'recommended'
    };

    const slider = document.getElementById('price-range-slider');
    const sliderDisplay = document.getElementById('slider-max-display');
    const cityInput = document.getElementById('hotel-city-input');
    const sortSelect = document.getElementById('hotel-sort-select');

    if (slider) slider.value = 15000;
    if (sliderDisplay) sliderDisplay.textContent = '₹15,000';
    if (cityInput) cityInput.value = '';
    if (sortSelect) sortSelect.value = 'recommended';

    document.querySelectorAll('.star-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.amenity-filter-cb').forEach(cb => cb.checked = false);

    renderHotels();
    showToast('Hotel filters reset', 'info');
  }

  // --- Autocomplete Engine ---
  function setupAutocomplete(inputId, dropdownId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (q.length < 2) {
        dropdown.classList.remove('open');
        return;
      }

      const matches = YatriiData.locations.filter(loc =>
        loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        dropdown.classList.remove('open');
        return;
      }

      dropdown.innerHTML = matches.map(loc => `
        <div class="suggestion-item" data-name="${loc.name}" data-lat="${loc.lat}" data-lng="${loc.lng}">
          <i class="ri-map-pin-2-fill suggestion-icon"></i>
          <div class="suggestion-info">
            <span class="suggestion-title">${loc.name}</span>
            <span class="suggestion-sub">${loc.city}, India</span>
          </div>
        </div>
      `).join('');

      dropdown.classList.add('open');

      dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const selectedLoc = {
            name: item.getAttribute('data-name'),
            lat: parseFloat(item.getAttribute('data-lat')),
            lng: parseFloat(item.getAttribute('data-lng'))
          };
          input.value = selectedLoc.name;
          dropdown.classList.remove('open');
          onSelect(selectedLoc);
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Theme Switcher
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

    // User Profile / Auth Modal
    document.getElementById('user-profile-btn')?.addEventListener('click', () => {
      openModal('auth-modal');
    });

    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('auth-name').value.trim();
      const phone = document.getElementById('auth-phone').value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone })
        });
        if (res.ok) {
          const json = await res.json();
          state.user = json.user;
        }
      } catch (err) {
        state.user.name = name || 'Traveler';
        state.user.phone = phone || '+91 98765 43210';
      }

      localStorage.setItem('yatrii_user', JSON.stringify(state.user));
      updateUserProfileUI();
      closeModal('auth-modal');
      showToast(`Welcome, ${state.user.name}! Profile synced.`, 'success');
    });

    // 1-Click "Use Current Location" (UX Upgrade)
    document.getElementById('btn-use-current-location')?.addEventListener('click', () => {
      if (navigator.geolocation) {
        showToast('🛰️ Detecting current GPS location...', 'info');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.pickup = {
              name: '📍 Your Current GPS Location',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            const pickupInput = document.getElementById('pickup-input');
            if (pickupInput) pickupInput.value = state.pickup.name;
            recalculateRouteAndFares();
            showToast('✅ GPS Location locked!', 'success');
          },
          (err) => {
            // Graceful fallback to city center
            state.pickup = YatriiData.locations[0];
            document.getElementById('pickup-input').value = state.pickup.name;
            recalculateRouteAndFares();
            showToast('📍 Set to Indira Gandhi International Airport (DEL)', 'info');
          },
          { timeout: 5000 }
        );
      }
    });

    // "⇄ Swap Locations" (UX Upgrade)
    document.getElementById('btn-swap-locations')?.addEventListener('click', () => {
      const temp = state.pickup;
      state.pickup = state.drop;
      state.drop = temp;

      const pickupInput = document.getElementById('pickup-input');
      const dropInput = document.getElementById('drop-input');

      if (pickupInput && dropInput) {
        pickupInput.value = state.pickup.name;
        dropInput.value = state.drop.name;
      }

      recalculateRouteAndFares();
      showToast('⇄ Pickup & destination swapped!', 'info');
    });

    // Mode Switchers
    document.querySelectorAll('[data-target-mode], [data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-target-mode') || btn.getAttribute('data-mode');
        switchMode(targetMode);
      });
    });

    function switchMode(targetMode) {
      state.mode = targetMode;

      document.querySelectorAll('[data-target-mode]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-target-mode') === targetMode);
      });

      document.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-mode') === targetMode);
      });

      const ridesPanel = document.getElementById('rides-search-panel');
      const hotelsPanel = document.getElementById('hotels-search-panel');
      const ridesSection = document.getElementById('section-rides');
      const hotelsSection = document.getElementById('section-hotels');

      if (targetMode === 'hotels') {
        if (ridesPanel) ridesPanel.style.display = 'none';
        if (hotelsPanel) hotelsPanel.style.display = 'block';
        if (hotelsSection) hotelsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        if (ridesPanel) ridesPanel.style.display = 'block';
        if (hotelsPanel) hotelsPanel.style.display = 'none';
        renderVehicleFleet();
        if (ridesSection) ridesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Autocomplete
    setupAutocomplete('pickup-input', 'pickup-dropdown', (loc) => {
      state.pickup = loc;
      recalculateRouteAndFares();
    });

    setupAutocomplete('drop-input', 'drop-dropdown', (loc) => {
      state.drop = loc;
      recalculateRouteAndFares();
    });

    // Quick Hotspot Shortcut Chips
    document.querySelectorAll('.shortcut-chip[data-pickup]').forEach(chip => {
      chip.addEventListener('click', () => {
        const pickupName = chip.getAttribute('data-pickup');
        const dropName = chip.getAttribute('data-drop');

        const pMatch = YatriiData.locations.find(l => l.name === pickupName);
        const dMatch = YatriiData.locations.find(l => l.name === dropName);

        if (pMatch) state.pickup = pMatch;
        if (dMatch) state.drop = dMatch;

        const pickupInput = document.getElementById('pickup-input');
        const dropInput = document.getElementById('drop-input');

        if (pickupInput) pickupInput.value = pickupName;
        if (dropInput) dropInput.value = dropName;

        recalculateRouteAndFares();
        showToast('📍 Route updated with hotspot locations!', 'info');
      });
    });

    document.querySelectorAll('.hotel-quick-city').forEach(chip => {
      chip.addEventListener('click', () => {
        const city = chip.getAttribute('data-city');
        const cityInput = document.getElementById('hotel-city-input');
        if (cityInput) cityInput.value = city;
        state.hotelFilters.city = city;
        renderHotels();
      });
    });

    document.getElementById('btn-estimate-rides')?.addEventListener('click', () => {
      recalculateRouteAndFares();
      document.getElementById('section-rides').scrollIntoView({ behavior: 'smooth' });
      showToast('⚡ Live fares and routes calculated!', 'success');
    });

    document.getElementById('btn-search-hotels')?.addEventListener('click', () => {
      const cityInput = document.getElementById('hotel-city-input');
      if (cityInput) state.hotelFilters.city = cityInput.value.trim();
      renderHotels();
      document.getElementById('section-hotels').scrollIntoView({ behavior: 'smooth' });
    });

    // Hotel Filters
    const priceSlider = document.getElementById('price-range-slider');
    const sliderDisplay = document.getElementById('slider-max-display');
    if (priceSlider) {
      priceSlider.addEventListener('input', () => {
        const val = parseInt(priceSlider.value);
        state.hotelFilters.maxPrice = val;
        if (sliderDisplay) sliderDisplay.textContent = `₹${val.toLocaleString('en-IN')}`;
        renderHotels();
      });
    }

    document.querySelectorAll('.star-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.star-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.hotelFilters.stars = btn.getAttribute('data-stars');
        renderHotels();
      });
    });

    document.querySelectorAll('.amenity-filter-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const selected = Array.from(document.querySelectorAll('.amenity-filter-cb:checked')).map(c => c.value);
        state.hotelFilters.amenities = selected;
        renderHotels();
      });
    });

    document.getElementById('hotel-sort-select')?.addEventListener('change', (e) => {
      state.hotelFilters.sortBy = e.target.value;
      renderHotels();
    });

    document.getElementById('btn-reset-hotel-filters')?.addEventListener('click', resetHotelFilters);

    // Book Ride CTA
    document.getElementById('btn-proceed-ride-booking')?.addEventListener('click', () => {
      openCheckoutModal('ride');
    });

    // Coupon Apply CTA
    document.getElementById('btn-apply-coupon')?.addEventListener('click', applyCoupon);

    // Payment Option Selectors
    document.querySelectorAll('.pay-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.pay-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    document.getElementById('chk-insurance')?.addEventListener('change', updateCheckoutSummary);
    document.getElementById('chk-carbon')?.addEventListener('change', updateCheckoutSummary);

    // Confirm Payment
    document.getElementById('btn-confirm-payment')?.addEventListener('click', confirmBooking);

    // Print Ticket
    document.getElementById('btn-print-ticket')?.addEventListener('click', () => {
      window.print();
    });

    // Start Live Ride Tracking Simulator
    document.getElementById('btn-start-tracking-ride')?.addEventListener('click', startLiveRideSimulation);

    // Complete Ride Simulator
    document.getElementById('btn-complete-trip-sim')?.addEventListener('click', () => {
      if (window.yatriiMap) window.yatriiMap.stopLiveTracking();
      const statusText = document.getElementById('tracker-status-text');
      const etaVal = document.getElementById('tracker-eta-val');
      const stepTransit = document.getElementById('step-transit');
      const stepCompleted = document.getElementById('step-completed');

      statusText.textContent = '🎉 You have reached your destination!';
      etaVal.textContent = 'Arrived';
      stepTransit.className = 'timeline-step completed';
      stepCompleted.className = 'timeline-step completed';
      showToast('✅ Ride successfully completed!', 'success');

      setTimeout(() => {
        closeModal('tracker-modal');
        openModal('review-modal');
      }, 1500);
    });

    // Driver Chat (UX Upgrade)
    document.getElementById('btn-chat-driver')?.addEventListener('click', () => {
      openModal('driver-chat-modal');
    });

    document.getElementById('btn-send-chat')?.addEventListener('click', () => {
      const input = document.getElementById('chat-text-input');
      if (input) sendDriverChatMessage(input.value);
    });

    document.getElementById('chat-text-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendDriverChatMessage(e.target.value);
      }
    });

    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const msg = chip.getAttribute('data-msg');
        sendDriverChatMessage(msg);
      });
    });

    document.getElementById('btn-call-driver')?.addEventListener('click', () => {
      showToast('📞 Calling Chauffeur Rajesh Kumar (+91 98112 34567)...', 'info');
    });

    // Review Submission (UX Upgrade)
    let selectedRating = 5;
    const starIcons = document.querySelectorAll('#review-star-group i');
    starIcons.forEach(icon => {
      icon.addEventListener('click', () => {
        selectedRating = parseInt(icon.getAttribute('data-val'));
        starIcons.forEach(s => {
          const val = parseInt(s.getAttribute('data-val'));
          s.classList.toggle('active-star', val <= selectedRating);
        });
      });
    });

    document.getElementById('btn-submit-review')?.addEventListener('click', async () => {
      const comment = document.getElementById('review-comment-input').value.trim();
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: state.user.name,
            rating: selectedRating,
            comment,
            category: 'ride'
          })
        });
      } catch (e) {}

      closeModal('review-modal');
      showToast('🌟 Thank you for rating your Yatrii experience!', 'success');
    });

    // FAQ Accordion (UX Upgrade)
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });

    // My Bookings Drawer
    document.getElementById('my-bookings-btn')?.addEventListener('click', () => {
      renderBookingsDrawer();
      openDrawer();
    });

    document.getElementById('btn-close-drawer')?.addEventListener('click', closeDrawer);

    // Emergency SOS Modal
    const sosOpenBtn = document.getElementById('sos-open-btn');
    const footerSosLink = document.getElementById('footer-sos-link');
    const trackerSosBtn = document.getElementById('tracker-sos-btn');

    [sosOpenBtn, footerSosLink, trackerSosBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: state.pickup.lat,
              lng: state.pickup.lng,
              vehicleNo: 'DL 01 AB 4321',
              driverName: 'Rajesh Kumar'
            })
          }).catch(() => {});

          openModal('sos-modal');
        });
      }
    });

    document.getElementById('btn-share-live-coords')?.addEventListener('click', () => {
      const text = `🚨 Yatrii Live Safety Alert: I am traveling in DL 01 AB 4321 with driver Rajesh Kumar. Current coordinates: 28.6139° N, 77.2090° E. Track live on Yatrii.`;
      if (navigator.share) {
        navigator.share({ title: 'Yatrii Emergency Location', text: text });
      } else {
        navigator.clipboard.writeText(text);
        showToast('Live tracking alert copied to clipboard!', 'success');
      }
    });

    // Close Modals
    document.getElementById('btn-close-checkout')?.addEventListener('click', () => closeModal('checkout-modal'));
    document.getElementById('btn-close-ticket')?.addEventListener('click', () => closeModal('ticket-modal'));
    document.getElementById('btn-close-tracker')?.addEventListener('click', () => closeModal('tracker-modal'));
    document.getElementById('btn-close-chat')?.addEventListener('click', () => closeModal('driver-chat-modal'));
    document.getElementById('btn-close-auth')?.addEventListener('click', () => closeModal('auth-modal'));
    document.getElementById('btn-close-review')?.addEventListener('click', () => closeModal('review-modal'));
    document.getElementById('btn-close-hotel-detail')?.addEventListener('click', () => closeModal('hotel-detail-modal'));
    document.getElementById('btn-close-sos')?.addEventListener('click', () => closeModal('sos-modal'));

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    const drawerOverlay = document.getElementById('bookings-drawer');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) closeDrawer();
      });
    }
  }

  // --- Modal & Drawer Helpers ---
  function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('open');
  }

  function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('open');
  }

  function openDrawer() {
    document.getElementById('bookings-drawer')?.classList.add('open');
  }

  function closeDrawer() {
    document.getElementById('bookings-drawer')?.classList.remove('open');
  }

  // --- Toast Notification Manager ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-pill';

    let iconClass = 'ri-information-fill toast-icon-info';
    if (type === 'success') iconClass = 'ri-checkbox-circle-fill toast-icon-success';
    if (type === 'error') iconClass = 'ri-error-warning-fill toast-icon-error';

    toast.innerHTML = `<i class="${iconClass}" style="font-size: 1.25rem;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Launch application
  initApp();
});
