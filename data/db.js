/**
 * Yatrii - Persistent JSON Database Engine
 * Handles thread-safe reads and writes to local JSON storage files.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database File Paths
const FILES = {
  bookings: path.join(DATA_DIR, 'bookings.json'),
  users: path.join(DATA_DIR, 'users.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
  sos: path.join(DATA_DIR, 'sos_logs.json')
};

// Initial Seed Data
const INITIAL_DATA = {
  bookings: [
    {
      pnr: 'YTR-10824',
      otp: '7821',
      item: {
        type: 'ride',
        vehicle: {
          id: 'cab_prime',
          name: 'Yatrii Prime Sedan',
          icon: '🚘'
        },
        baseFare: 485,
        pickup: 'Indira Gandhi International Airport (DEL)',
        drop: 'Connaught Place Central Hub',
        distance: 18.4,
        duration: 32,
        finalTotal: 485
      },
      passenger: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com'
      },
      createdAt: '20 Aug, 10:15',
      status: 'Completed'
    }
  ],
  users: [
    {
      id: 'usr_001',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      walletBalance: 1500,
      savedPlaces: [
        { label: 'Home', address: 'Flat 402, Green Glen Heights, Bengaluru', icon: '🏠' },
        { label: 'Work', address: 'Embassy TechVillage, Outer Ring Road, Bengaluru', icon: '💼' },
        { label: 'Airport', address: 'Kempegowda International Airport (BLR)', icon: '✈️' }
      ]
    }
  ],
  reviews: [
    {
      id: 'rev_001',
      pnr: 'YTR-10824',
      userName: 'Rahul Sharma',
      rating: 5,
      comment: 'Super smooth ride from DEL airport. Car was immaculate with sanitizers and water bottle!',
      category: 'ride',
      createdAt: '20 Aug, 11:00'
    }
  ],
  sos: []
};

// Helper to read data safely
function readJSON(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper to write data safely
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Initialize files if not existing
Object.keys(FILES).forEach(key => {
  if (!fs.existsSync(FILES[key])) {
    writeJSON(FILES[key], INITIAL_DATA[key]);
  }
});

module.exports = {
  // Bookings Methods
  getBookings() {
    return readJSON(FILES.bookings, INITIAL_DATA.bookings);
  },
  getBookingByPNR(pnr) {
    const list = this.getBookings();
    return list.find(b => b.pnr === pnr);
  },
  addBooking(booking) {
    const list = this.getBookings();
    list.unshift(booking);
    writeJSON(FILES.bookings, list);
    return booking;
  },
  updateBookingStatus(pnr, status) {
    const list = this.getBookings();
    const item = list.find(b => b.pnr === pnr);
    if (item) {
      item.status = status;
      writeJSON(FILES.bookings, list);
      return item;
    }
    return null;
  },

  // Users Methods
  getUsers() {
    return readJSON(FILES.users, INITIAL_DATA.users);
  },
  getUserByPhone(phone) {
    const users = this.getUsers();
    return users.find(u => u.phone === phone);
  },
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    writeJSON(FILES.users, users);
    return user;
  },
  updateUserWallet(phone, newBalance) {
    const users = this.getUsers();
    const user = users.find(u => u.phone === phone);
    if (user) {
      user.walletBalance = newBalance;
      writeJSON(FILES.users, users);
      return user;
    }
    return null;
  },

  // Reviews Methods
  getReviews() {
    return readJSON(FILES.reviews, INITIAL_DATA.reviews);
  },
  addReview(review) {
    const list = this.getReviews();
    list.unshift(review);
    writeJSON(FILES.reviews, list);
    return review;
  },

  // SOS Emergency Logs Methods
  getSOSLogs() {
    return readJSON(FILES.sos, []);
  },
  addSOSLog(log) {
    const list = this.getSOSLogs();
    list.unshift(log);
    writeJSON(FILES.sos, list);
    return log;
  }
};
