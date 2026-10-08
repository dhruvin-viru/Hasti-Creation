import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Product, Category, Review, Order, Coupon, Banner, OrderStatus, StoreSettings, CustomerDetails } from '@/types/ecommerce';
import toast from 'react-hot-toast';

function handleFirestorePermissionError(error: any, actionName: string) {
  console.error(`Firestore ${actionName} error:`, error);
  if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
    toast.error('Firestore Permission Error! Please set Security Rules to "allow read, write: if true;" in Firebase Console.', { id: 'firestore-permission', duration: 6000 });
  }
}

/**
 * Removes undefined fields from objects before saving to Firestore,
 * preventing 'Unsupported field value: undefined' errors.
 */
function sanitizeData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}


// --- PRODUCTS ---
export async function getProducts(categorySlug?: string, searchQuery?: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) return [];

    let list: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    if (categorySlug && categorySlug !== 'all') {
      list = list.filter(p => p.categoryId === categorySlug || p.slug === categorySlug);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  } catch (error) {
    handleFirestorePermissionError(error, 'getProducts');
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    return null;
  } catch (error) {
    handleFirestorePermissionError(error, 'getProductById');
    return null;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  try {
    const productsRef = collection(db, 'products');
    const cleaned = sanitizeData({
      ...product,
      createdAt: new Date().toISOString()
    });
    const newDoc = await addDoc(productsRef, cleaned);
    return newDoc.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'createProduct');
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, sanitizeData(updates));
  } catch (error) {
    handleFirestorePermissionError(error, 'updateProduct');
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestorePermissionError(error, 'deleteProduct');
    throw error;
  }
}

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const catRef = collection(db, 'categories');
    const snapshot = await getDocs(catRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    handleFirestorePermissionError(error, 'getCategories');
    return [];
  }
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<string> {
  try {
    const catRef = collection(db, 'categories');
    const newDoc = await addDoc(catRef, category);
    return newDoc.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'createCategory');
    throw error;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<void> {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, category);
  } catch (error) {
    handleFirestorePermissionError(error, 'updateCategory');
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestorePermissionError(error, 'deleteCategory');
    throw error;
  }
}

// --- BANNERS ---
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const bannersRef = collection(db, 'banners');
    const snapshot = await getDocs(bannersRef);
    if (snapshot.empty) return [];
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Banner))
      .filter(b => b.active);
  } catch (error) {
    handleFirestorePermissionError(error, 'getActiveBanners');
    return [];
  }
}

export async function getAllBanners(): Promise<Banner[]> {
  try {
    const bannersRef = collection(db, 'banners');
    const snapshot = await getDocs(bannersRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
  } catch (error) {
    handleFirestorePermissionError(error, 'getAllBanners');
    return [];
  }
}

export async function createBanner(banner: Omit<Banner, 'id'>): Promise<string> {
  try {
    const ref = collection(db, 'banners');
    const docRef = await addDoc(ref, banner);
    return docRef.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'createBanner');
    throw error;
  }
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  try {
    const docRef = doc(db, 'banners', id);
    await updateDoc(docRef, banner);
  } catch (error) {
    handleFirestorePermissionError(error, 'updateBanner');
    throw error;
  }
}

export async function deleteBanner(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'banners', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestorePermissionError(error, 'deleteBanner');
    throw error;
  }
}

// --- COUPONS & DISCOUNTS ---
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const couponsRef = collection(db, 'coupons');
    const snap = await getDocs(couponsRef);
    if (snap.empty) return [];
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
  } catch (error) {
    handleFirestorePermissionError(error, 'getCoupons');
    return [];
  }
}

export async function validateCoupon(code: string, cartSubtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message: string }> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const allCoupons = await getCoupons();
    const found = allCoupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { valid: false, message: 'Invalid coupon code.' };
    }
    if (!found.active) {
      return { valid: false, message: 'This coupon is no longer active.' };
    }
    if (found.usedCount >= found.maxUses) {
      return { valid: false, message: 'Coupon usage limit has been reached.' };
    }
    if (cartSubtotal < found.minOrderAmount) {
      return { valid: false, message: `Minimum order amount of $${found.minOrderAmount} required for code ${found.code}.` };
    }
    const now = new Date();
    if (new Date(found.expiryDate) < now) {
      return { valid: false, message: 'This coupon has expired.' };
    }

    return { valid: true, coupon: found, message: 'Coupon applied successfully!' };
  } catch (error) {
    return { valid: false, message: 'Failed to validate coupon.' };
  }
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<string> {
  try {
    const couponsRef = collection(db, 'coupons');
    const docRef = await addDoc(couponsRef, {
      ...coupon,
      usedCount: 0
    });
    return docRef.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'createCoupon');
    throw error;
  }
}

// --- ORDERS & TRACKING ---
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
  try {
    const ordersRef = collection(db, 'orders');
    const autoNum = Math.floor(100000 + Math.random() * 900000);
    const customOrderId = (orderData as any).orderId || `ORD-${new Date().getFullYear()}-${autoNum}`;

    const newOrder = sanitizeData({
      ...orderData,
      orderId: customOrderId,
      status: 'pending' as OrderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const docRef = await addDoc(ordersRef, newOrder);

    // If coupon used, increment count
    if (orderData.couponCode) {
      const coupons = await getCoupons();
      const used = coupons.find(c => c.code === orderData.couponCode);
      if (used && used.id) {
        const couponDoc = doc(db, 'coupons', used.id);
        await updateDoc(couponDoc, { usedCount: (used.usedCount || 0) + 1 }).catch(() => { });
      }
    }

    // Automatically deduct stock for purchased items
    for (const item of orderData.items) {
      if (item.productId) {
        try {
          const product = await getProductById(item.productId);
          if (product) {
            const newStock = Math.max(0, (product.stock || 0) - item.quantity);
            await updateProduct(item.productId, { stock: newStock });
          }
        } catch (err) {
          console.warn(`Failed to update stock for product ${item.productId}:`, err);
        }
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'createOrder');
    throw error;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }
    return null;
  } catch (error) {
    handleFirestorePermissionError(error, 'getOrderById');
    return null;
  }
}

export function subscribeToOrder(id: string, callback: (order: Order | null) => void): Unsubscribe {
  const docRef = doc(db, 'orders', id);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Order);
    } else {
      // Fallback query by custom orderId
      const ordersRef = collection(db, 'orders');
      getDocs(ordersRef).then((snap) => {
        const found = snap.docs.find(d => d.id === id || d.data().orderId === id);
        if (found) {
          callback({ id: found.id, ...found.data() } as Order);
        } else {
          callback(null);
        }
      }).catch(() => callback(null));
    }
  }, (error) => {
    handleFirestorePermissionError(error, 'subscribeToOrder');
  });
}

export function subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
  const ordersRef = collection(db, 'orders');
  return onSnapshot(ordersRef, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    handleFirestorePermissionError(error, 'subscribeToOrders');
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const existingOrder = await getOrderById(orderId);
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    // If order is cancelled, restore stock to products inventory
    if (status === 'cancelled' && existingOrder && existingOrder.status !== 'cancelled') {
      for (const item of existingOrder.items) {
        if (item.productId) {
          try {
            const product = await getProductById(item.productId);
            if (product) {
              const restoredStock = (product.stock || 0) + item.quantity;
              await updateProduct(item.productId, { stock: restoredStock });
            }
          } catch (err) {
            console.warn(`Failed to restore stock for product ${item.productId}:`, err);
          }
        }
      }
    }
  } catch (error) {
    handleFirestorePermissionError(error, 'updateOrderStatus');
    throw error;
  }
}

export async function getUserOrders(userId?: string, email?: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    if (snapshot.empty) return [];

    let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

    if (userId || email) {
      const cleanEmail = email?.toLowerCase();
      list = list.filter(o =>
        (userId && o.userId === userId) ||
        (cleanEmail && o.customerDetails?.email?.toLowerCase() === cleanEmail)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    handleFirestorePermissionError(error, 'getUserOrders');
    return [];
  }
}

export async function updateOrderAddress(orderId: string, customerDetails: CustomerDetails): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, sanitizeData({
      customerDetails,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestorePermissionError(error, 'updateOrderAddress');
    throw error;
  }
}

export async function bookShipment(
  orderId: string,
  courierName: string,
  trackingNumber: string,
  trackingUrl: string,
  destinationCode?: string,
  returnCode?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const invoiceNumber = `INV-${orderId.substring(0, 10).toUpperCase()}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    await updateDoc(docRef, sanitizeData({
      status: 'shipped',
      courierName,
      trackingNumber,
      trackingUrl,
      destinationCode: destinationCode || 'DEST_HUB',
      returnCode: returnCode || '395006,4927491',
      invoiceNumber,
      invoiceDate,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestorePermissionError(error, 'bookShipment');
    throw error;
  }
}

// --- STORE SETTINGS ---
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "HASTI CREATION",
  sellerName: "MAHESHBHAI VIRADIYA",
  address: "202, Dhamlaxmi App., Gayatri Gat No 5, Near Rachna Society Hirabaug",
  city: "Surat",
  state: "Gujarat",
  zipCode: "395006",
  phone: "9898090842",
  email: "hasticreation@gmail.com",
  gstin: "24AHRPV6064B1Z3",
  returnCode: "395006,4927491",
  defaultHsn: "620449"
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'store');
    const snap = await getDoc(docRef);
    if (snap && snap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...snap.data() } as StoreSettings;
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (error: any) {
    console.warn('getStoreSettings caught permission/network exception. Using default store settings fallback:', error?.message || error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'store');
    await setDoc(docRef, sanitizeData(settings));
  } catch (error: any) {
    console.error('saveStoreSettings error:', error);
    if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      toast.error('Firestore Permission Error! Please update Security Rules in Firebase Console for /settings/{settingId} to allow read, write.');
    } else {
      toast.error(error?.message || 'Failed to save store settings.');
    }
    throw error;
  }
}

// --- REVIEWS & VERIFIED PURCHASES ---
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const ref = collection(db, 'reviews');
    const snap = await getDocs(ref);
    if (snap.empty) return [];
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Review))
      .filter(r => r.productId === productId);
  } catch (error) {
    handleFirestorePermissionError(error, 'getReviewsByProduct');
    return [];
  }
}

export async function checkVerifiedBuyer(userId: string, productId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const ordersRef = collection(db, 'orders');
    const snap = await getDocs(ordersRef);
    if (snap.empty) return false;
    const userOrders = snap.docs
      .map(doc => doc.data() as Order)
      .filter(o => o.userId === userId && (o.status === 'delivered' || o.status === 'shipped'));

    return userOrders.some(order => order.items.some(item => item.productId === productId));
  } catch (error) {
    return false;
  }
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  try {
    const ref = collection(db, 'reviews');
    const docRef = await addDoc(ref, {
      ...review,
      createdAt: new Date().toISOString()
    });

    // Recalculate rating on product
    const reviews = await getReviewsByProduct(review.productId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
    const reviewCount = reviews.length + 1;
    const avgRating = parseFloat((totalRating / reviewCount).toFixed(1));

    await updateProduct(review.productId, { rating: avgRating, reviewCount }).catch(() => { });

    return docRef.id;
  } catch (error) {
    handleFirestorePermissionError(error, 'addReview');
    throw error;
  }
}

// --- IMAGE UPLOAD HELPER ---
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.warn('Firebase Storage upload failed or blocked by CORS. Converting file to Data URL fallback:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
