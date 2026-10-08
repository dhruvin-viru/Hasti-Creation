import { Category, Product, Banner, Coupon } from '@/types/ecommerce';

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'High fidelity audio, smart gadgets & premium accessories.'
  },
  {
    id: 'wearables',
    name: 'Smart Wearables',
    slug: 'wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'Next-gen smartwatches, fitness bands and health trackers.'
  },
  {
    id: 'footwear',
    name: 'Sneakers & Shoes',
    slug: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    description: 'Ergonomic performance sneakers and athletic footwear.'
  },
  {
    id: 'bags',
    name: 'Travel & Backpacks',
    slug: 'bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    description: 'Weatherproof tech backpacks and urban travel gear.'
  }
];

export const SAMPLE_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Aura Studio Pro Wireless',
    subtitle: 'Active Noise Cancellation with 40h Battery Life',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products/p1',
    active: true,
    tag: 'NEW LAUNCH'
  },
  {
    id: 'b2',
    title: 'Ultra Fit Pro Smartwatch',
    subtitle: 'AMOLED Display & Precision GPS Tracking',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products/p2',
    active: true,
    tag: '20% OFF TODAY'
  },
  {
    id: 'b3',
    title: 'Minimalist Stealth Travel Pack',
    subtitle: 'Waterproof Cordura Fabric with Secret RFID Pocket',
    imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/products/p3',
    active: true,
    tag: 'LIMITED EDITION'
  }
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Aura Studio Pro Wireless Headphones',
    slug: 'aura-studio-pro-wireless',
    price: 249.99,
    discountPrice: 199.99,
    categoryId: 'electronics',
    categoryName: 'Electronics & Audio',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Immerse yourself in rich, high-resolution audio with active noise cancellation, custom 40mm drivers, and ultra-soft memory foam earcups designed for all-day acoustic comfort.',
    features: [
      'Active Noise Cancellation (ANC)',
      '40-hour continuous playback',
      'Bluetooth 5.3 low latency',
      'Quick Charge: 10 mins = 4 hours playback'
    ],
    rating: 4.8,
    reviewCount: 42,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    title: 'Vanguard UltraFit GPS Smartwatch',
    slug: 'vanguard-ultrafit-gps-smartwatch',
    price: 189.99,
    discountPrice: 159.99,
    categoryId: 'wearables',
    categoryName: 'Smart Wearables',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Track your health, cardio, and outdoor workouts with pinpoint precision. Features a crystal-clear 1.4-inch AMOLED display and 50m water resistance rating.',
    features: [
      '1.4" Always-On AMOLED Display',
      'Dual-Band Multi-Satellite GPS',
      'Continuous SpO2 & Heart Rate Monitoring',
      '5 ATM Water Resistance'
    ],
    rating: 4.9,
    reviewCount: 89,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    title: 'Nomad Cordura Tech Backpack 28L',
    slug: 'nomad-cordura-tech-backpack-28l',
    price: 139.99,
    discountPrice: 119.99,
    categoryId: 'bags',
    categoryName: 'Travel & Backpacks',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Designed for modern digital nomads. Features an padded 16-inch laptop sleeve, waterproof YKK zippers, hidden passport pocket, and luggage pass-through strap.',
    features: [
      '1000D Waterproof Cordura Fabric',
      'Padded 16" MacBook Pro Sleeve',
      'Antitheft Hidden Pocket',
      'Ergonomic EVA Foam Shoulder Straps'
    ],
    rating: 4.7,
    reviewCount: 31,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    title: 'Velocity Apex Air Running Shoes',
    slug: 'velocity-apex-air-running-shoes',
    price: 169.99,
    discountPrice: 139.99,
    categoryId: 'footwear',
    categoryName: 'Sneakers & Shoes',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Lightweight carbon-plate infused running shoes engineered to maximize energy return and support smooth heel-to-toe strides on road or track.',
    features: [
      'Full-Length Carbon Fiber Plate',
      'Supercritical Nitrogen-infused Foam',
      'Breathable Jacquard Mesh Upper',
      'Durable Rubber Outsole Tread'
    ],
    rating: 4.6,
    reviewCount: 64,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p5',
    title: 'SonicBlast Portable Bluetooth Speaker',
    slug: 'sonicblast-portable-bluetooth-speaker',
    price: 99.99,
    discountPrice: 79.99,
    categoryId: 'electronics',
    categoryName: 'Electronics & Audio',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800'
    ],
    description: '360-degree room-filling sound with deep bass and IPX7 waterproof housing. Perfect for outdoor pool parties, camping, and home audio.',
    features: [
      '360° Surround Sound System',
      'IPX7 Fully Waterproof',
      '24-Hour Battery Life',
      'Built-in Powerbank'
    ],
    rating: 4.5,
    reviewCount: 27,
    isFeatured: false,
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'WELCOME10',
    discountType: 'percent',
    value: 10,
    minOrderAmount: 50,
    maxUses: 500,
    usedCount: 42,
    active: true,
    expiryDate: '2027-12-31'
  },
  {
    id: 'c2',
    code: 'FLAT25',
    discountType: 'flat',
    value: 25,
    minOrderAmount: 150,
    maxUses: 100,
    usedCount: 15,
    active: true,
    expiryDate: '2027-12-31'
  },
  {
    id: 'c3',
    code: 'MEGA20',
    discountType: 'percent',
    value: 20,
    minOrderAmount: 200,
    maxUses: 50,
    usedCount: 10,
    active: true,
    expiryDate: '2027-12-31'
  }
];
