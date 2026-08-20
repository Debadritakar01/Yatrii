/**
 * Yatrii - Express REST API Server & Web Server
 * Serves backend endpoints for Rides, Hotels, Bookings, Users, Reviews & SOS
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// --- MASTER DATA SEED (Imported for backend validation) ---
const VEHICLES = [
  { id: 'bike', name: 'Yatrii Moto', category: 'daily', type: 'bike', icon: '🛵', seats: 1, luggage: '1 Backpack', eta: '2 mins', baseFare: 25, perKm: 9, minFare: 35 },
  { id: 'auto', name: 'Yatrii Auto', category: 'daily', type: 'auto', icon: '🛺', seats: 3, luggage: '2 Bags', eta: '3 mins', baseFare: 35, perKm: 14, minFare: 50 },
  { id: 'cab_mini', name: 'Yatrii Mini', category: 'daily', type: 'cab', icon: '🚕', seats: 4, luggage: '2 Suitcases', eta: '4 mins', baseFare: 60, perKm: 18, minFare: 100 },
  { id: 'cab_prime', name: 'Yatrii Prime Sedan', category: 'daily', type: 'cab', icon: '🚘', seats: 4, luggage: '3 Suitcases', eta: '5 mins', baseFare: 90, perKm: 22, minFare: 150 },
  { id: 'cab_suv', name: 'Yatrii SUV XL', category: 'daily', type: 'cab', icon: '🚙', seats: 6, luggage: '4 Suitcases', eta: '6 mins', baseFare: 140, perKm: 28, minFare: 220 },
  { id: 'rental_selfdrive', name: 'Self-Drive Mahindra Thar 4x4', category: 'rentals', type: 'rental', icon: '🚗', seats: 4, dailyRate: 2800, hourlyRate: 250, baseFare: 2200, perKm: 0 },
  { id: 'rental_ev', name: 'Self-Drive Tata Nexon EV', category: 'rentals', type: 'rental', icon: '⚡', seats: 5, dailyRate: 2200, hourlyRate: 190, baseFare: 1800, perKm: 0 },
  { id: 'outstation_prime', name: 'Outstation Intercity Sedan', category: 'outstation', type: 'outstation', icon: '🛣️', seats: 4, baseFare: 1500, perKm: 14, minFare: 1500 },
  { id: 'outstation_suv', name: 'Outstation Innova Crysta', category: 'outstation', type: 'outstation', icon: '🏔️', seats: 7, baseFare: 2400, perKm: 20, minFare: 2400 }
];

const COUPONS = [
  { code: 'YATRIIFIRST', discountType: 'flat', value: 150, minOrder: 200, description: 'Flat ₹150 OFF on your first booking', applicableTo: 'all' },
  { code: 'SAFAR50', discountType: 'percentage', value: 20, maxDiscount: 300, minOrder: 150, description: '20% OFF up to ₹300 on Cabs & Autos', applicableTo: 'rides' },
  { code: 'LUXURY2026', discountType: 'flat', value: 1000, minOrder: 5000, description: 'Flat ₹1,000 OFF on 5-Star Stays', applicableTo: 'hotels' },
  { code: 'AUTO50', discountType: 'flat', value: 50, minOrder: 100, description: 'Flat ₹50 OFF on Yatrii Auto & Moto', applicableTo: 'rides' }
];

// Helper: Haversine distance calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(2, parseFloat((R * c).toFixed(1)));
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Yatrii Travel API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Get Vehicles Catalog
app.get('/api/vehicles', (req, res) => {
  const { category } = req.query;
  let result = VEHICLES;
  if (category) {
    result = result.filter(v => v.category === category);
  }
  res.json({ success: true, count: result.length, data: result });
});

// 3. Dynamic Ride Fare & Route Estimation
app.post('/api/fares/estimate', (req, res) => {
  const { pickupLat, pickupLng, dropLat, dropLng, mode = 'rides' } = req.body;

  if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
    return res.status(400).json({ success: false, error: 'Pickup and Drop GPS coordinates are required' });
  }

  const distanceKm = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  const durationMins = Math.max(8, Math.round((distanceKm / 32) * 60));

  let filteredVehicles = VEHICLES;
  if (mode === 'rentals') {
    filteredVehicles = filteredVehicles.filter(v => v.category === 'rentals');
  } else if (mode === 'outstation') {
    filteredVehicles = filteredVehicles.filter(v => v.category === 'outstation');
  } else {
    filteredVehicles = filteredVehicles.filter(v => v.category === 'daily');
  }

  const calculatedFleets = filteredVehicles.map(v => {
    let fare = 0;
    if (v.category === 'rentals') {
      fare = v.dailyRate;
    } else if (v.category === 'outstation') {
      fare = Math.round(v.baseFare + (Math.max(80, distanceKm * 2) * v.perKm));
    } else {
      fare = Math.round(Math.max(v.minFare, v.baseFare + (distanceKm * v.perKm)));
    }
    return {
      ...v,
      estimatedFare: fare,
      distanceKm,
      durationMins
    };
  });

  res.json({
    success: true,
    data: {
      distanceKm,
      durationMins,
      traffic: 'Moderate',
      vehicles: calculatedFleets
    }
  });
});

// 4. Validate Promo Coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, orderAmount, category = 'all' } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required' });
  }

  const coupon = COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon) {
    return res.status(404).json({ success: false, error: 'Invalid coupon code. Try YATRIIFIRST or SAFAR50.' });
  }

  if (coupon.applicableTo !== 'all' && coupon.applicableTo !== category) {
    return res.status(400).json({ success: false, error: `This coupon is only applicable on ${coupon.applicableTo}.` });
  }

  if (orderAmount && orderAmount < coupon.minOrder) {
    return res.status(400).json({ success: false, error: `Minimum order of ₹${coupon.minOrder} required for this coupon.` });
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.value;
  } else if (coupon.discountType === 'percentage') {
    discount = Math.min(coupon.maxDiscount || 9999, Math.round((orderAmount || 500) * (coupon.value / 100)));
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discount,
      description: coupon.description,
      discountType: coupon.discountType
    }
  });
});

// 5. Create New Booking (Rides / Stays)
app.post('/api/bookings', (req, res) => {
  const { item, passenger, paymentMethod = 'upi' } = req.body;

  if (!item || !passenger) {
    return res.status(400).json({ success: false, error: 'Incomplete booking payload' });
  }

  const pnr = 'YTR-' + Math.floor(10000 + Math.random() * 90000);
  const otp = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const createdAt = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' +
                    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const newBooking = {
    pnr,
    otp,
    item,
    passenger: {
      name: passenger.name || 'Rahul Sharma',
      phone: passenger.phone || '+91 98765 43210',
      email: passenger.email || 'guest@yatrii.com'
    },
    payment: {
      method: paymentMethod,
      status: 'Paid',
      transactionId: 'TXN_' + Date.now()
    },
    createdAt,
    status: 'Confirmed'
  };

  const saved = db.addBooking(newBooking);

  res.status(201).json({
    success: true,
    message: 'Booking successfully confirmed!',
    data: saved
  });
});

// 6. Get All Bookings
app.get('/api/bookings', (req, res) => {
  const bookings = db.getBookings();
  res.json({ success: true, count: bookings.length, data: bookings });
});

// 7. Get Single Booking by PNR
app.get('/api/bookings/:pnr', (req, res) => {
  const booking = db.getBookingByPNR(req.params.pnr);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
});

// 8. Cancel Booking
app.patch('/api/bookings/:pnr/cancel', (req, res) => {
  const updated = db.updateBookingStatus(req.params.pnr, 'Cancelled');
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }
  res.json({
    success: true,
    message: `Booking ${req.params.pnr} has been cancelled. 100% refund initiated to source account.`,
    data: updated
  });
});

// 9. Update Booking Status (e.g. In-Transit, Completed)
app.patch('/api/bookings/:pnr/status', (req, res) => {
  const { status } = req.body;
  const updated = db.updateBookingStatus(req.params.pnr, status || 'Completed');
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }
  res.json({ success: true, data: updated });
});

// 10. Submit Post-Trip / Hotel Review
app.post('/api/reviews', (req, res) => {
  const { pnr, userName, rating, comment, category = 'ride' } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ success: false, error: 'Rating and comment are required' });
  }

  const now = new Date();
  const createdAt = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  const newReview = {
    id: 'rev_' + Date.now(),
    pnr: pnr || 'YTR-GUEST',
    userName: userName || 'Yatrii Traveler',
    rating: parseInt(rating),
    comment,
    category,
    createdAt
  };

  const saved = db.addReview(newReview);
  res.status(201).json({ success: true, message: 'Thank you for your review!', data: saved });
});

// 11. Trigger Emergency SOS Alert
app.post('/api/sos', (req, res) => {
  const { lat, lng, vehicleNo, driverName, pnr } = req.body;

  const sosLog = {
    id: 'sos_' + Date.now(),
    pnr: pnr || 'ACTIVE_RIDE',
    telemetry: { lat: lat || 28.6139, lng: lng || 77.2090 },
    vehicle: vehicleNo || 'DL 01 AB 4321',
    driver: driverName || 'Rajesh Kumar',
    timestamp: new Date().toISOString(),
    status: 'Dispatched to 112 Control Room'
  };

  const saved = db.addSOSLog(sosLog);
  res.status(201).json({
    success: true,
    message: 'Emergency command dispatched! Live telemetry locked with nearest authorities.',
    data: saved
  });
});

// 12. User Authentication (Login / Signup)
app.post('/api/auth/login', (req, res) => {
  const { phone, name } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  let user = db.getUserByPhone(phone);
  if (!user) {
    // Create new user profile
    user = {
      id: 'usr_' + Date.now(),
      name: name || 'Traveler',
      phone,
      email: `${phone.replace(/\D/g, '')}@yatrii.com`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      walletBalance: 1500,
      savedPlaces: [
        { label: 'Home', address: 'Flat 402, Green Glen Heights, Bengaluru', icon: '🏠' },
        { label: 'Work', address: 'Embassy TechVillage, Outer Ring Road, Bengaluru', icon: '💼' }
      ]
    };
    db.addUser(user);
  }

  res.json({
    success: true,
    message: 'Authentication successful',
    user
  });
});

// Fallback Route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Yatrii Server running on http://localhost:${PORT}`);
});
