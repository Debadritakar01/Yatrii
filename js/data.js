/**
 * Yatrii - Master Data Store
 * Contains vehicle fleets, hotel listings, popular routes, coupon codes, and testimonials
 */

const YatriiData = {
  // Vehicle Categories for Rides & Rentals
  vehicles: [
    {
      id: 'bike',
      name: 'Yatrii Moto',
      category: 'daily',
      type: 'bike',
      icon: '🛵',
      tag: 'Fastest in Traffic',
      tagColor: 'green',
      seats: 1,
      luggage: '1 Backpack',
      eta: '2 mins away',
      baseFare: 25,
      perKm: 9,
      minFare: 35,
      description: 'Beat the rush hour with quick, pocket-friendly bike rides. Free sanitized helmet provided.',
      features: ['Helmet included', 'Solo commute', 'Lowest fare guarantee'],
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'auto',
      name: 'Yatrii Auto',
      category: 'daily',
      type: 'auto',
      icon: '🛺',
      tag: 'Most Popular',
      tagColor: 'amber',
      seats: 3,
      luggage: '2 Bags',
      eta: '3 mins away',
      baseFare: 35,
      perKm: 14,
      minFare: 50,
      description: 'Doorstep pickup with metered, transparent rates. No haggling, ever.',
      features: ['Doorstep pickup', 'Transparent meter', 'Up to 3 passengers'],
      image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'cab_mini',
      name: 'Yatrii Mini',
      category: 'daily',
      type: 'cab',
      icon: '🚕',
      tag: 'Pocket Friendly AC',
      tagColor: 'blue',
      seats: 4,
      luggage: '2 Suitcases',
      eta: '4 mins away',
      baseFare: 60,
      perKm: 18,
      minFare: 100,
      description: 'Affordable, compact AC hatchbacks (WagonR, Swift, Tiago) for smooth city transit.',
      features: ['Full AC comfort', 'Top rated drivers', 'Compact city travel'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'cab_prime',
      name: 'Yatrii Prime Sedan',
      category: 'daily',
      type: 'cab',
      icon: '🚘',
      tag: 'Executive Choice',
      tagColor: 'purple',
      seats: 4,
      luggage: '3 Suitcases',
      eta: '5 mins away',
      baseFare: 90,
      perKm: 22,
      minFare: 150,
      description: 'Spacious sedans (Dzire, Etios, Amaze) with extra legroom, complimentary WiFi & phone charger.',
      features: ['Extra legroom', 'Free In-car WiFi', 'Top-tier 4.8+ drivers', 'Quiet ride mode'],
      image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'cab_suv',
      name: 'Yatrii SUV XL',
      category: 'daily',
      type: 'cab',
      icon: '🚙',
      tag: 'Spacious 6 Seater',
      tagColor: 'orange',
      seats: 6,
      luggage: '4 Suitcases',
      eta: '6 mins away',
      baseFare: 140,
      perKm: 28,
      minFare: 220,
      description: 'Premium 6-7 seater SUVs (Innova Crysta, Ertiga, Carens) for family outings and airport luggage.',
      features: ['Seats 6+ comfortably', 'Large boot space', 'Highway ready', 'Dual AC vents'],
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'rental_selfdrive',
      name: 'Self-Drive Mahindra Thar 4x4',
      category: 'rentals',
      type: 'rental',
      icon: '🚗',
      tag: 'Adventure Self-Drive',
      tagColor: 'red',
      seats: 4,
      luggage: '3 Bags',
      eta: 'Instant Delivery',
      baseFare: 2200,
      perKm: 0,
      dailyRate: 2800,
      hourlyRate: 250,
      description: 'Rugged 4x4 off-roader with convertible top. Unlimited kms option with zero security deposit.',
      features: ['4x4 High/Low', 'Bluetooth Apple CarPlay', 'Zero Deposit', 'Roadside Assistance'],
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'rental_ev',
      name: 'Self-Drive Tata Nexon EV',
      category: 'rentals',
      type: 'rental',
      icon: '⚡',
      tag: 'Eco-Friendly Electric',
      tagColor: 'teal',
      seats: 5,
      luggage: '3 Suitcases',
      eta: 'Instant Delivery',
      baseFare: 1800,
      perKm: 0,
      dailyRate: 2200,
      hourlyRate: 190,
      description: 'Zero emission, smooth automatic electric SUV with 350km real range & free fast charging pass.',
      features: ['350km Range', 'Free Fast Charging', 'Sunroof & Cruise Control', 'Silent Cabin'],
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'outstation_prime',
      name: 'Outstation Intercity Sedan',
      category: 'outstation',
      type: 'outstation',
      icon: '🛣️',
      tag: 'Intercity Expert',
      tagColor: 'indigo',
      seats: 4,
      luggage: '3 Suitcases',
      eta: 'Pre-book anytime',
      baseFare: 1500,
      perKm: 14,
      minFare: 1500,
      description: 'One-way or Round-trip outstation highway journey with verified highway-trained chauffeurs.',
      features: ['Tolls & GST included', 'No return fare on one-way', '24/7 highway support', 'Night allowance included'],
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'outstation_suv',
      name: 'Outstation Innova Crysta',
      category: 'outstation',
      type: 'outstation',
      icon: '🏔️',
      tag: 'Hill & Highway King',
      tagColor: 'amber',
      seats: 7,
      luggage: '5 Suitcases',
      eta: 'Pre-book anytime',
      baseFare: 2400,
      perKm: 20,
      minFare: 2400,
      description: 'The gold standard for long family road trips, hill stations, and pilgrimage circuits.',
      features: ['Captain seats', 'Reclining rear seats', 'Roof carrier available', 'Driver meal included'],
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80'
    }
  ],

  // Curated Hotels & Stays
  hotels: [
    {
      id: 'hotel-1',
      name: 'The Grand Heritage Palace & Spa',
      city: 'Jaipur',
      state: 'Rajasthan',
      location: 'Civil Lines, Jaipur',
      type: 'Heritage Palace',
      stars: 5,
      rating: 4.9,
      reviewCount: 1420,
      pricePerNight: 8500,
      originalPrice: 12000,
      badge: 'Bestseller',
      badgeColor: 'amber',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Immerse in royal Rajputana splendor with courtyards, marble pavilions, peacocks, ayurvedic spa, and authentic royal dining.',
      amenities: ['Free High-Speed WiFi', 'Swimming Pool', 'Luxury Ayurvedic Spa', 'Breakfast Included', 'Free Valet Parking', 'Airport Shuttle', 'Bar & Lounge', 'Royal Cultural Evenings'],
      rooms: [
        { name: 'Royal Heritage Deluxe Room', price: 8500, size: '450 sq ft', bed: '1 King Bed', capacity: '2 Adults, 1 Child', features: ['Courtyard view', 'Marble bathtub', 'Free Breakfast'] },
        { name: 'Maharaja Luxury Suite', price: 14500, size: '850 sq ft', bed: '1 Royal Four-Poster King', capacity: '3 Adults', features: ['Private terrace', 'Butler service', 'Jacuzzi', 'All meals included'] }
      ]
    },
    {
      id: 'hotel-2',
      name: 'Azure Palms Beachfront Resort & Spa',
      city: 'Goa',
      state: 'Goa',
      location: 'Candolim Beach, North Goa',
      type: 'Beach Resort',
      stars: 5,
      rating: 4.8,
      reviewCount: 2310,
      pricePerNight: 6200,
      originalPrice: 8900,
      badge: 'Beachfront',
      badgeColor: 'teal',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Direct sea access, infinity pool overlooking Arabian waves, beach cabanas, live music shacks, and seafood grills.',
      amenities: ['Direct Beach Access', 'Infinity Pool', 'Free Breakfast', 'Free WiFi', 'Beach Shack Bar', 'Water Sports Desk', 'Couple Friendly', 'Pet Friendly'],
      rooms: [
        { name: 'Sea View Premium Cabana', price: 6200, size: '400 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Balcony with ocean view', 'Complimentary Cocktails', 'Free Breakfast'] },
        { name: 'Private Pool Beach Villa', price: 12800, size: '1000 sq ft', bed: '1 King + 1 Queen Bed', capacity: '4 Adults', features: ['Private Plunge Pool', 'Direct beach path', 'Floating breakfast'] }
      ]
    },
    {
      id: 'hotel-3',
      name: 'Pine Crest Mountain Retreat & Chalets',
      city: 'Manali',
      state: 'Himachal Pradesh',
      location: 'Old Manali, Manali',
      type: 'Mountain Chalet',
      stars: 4,
      rating: 4.7,
      reviewCount: 980,
      pricePerNight: 3900,
      originalPrice: 5500,
      badge: 'Snow View',
      badgeColor: 'blue',
      image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Nestled amidst cedar pine forests with 360-degree snow peak vistas, wooden fireplaces, hot cider, and apple orchards.',
      amenities: ['Panoramic Mountain Views', 'Fireplace in Room', 'Free WiFi', 'Heated Bedding', 'Bonfire Nights', 'Trek Guide Service', 'Cafe & Bakery'],
      rooms: [
        { name: 'Cedar Wood Deluxe Cottage', price: 3900, size: '360 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Valley balcony view', 'Electric blanket', 'Free breakfast'] },
        { name: 'Himalayan Penthouse Loft', price: 6900, size: '650 sq ft', bed: '2 Queen Beds', capacity: '4 Adults', features: ['Glass roof stargazing', 'Fireplace', 'Heated Jacuzzi'] }
      ]
    },
    {
      id: 'hotel-4',
      name: 'The Oberoi Skyline Executive Business Suites',
      city: 'Mumbai',
      state: 'Maharashtra',
      location: 'Bandra Kurla Complex (BKC), Mumbai',
      type: 'Business Luxury',
      stars: 5,
      rating: 4.9,
      reviewCount: 3100,
      pricePerNight: 9800,
      originalPrice: 14000,
      badge: 'Prime BKC',
      badgeColor: 'purple',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Ultra-modern executive suites located at the heart of Mumbai financial hub. Soundproof glass, rooftop skyline infinity lounge, and 24/7 business center.',
      amenities: ['Rooftop Skyline Bar', '24/7 Business Lounge', 'High-Speed Fiber WiFi', 'Airport Limousine Pickup', 'Fitness & Gym Center', 'Fine Dining Italian & Japanese'],
      rooms: [
        { name: 'Executive Club Room', price: 9800, size: '420 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Skyline view', 'Nespresso Machine', 'Lounge access with free drinks'] },
        { name: 'Presidential Business Suite', price: 18500, size: '900 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Meeting room setup', 'Panoramic BKC View', 'Chauffeur service included'] }
      ]
    },
    {
      id: 'hotel-5',
      name: 'Backwater Whispers Eco Luxury Villa',
      city: 'Kumarakom',
      state: 'Kerala',
      location: 'Vembanad Lake, Kumarakom',
      type: 'Eco Villa & Houseboat',
      stars: 5,
      rating: 4.9,
      reviewCount: 1150,
      pricePerNight: 7400,
      originalPrice: 10500,
      badge: 'Eco Retreat',
      badgeColor: 'green',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Private thatched-roof villas nestled over tranquil backwaters. Houseboat sunset cruises, organic spice garden dining, and traditional ayurveda treatments.',
      amenities: ['Backwater Lakefront', 'Private Houseboat Cruise', 'Ayurveda Wellness Center', 'Organic Dining', 'Free WiFi', 'Infinity Pool', 'Yoga Deck'],
      rooms: [
        { name: 'Lake Breeze Heritage Villa', price: 7400, size: '520 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Open-air rain shower', 'Lake patio', 'Sunset boat cruise voucher'] },
        { name: 'Floating Luxury Houseboat Suite', price: 13900, size: '700 sq ft', bed: '1 King Bed', capacity: '2 Adults, 2 Children', features: ['Private chef on board', 'Cruising backwaters', 'Traditional Kerala feast'] }
      ]
    },
    {
      id: 'hotel-6',
      name: 'The Silicon Central Tech Suites & Co-Living',
      city: 'Bengaluru',
      state: 'Karnataka',
      location: 'Indiranagar / Koramangala, Bengaluru',
      type: 'Boutique Hotel',
      stars: 4,
      rating: 4.6,
      reviewCount: 1870,
      pricePerNight: 2900,
      originalPrice: 4200,
      badge: 'Super Value',
      badgeColor: 'blue',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Vibrant boutique hotel with fast 500 Mbps mesh WiFi, ergonomic work desks, specialty artisan coffee bar, and easy metro access.',
      amenities: ['500 Mbps Mesh WiFi', 'Ergonomic Herman Miller Desks', 'Artisan Coffee Roastery', 'Free Breakfast', 'Smart TV with OTT', 'Near Metro Station'],
      rooms: [
        { name: 'Urban Studio Pod', price: 2900, size: '280 sq ft', bed: '1 Queen Bed', capacity: '1-2 Adults', features: ['Work desk', 'Smart lighting', 'Complimentary Cold Brew'] },
        { name: 'Executive Terrace Room', price: 4400, size: '420 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Private balcony', 'Coffee machine', 'Free laundry service'] }
      ]
    },
    {
      id: 'hotel-7',
      name: 'Lake Pichola Royal Haveli & Sanctuary',
      city: 'Udaipur',
      state: 'Rajasthan',
      location: 'Lal Ghat, Lake Pichola, Udaipur',
      type: 'Heritage Haveli',
      stars: 5,
      rating: 4.9,
      reviewCount: 2600,
      pricePerNight: 7900,
      originalPrice: 11000,
      badge: 'Lake View',
      badgeColor: 'amber',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80'
      ],
      description: '300-year-old restored lakeside Haveli with hand-painted jharokhas, candlelit rooftop dinners, and panoramic views of City Palace and Jag Mandir.',
      amenities: ['Direct Lake Pichola View', 'Rooftop Candlelight Dining', 'Boat Transfer Included', 'Free WiFi', 'Heritage Jharokha Seating', 'Live Sitar Music'],
      rooms: [
        { name: 'Heritage Jharokha Room', price: 7900, size: '400 sq ft', bed: '1 Royal King', capacity: '2 Adults', features: ['Unobstructed lake view', 'Hand-painted murals', 'Free Breakfast'] },
        { name: 'Mewar Royal Suite', price: 15200, size: '820 sq ft', bed: '1 King Bed', capacity: '3 Adults', features: ['Private royal terrace', 'Champagne welcome', 'Private boat tour'] }
      ]
    },
    {
      id: 'hotel-8',
      name: 'The Imperial Heights & Capital Diplomatic Stay',
      city: 'New Delhi',
      state: 'Delhi NCR',
      location: 'Connaught Place / Janpath, New Delhi',
      type: 'Luxury Classic',
      stars: 5,
      rating: 4.8,
      reviewCount: 3890,
      pricePerNight: 6900,
      originalPrice: 9500,
      badge: 'Heart of Capital',
      badgeColor: 'indigo',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Colonial heritage elegance meeting 21st century tech luxury. Located walking distance from Connaught Place, India Gate, and central museums.',
      amenities: ['Central City Hub', 'Outdoor Temperature-Controlled Pool', 'Award-Winning Spa', 'Multi-Cuisine 24/7 Cafe', 'Free Valet Parking', 'Airport Express Service'],
      rooms: [
        { name: 'Grand Heritage Room', price: 6900, size: '390 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['High ceilings', 'Italian marble bath', 'Free Breakfast Buffet'] },
        { name: 'Diplomatic Imperial Suite', price: 13500, size: '750 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Private study desk', 'Complimentary high tea', 'Late checkout'] }
      ]
    },
    {
      id: 'hotel-9',
      name: 'Saffron Dunes Desert Camp & Retreat',
      city: 'Jaisalmer',
      state: 'Rajasthan',
      location: 'Sam Sand Dunes, Jaisalmer',
      type: 'Desert Camp',
      stars: 4,
      rating: 4.7,
      reviewCount: 860,
      pricePerNight: 4600,
      originalPrice: 6500,
      badge: 'Desert Escape',
      badgeColor: 'amber',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80'],
      description: 'A peaceful desert camp with camel safaris, folk performances, open-air dinners, and golden sunset views over the dunes.',
      amenities: ['Camel Safari', 'Cultural Performances', 'Desert Sunset Views', 'Breakfast Included', 'Free Parking'],
      rooms: [
        { name: 'Luxury Swiss Tent', price: 4600, size: '360 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Private washroom', 'Dune view', 'Folk dinner included'] },
        { name: 'Royal Family Tent', price: 7200, size: '600 sq ft', bed: '1 King + 2 Single Beds', capacity: '4 Adults', features: ['Private deck', 'Jeep safari', 'All meals included'] }
      ]
    },
    {
      id: 'hotel-10',
      name: 'Misty Peaks Riverside Lodge',
      city: 'Rishikesh',
      state: 'Uttarakhand',
      location: 'Tapovan, Rishikesh',
      type: 'Riverside Lodge',
      stars: 4,
      rating: 4.6,
      reviewCount: 1240,
      pricePerNight: 3200,
      originalPrice: 4700,
      badge: 'Riverfront',
      badgeColor: 'teal',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80'],
      description: 'A calm riverside base for yoga, rafting, and mountain walks, with bright rooms and a quiet garden for slow mornings.',
      amenities: ['River Access', 'Yoga Deck', 'Rafting Desk', 'Free WiFi', 'Vegetarian Cafe'],
      rooms: [
        { name: 'Garden View Room', price: 3200, size: '300 sq ft', bed: '1 Queen Bed', capacity: '2 Adults', features: ['Garden balcony', 'Yoga mat', 'Breakfast included'] },
        { name: 'Riverside Family Suite', price: 5400, size: '520 sq ft', bed: '1 King + 1 Sofa Bed', capacity: '4 Adults', features: ['River balcony', 'Living area', 'Rafting transfer'] }
      ]
    },
    {
      id: 'hotel-11',
      name: 'Coral Bay Island Hotel & Marina',
      city: 'Port Blair',
      state: 'Andaman and Nicobar Islands',
      location: 'Marine Hill, Port Blair',
      type: 'Island Hotel',
      stars: 5,
      rating: 4.8,
      reviewCount: 740,
      pricePerNight: 8800,
      originalPrice: 12500,
      badge: 'Island Favourite',
      badgeColor: 'blue',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=80'],
      description: 'A polished island stay with marina views, reef excursions, tropical gardens, and easy transfers to Andaman beaches.',
      amenities: ['Marina View', 'Island Excursions', 'Infinity Pool', 'Breakfast Included', 'Airport Transfer'],
      rooms: [
        { name: 'Tropical Marina Room', price: 8800, size: '430 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Marina balcony', 'Snorkel kit', 'Breakfast included'] },
        { name: 'Coral Bay Pool Villa', price: 14800, size: '820 sq ft', bed: '1 King Bed', capacity: '2 Adults, 1 Child', features: ['Private pool', 'Butler service', 'Sunset cruise'] }
      ]
    },
    {
      id: 'hotel-12',
      name: 'The Tea Garden Manor',
      city: 'Darjeeling',
      state: 'West Bengal',
      location: 'Chowrasta, Darjeeling',
      type: 'Colonial Mountain Manor',
      stars: 4,
      rating: 4.7,
      reviewCount: 530,
      pricePerNight: 5100,
      originalPrice: 7300,
      badge: 'Kanchenjunga View',
      badgeColor: 'green',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'],
      description: 'A warm colonial manor surrounded by tea gardens, serving local mountain cuisine with sunrise views of Kanchenjunga.',
      amenities: ['Mountain View', 'Tea Garden Walks', 'Fireplace Lounge', 'Breakfast Included', 'Library'],
      rooms: [
        { name: 'Tea Garden Deluxe Room', price: 5100, size: '340 sq ft', bed: '1 King Bed', capacity: '2 Adults', features: ['Tea garden view', 'Fireplace access', 'Local breakfast'] },
        { name: 'Kanchenjunga View Suite', price: 8400, size: '580 sq ft', bed: '1 King Bed', capacity: '3 Adults', features: ['Private veranda', 'Sunrise tea service', 'Living room'] }
      ]
    }
  ],

  // Popular Predefined Locations for quick Autocomplete & Route coordinates
  locations: [
    { name: 'Indira Gandhi International Airport (DEL)', city: 'Delhi', lat: 28.5562, lng: 77.1000, type: 'airport' },
    { name: 'Connaught Place Central Hub', city: 'Delhi', lat: 28.6315, lng: 77.2167, type: 'landmark' },
    { name: 'Cyber City DLF Phase 2', city: 'Gurugram', lat: 28.4950, lng: 77.0890, type: 'business' },
    { name: 'Noida Sector 62 IT Park', city: 'Noida', lat: 28.6280, lng: 77.3670, type: 'business' },
    { name: 'Chhatrapati Shivaji Maharaj Airport (BOM)', city: 'Mumbai', lat: 19.0896, lng: 72.8656, type: 'airport' },
    { name: 'Marine Drive & Nariman Point', city: 'Mumbai', lat: 18.9438, lng: 72.8232, type: 'landmark' },
    { name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', lat: 19.0664, lng: 72.8688, type: 'business' },
    { name: 'Kempegowda International Airport (BLR)', city: 'Bengaluru', lat: 13.1986, lng: 77.7066, type: 'airport' },
    { name: 'MG Road & Church Street', city: 'Bengaluru', lat: 12.9756, lng: 77.6066, type: 'landmark' },
    { name: 'Electronic City Phase 1', city: 'Bengaluru', lat: 12.8399, lng: 77.6770, type: 'business' },
    { name: 'Baga Beach & Tito\'s Lane', city: 'Goa', lat: 15.5553, lng: 73.7517, type: 'landmark' },
    { name: 'Manali Mall Road & Hidimba Temple', city: 'Manali', lat: 32.2396, lng: 77.1887, type: 'landmark' },
    { name: 'Hawa Mahal & Old Pink City', city: 'Jaipur', lat: 26.9239, lng: 75.8267, type: 'landmark' }
  ],

  // Active Promo Coupon Codes
  coupons: [
    {
      code: 'YATRIIFIRST',
      discountType: 'flat',
      value: 150,
      minOrder: 200,
      description: 'Flat ₹150 OFF on your first ride or stay booking',
      applicableTo: 'all'
    },
    {
      code: 'SAFAR50',
      discountType: 'percentage',
      value: 20,
      maxDiscount: 300,
      minOrder: 150,
      description: 'Get 20% OFF up to ₹300 on any Cab or Auto ride',
      applicableTo: 'rides'
    },
    {
      code: 'LUXURY2026',
      discountType: 'flat',
      value: 1000,
      minOrder: 5000,
      description: 'Flat ₹1,000 OFF on premium 5-Star Hotel bookings',
      applicableTo: 'hotels'
    },
    {
      code: 'AUTO50',
      discountType: 'flat',
      value: 50,
      minOrder: 100,
      description: 'Flat ₹50 OFF on Yatrii Auto & Moto rides',
      applicableTo: 'rides'
    }
  ],

  // Trust Statistics & Badges
  stats: [
    { number: '10M+', label: 'Happy Journeys' },
    { number: '4.9★', label: 'Average Rating' },
    { number: '50,000+', label: 'Verified Drivers & Hotels' },
    { number: '120+', label: 'Cities Covered' }
  ],

  // Real Customer Reviews
  testimonials: [
    {
      name: 'Aarav Sharma',
      role: 'Tech Consultant, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Yatrii is a game changer! Booked an early morning airport cab in Bengaluru and our Candolim beachfront villa in Goa in one seamless app. Clean cars, polite drivers!',
      tag: 'Verified Yatrii'
    },
    {
      name: 'Priya Mehra',
      role: 'Travel Creator, Delhi',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'The instant ticket pass with the digital QR code and transparent pricing is phenomenal. No hidden charges or cancellation stress.',
      tag: 'Frequent Flyer'
    },
    {
      name: 'Vikramaditya Roy',
      role: 'Founder, Mumbai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Used the self-drive Mahindra Thar for a road trip to Spiti and Manali. The vehicle was spotless and support was 24/7 active throughout our trip.',
      tag: 'Roadtripper'
    }
  ]
};

// Export to window
window.YatriiData = YatriiData;
