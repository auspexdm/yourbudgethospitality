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
     highlights up to 3 short points
     image      'images/your-photo.jpg'  (leave '' to show the
                built-in illustration until photos are ready)
     featured   true = show on the home page

   ADD A PLACE → add a line to PLACES. The order here is the order
   places appear on the site. Places with no stays are hidden.

   ⚠ Everything below is SAMPLE content. Replace with real details.
   ================================================================== */

const SITE = {
  name: 'Your Budget Hospitality',
  phoneDisplay: '+91 00000 00000',   // shown on the site
  phone: '+910000000000',            // used for tap-to-call
  whatsapp: '910000000000',          // country code + number, no + or spaces
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
    slug: 'sea-breeze-resort',
    name: 'Sea Breeze Resort',
    type: 'resort',
    place: 'Alibag',
    area: 'Nagaon',
    price: 2499,
    guests: 3,
    rooms: 12,
    highlights: ['Swimming pool', 'Breakfast included', 'Walk to the beach'],
    image: '',
    featured: true
  },
  {
    slug: 'coconut-grove-villa',
    name: 'Coconut Grove Villa',
    type: 'villa',
    place: 'Alibag',
    area: 'Kihim',
    price: 6999,
    guests: 10,
    rooms: 3,
    highlights: ['Private pool', 'Kitchen access', 'Garden lawn'],
    image: '',
    featured: true
  },
  {
    slug: 'kashid-sands-resort',
    name: 'Kashid Sands Resort',
    type: 'resort',
    place: 'Kashid',
    area: '',
    price: 2999,
    guests: 3,
    rooms: 10,
    highlights: ['Beach access', 'In-house restaurant', 'Parking'],
    image: '',
    featured: false
  },
  {
    slug: 'palm-shade-villa',
    name: 'Palm Shade Villa',
    type: 'villa',
    place: 'Kashid',
    area: '',
    price: 5499,
    guests: 8,
    rooms: 2,
    highlights: ['Private lawn', 'BBQ area', 'Pet friendly'],
    image: '',
    featured: true
  },
  {
    slug: 'fort-view-resort',
    name: 'Fort View Resort',
    type: 'resort',
    place: 'Murud',
    area: '',
    price: 2199,
    guests: 3,
    rooms: 8,
    highlights: ['Sea-view rooms', 'Konkan thali', 'Parking'],
    image: '',
    featured: false
  },
  {
    slug: 'mango-orchard-villa',
    name: 'Mango Orchard Villa',
    type: 'villa',
    place: 'Murud',
    area: '',
    price: 4499,
    guests: 8,
    rooms: 2,
    highlights: ['Orchard setting', 'Caretaker on site', 'Home-cooked meals'],
    image: '',
    featured: false
  },
  {
    slug: 'red-earth-resort',
    name: 'Red Earth Resort',
    type: 'resort',
    place: 'Dapoli',
    area: 'Karde',
    price: 1999,
    guests: 4,
    rooms: 9,
    highlights: ['Family rooms', 'Near Karde beach', 'Breakfast included'],
    image: '',
    featured: false
  },
  {
    slug: 'hilltop-villa-dapoli',
    name: 'Hilltop Villa',
    type: 'villa',
    place: 'Dapoli',
    area: '',
    price: 3999,
    guests: 6,
    rooms: 2,
    highlights: ['Valley view', 'Terrace seating', 'Parking'],
    image: '',
    featured: false
  }
];
