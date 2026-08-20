# Yatrii - Travel Booking Platform

Yatrii is an all-in-one travel booking platform for rides, car rentals, outstation journeys, and hotels. It provides a modern yellow-and-white interface for comparing fares, searching stays, managing bookings, and accessing travel safety tools. 🚕 🏨 ✈️

## ✨ Features

- 🛵 Book city rides including bikes, autos, sedans, and SUVs.
- 💰 Compare estimated fares, distance, duration, and vehicle availability.
- 🏨 Search and filter hotels by city, price, rating, and amenities.
- 🛏️ View hotel details, rooms, photos, facilities, and pricing.
- 🚗 Book self-drive rentals and outstation vehicles.
- 🎟️ Apply travel coupons during checkout.
- 🎫 Generate digital booking passes with booking IDs and OTPs.
- 📋 View, cancel, and track bookings.
- 🆘 Use emergency SOS and live ride tracking tools.
- 🌙 Switch between light mode and yellow-accented night mode.

## 🧰 Technology Stack

- 🧱 HTML for page structure
- 🎨 CSS for responsive styling and themes
- ⚙️ JavaScript for frontend interactions and application logic
- ⚛️ React for the theme toggle component
- 🟢 Node.js and Express for the REST API backend
- 🗃️ JSON files for local application data
- 🗺️ Leaflet for interactive maps

## 🚀 Getting Started

### 📋 Requirements

- Node.js installed on your computer
- npm installed with Node.js

### 📦 Installation

```bash
npm install
```

### ▶️ Run the application

```bash
npm start
```

Open `http://localhost:3000` in your browser. 🌐

## 📁 Project Structure

```text
Yatrii/
├── index.html          # Main frontend page
├── server.js           # Express server and REST API routes
├── package.json        # Project scripts and dependencies
├── css/style.css       # Application styling and themes
├── js/app.js           # Main frontend application logic
├── js/data.js          # Vehicles, hotels, coupons, and reviews
├── js/map.js           # Leaflet map and live tracking logic
├── js/react-app.js     # React theme toggle component
└── data/               # Local JSON data and database helpers
```

## 🔌 API Examples

The Express backend provides endpoints for:

- `GET /api/health`
- `GET /api/vehicles`
- `POST /api/fares/estimate`
- `POST /api/coupons/validate`
- `GET /api/bookings`
- `POST /api/bookings`
- Booking cancellation and status updates
- Reviews, authentication, and SOS requests

## 📝 Notes

This project is a local travel-booking demonstration. Payment, maps, notifications, and driver tracking use simulated or development data and should be connected to production services before deployment. 🚧

## 👨‍💻 Author

Created by [Debadritakar01](https://github.com/Debadritakar01).