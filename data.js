/* ==================================================================
   YOUR BUDGET HOSPITALITY — site settings and listings
   ------------------------------------------------------------------
   This is the only file you need to edit to add a resort, villa or
   place. The home page, stays page, enquiry form and footer all read
   from here, so a new stay shows up everywhere automatically.

   ADD A STAY → copy one block inside STAYS and change the values:
     slug       unique, lowercase-with-hyphens (used in booking links)
     name       property name shown on the card
     type       'resort' or 'villa'
     place      must match a name in PLACES exactly
     area       locality / beach name (optional)
     price      number only, no ₹ or commas
                resort = per room per night
                villa  = whole villa per night
     guests     resort = max guests per room
                villa  = max guests in the whole villa
     rooms      resort = number of rooms
                villa  = number of bedrooms (shown as BHK)
                set 0 to hide it until you know the number
     roomTypes  optional room categories and prices, e.g.
                [{ name: 'Deluxe room', price: 4000 }]
                the card then shows "From <lowest price>"
     guestsText optional override, e.g. 'Sleeps 8-10'
     highlights up to 3 short points
     image      'images/your-photo.jpg'  (leave '' to show the
                built-in illustration until photos are ready)
     images     optional photo gallery, e.g.
                ['images/a.jpg', 'images/b.jpg']
                the first one is the card photo, the rest open in
                the gallery when a guest taps the photo
     featured   true = show on the home page

   ADD A PLACE → add a line to PLACES. The order here is the order
   places appear on the site. Places with no stays are hidden.

   ⚠ Every stay below is set to place: 'Alibag'. Correct any that
     are somewhere else, and fill in area, rooms and photos.
   ================================================================== */

const SITE = {
  name: 'Your Budget Hospitality',
  phoneDisplay: '+91 73856 03511',   // shown on the site
  phone: '+917385603511',            // used for tap-to-call
  whatsapp: '917385603511',          // country code + number, no + or spaces
  email: 'info@yourbudgethospitality.com',
  address: 'Alibag, Maharashtra',
  web3formsKey: 'YOUR_WEB3FORMS_ACCESS_KEY' // from web3forms.com
};

const PLACES = [
  { name: 'Alibag', blurb: 'Beach town across the harbour from Mumbai' },
  { name: 'Kashid', blurb: 'White-sand beach on the Murud coastal road' },
  { name: 'Murud',  blurb: 'Quiet coastal village near Janjira fort' },
  { name: 'Dapoli', blurb: 'Long, uncrowded beaches on the Ratnagiri coast' }
];

const STAYS = [
  {
    slug: 'moonland-resort',
    name: 'Moonland Resort',
    type: 'resort',
    place: 'Alibag',
    area: '',
    price: 4000,
    guests: 3,
    rooms: 12,
    roomTypes: [
      { name: 'Deluxe room', price: 4000 },
      { name: 'Private pool room', price: 5000 },
      { name: 'Family room', price: 6000 }
    ],
    highlights: [],
    image: '',
    featured: true
  },
  {
    slug: 'parshuram-wada',
    name: 'Parshuram Wada',
    type: 'resort',
    place: 'Alibag',
    area: '',
    price: 3500,
    guests: 3,
    rooms: 0,
    roomTypes: [
      { name: 'Deluxe room', price: 3500 },
      { name: 'Private pool room', price: 4500 },
      { name: 'Family room', price: 8000 }
    ],
    highlights: ['Swimming pool', 'Rooms with a private plunge pool', 'Family rooms'],
    image: '',
    images: [
      'images/parshuram-wada-01-pool-and-property.jpg',
      'images/parshuram-wada-02-pool-evening.jpg',
      'images/parshuram-wada-03-pool-night.jpg',
      'images/parshuram-wada-04-pool-daytime.jpg',
      'images/parshuram-wada-05-pool.jpg',
      'images/parshuram-wada-06-pool-from-balcony.jpg',
      'images/parshuram-wada-07-courtyard.jpg',
      'images/parshuram-wada-08-courtyard-evening.jpg',
      'images/parshuram-wada-09-entrance-sign.jpg',
      'images/parshuram-wada-10-room-entrances.jpg',
      'images/parshuram-wada-11-room-entrances-night.jpg',
      'images/parshuram-wada-12-corridor.jpg',
      'images/parshuram-wada-13-family-room.jpg',
      'images/parshuram-wada-14-family-room.jpg',
      'images/parshuram-wada-15-family-room.jpg',
      'images/parshuram-wada-16-deluxe-room.jpg',
      'images/parshuram-wada-17-deluxe-room.jpg',
      'images/parshuram-wada-18-room.jpg',
      'images/parshuram-wada-19-private-pool-room.jpg'
    ],
    featured: true
  },
  {
    slug: 'nirvana',
    name: 'Nirvana',
    type: 'resort',
    place: 'Alibag',
    area: '',
    price: 3000,
    guests: 3,
    rooms: 0,
    roomTypes: [
      { name: 'Deluxe room', price: 3000 }
    ],
    highlights: [],
    image: '',
    featured: true
  },
  {
    slug: 'vintage-villa',
    name: 'Vintage Villa',
    type: 'villa',
    place: 'Alibag',
    area: '',
    price: 20000,
    guests: 10,
    guestsText: 'Sleeps 8-10',
    rooms: 0,
    highlights: ['Private pool with waterfall', 'Garden lawn and gazebo', 'Indoor lounge and dining'],
    image: '',
    images: [
      'images/vintage-villa-01-pool-night.jpg',
      'images/vintage-villa-02-pool-sunset.jpg',
      'images/vintage-villa-03-garden-and-pool.jpg',
      'images/vintage-villa-04-villa-evening.jpg',
      'images/vintage-villa-05-villa-garden.jpg',
      'images/vintage-villa-06-villa-entrance.jpg',
      'images/vintage-villa-07-veranda.jpg',
      'images/vintage-villa-08-living-room.jpg',
      'images/vintage-villa-09-living-room-staircase.jpg',
      'images/vintage-villa-10-living-and-dining.jpg',
      'images/vintage-villa-11-seating-nook.jpg',
      'images/vintage-villa-12-dining-room.jpg',
      'images/vintage-villa-13-dining-area.jpg',
      'images/vintage-villa-14-bedroom.jpg',
      'images/vintage-villa-15-lounge-corner.jpg'
    ],
    featured: true
  },
  {
    slug: 'sunandha',
    name: 'Sunandha',
    type: 'villa',
    place: 'Alibag',
    area: '',
    price: 20000,
    guests: 10,
    guestsText: 'Sleeps 8-10',
    rooms: 0,
    highlights: ['Private pool', 'AC bedrooms', 'Garden and pool deck'],
    image: '',
    images: [
      'images/sunandha-1-pool.jpg',
      'images/sunandha-2-pool-aerial.jpg',
      'images/sunandha-3-living-room.jpg',
      'images/sunandha-4-bedroom.jpg',
      'images/sunandha-5-bedroom.jpg',
      'images/sunandha-6-bedroom.jpg'
    ],
    featured: true
  },
  {
    slug: '4-bhk-villa',
    name: '4 BHK Villa',
    type: 'villa',
    place: 'Alibag',
    area: '',
    price: 20000,
    guests: 10,
    guestsText: 'Sleeps 8-10',
    rooms: 4,
    highlights: [],
    image: '',
    featured: true
  }
];
