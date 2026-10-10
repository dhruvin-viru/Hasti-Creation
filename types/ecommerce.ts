export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  createdAt?: string;
}

export interface ColorVariant {
  id: string;
  colorName: string;
  colorHex?: string;
  images: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  categoryName?: string;
  stock: number;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  gstRate?: number;
  isFeatured?: boolean;
  sizes?: string[];
  colorVariants?: ColorVariant[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
  selectedSize?: string;
  selectedColor?: string;
  hsn?: string;
  gstRate?: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderId?: string;
  userId?: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal?: number;
  discountApplied: number;
  couponCode?: string;
  shippingFee?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: 'prepaid' | 'cod';
  paymentStatus?: 'paid' | 'pending';
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  destinationCode?: string;
  returnCode?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  sellerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  gstin: string;
  returnCode: string;
  defaultHsn: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiryDate: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedImage?: string;
}

export interface CourierPartner {
  id: string;
  name: string;
  trackingUrlPattern?: string;
  active: boolean;
}

export interface StockNotification {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productSku?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: 'pending' | 'notified';
  createdAt: string;
}
