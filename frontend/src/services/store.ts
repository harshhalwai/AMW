import { apiRequest, getAccessToken, clearTokens, Session } from "../api/api";
export type { Session } from "../api/api";

export type Role = "owner" | "employee" | "customer";

export interface Employee {
  pk: number;
  id: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  joiningDate: string;
  salary: number;
  role: string;
  photo?: string;
  password?: string;
  suspended?: boolean;
}

export interface Customer {
  pk: number;
  id: string;
  name: string;
  mobile: string;
  email: string;
  password?: string;
}

export type RepairStatus = "Pending" | "In Progress" | "Completed";
export type DeliveryStatus = "Pending" | "Ready for Delivery" | "Delivered";
export type MobileType = "Android" | "Keypad" | "iPhone";
export type PasswordType = "PIN" | "Password" | "Pattern";

export interface Job {
  id: string;
  jobSheetNo: string;
  jobDate: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  brand: string;
  model: string;
  color: string;
  mobileType: MobileType;
  picture?: string;
  passwordType: PasswordType;
  passwordValue: string;
  fault: string;
  description: string;
  featuresInstalled?: string;
  amount: number;
  repairStatus: RepairStatus;
  deliveryStatus: DeliveryStatus;
  deliveryDate?: string;
  assignedEmployeeId?: string;
  createdAt: string;
  completedAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  deliveryLog?: {
    otpVerifiedAt: string;
    deliveredBy: string;
    ownerApproved: boolean;
  };
  rating?: { stars: number; comment: string; employeeId?: string };
}

export interface Message {
  id: string;
  customer: number;
  customerId: string;
  customerName: string;
  customerMobile: string;
  subject: string;
  body: string;
  sentBy: string;
  sentByRole: Role;
  createdAt: string;
  read?: boolean;
}

export type NotificationType =
  | "job_added"
  | "job_updated"
  | "job_deleted"
  | "repair_completed"
  | "repair_status"
  | "delivery_status"
  | "delivered"
  | "otp_sent"
  | "customer_updated"
  | "employee_added"
  | "employee_updated"
  | "message_sent"
  | "feedback_submitted"
  | "rating_submitted";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName?: string;
  actorRole?: Role;
  jobSheetNo?: string;
  createdAt: string;
  read: boolean;
}

export interface ShopProfile {
  name: string;
  address: string;
  contact: string;
  logo?: string;
  email: string;
  gstin?: string;
}

export interface Product {
  id: string;
  name: string;
  category: "Mobile" | "Accessory" | "Spare Part" | "Gadget";
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  specs: string[];
  inStock: boolean;
  warranty: string;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "PROD-101",
    sku: "AMW-APL-15PM",
    name: "iPhone 15 Pro Max 256GB",
    category: "Mobile",
    brand: "Apple",
    price: 139900,
    originalPrice: 159900,
    stock: 5,
    rating: 4.9,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    badge: "Bestseller",
    specs: ["256GB Storage", "Titanium Frame", "A17 Pro Chip", "48MP Main Camera"],
    inStock: true,
    warranty: "1 Year Official Apple Warranty",
  },
  {
    id: "PROD-102",
    sku: "AMW-SAM-S24U",
    name: "Samsung Galaxy S24 Ultra 5G",
    category: "Mobile",
    brand: "Samsung",
    price: 124999,
    originalPrice: 134999,
    stock: 7,
    rating: 4.8,
    reviewsCount: 38,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
    badge: "Galaxy AI",
    specs: ["12GB RAM / 256GB", "Snapdragon 8 Gen 3", "200MP Quad Camera", "S-Pen Included"],
    inStock: true,
    warranty: "1 Year Samsung Warranty",
  },
  {
    id: "PROD-103",
    sku: "AMW-OP-12",
    name: "OnePlus 12 5G 512GB",
    category: "Mobile",
    brand: "OnePlus",
    price: 64999,
    originalPrice: 69999,
    stock: 8,
    rating: 4.7,
    reviewsCount: 29,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    badge: "Value Flagship",
    specs: ["16GB RAM / 512GB", "Snapdragon 8 Gen 3", "100W SUPERVOOC", "Hasselblad Camera"],
    inStock: true,
    warranty: "1 Year Brand Warranty",
  },
  {
    id: "PROD-201",
    sku: "AMW-ACC-APL20W",
    name: "Apple 20W USB-C Power Adapter",
    category: "Accessory",
    brand: "Apple",
    price: 1899,
    originalPrice: 1900,
    stock: 24,
    rating: 4.9,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    badge: "100% Genuine",
    specs: ["20W Fast Charging", "USB-C Port", "BIS Certified", "Compact Design"],
    inStock: true,
    warranty: "6 Months Warranty",
  },
  {
    id: "PROD-202",
    sku: "AMW-ACC-SPG15P",
    name: "Spigen Magnetic Armor Case iPhone 15 Pro",
    category: "Accessory",
    brand: "Spigen",
    price: 1999,
    originalPrice: 2499,
    stock: 18,
    rating: 4.8,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80",
    badge: "MagSafe Compatible",
    specs: ["Air Cushion Tech", "Drop Protection 6ft", "Anti-Fingerprint Matte", "Precise Cutouts"],
    inStock: true,
    warranty: "6 Months Brand Warranty",
  },
  {
    id: "PROD-301",
    sku: "AMW-PART-IP13OLED",
    name: "iPhone 13 / 14 Original OEM OLED Screen",
    category: "Spare Part",
    brand: "Apple",
    price: 7499,
    originalPrice: 9999,
    stock: 9,
    rating: 4.9,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=600&q=80",
    badge: "OEM Grade A+",
    specs: ["TrueTone Programmable", "Super Retina XDR OLED", "Scratch Resistant Glass", "Free Fitting Available"],
    inStock: true,
    warranty: "90 Days Replacement Warranty",
  },
  {
    id: "PROD-302",
    sku: "AMW-PART-BAT13",
    name: "High-Capacity 3227mAh Battery iPhone 13",
    category: "Spare Part",
    brand: "Apple",
    price: 2499,
    originalPrice: 3200,
    stock: 12,
    rating: 4.8,
    reviewsCount: 37,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80",
    badge: "0-Cycle Fresh",
    specs: ["Ti-Texas Instruments IC", "100% Battery Health Fix", "Zero Overheating", "90-Min Quick Swap"],
    inStock: true,
    warranty: "6 Months Replacement Warranty",
  },
  {
    id: "PROD-401",
    sku: "AMW-GDT-APP2",
    name: "Apple AirPods Pro (2nd Gen, USB-C)",
    category: "Gadget",
    brand: "Apple",
    price: 21990,
    originalPrice: 24900,
    stock: 6,
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    badge: "Pro Audio",
    specs: ["2x Active Noise Cancellation", "Adaptive Audio", "USB-C MagSafe Case", "30H Battery Life"],
    inStock: true,
    warranty: "1 Year Apple Warranty",
  },
  {
    id: "PROD-402",
    sku: "AMW-GDT-GW6",
    name: "Samsung Galaxy Watch 6 Classic 43mm",
    category: "Gadget",
    brand: "Samsung",
    price: 27999,
    originalPrice: 36999,
    stock: 4,
    rating: 4.7,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
    badge: "Rotating Bezel",
    specs: ["Sapphire Crystal Glass", "ECG & Blood Pressure", "Sleep Coach", "WearOS by Google"],
    inStock: true,
    warranty: "1 Year Samsung Warranty",
  },
];

const K = {
  employees: "amw_employees",
  customers: "amw_customers",
  jobs: "amw_jobs",
  notifications: "amw_notifications",
  messages: "amw_messages",
  shop: "amw_shop",
  session: "amw_session",
  products: "amw_products",
  cart: "amw_cart",
};

export const STORE_SYNCED_EVENT = "amw:store-synced";
export const NOTIFICATIONS_EVENT = "amw:notifications-changed";

function emitSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORE_SYNCED_EVENT));
  }
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- API Sync Layer ----------
export async function syncStoreFromServer() {
  if (typeof window === "undefined" || !getAccessToken()) return;
  try {
    // 1. Shop Profile
    const shop = await apiRequest<ShopProfile>("/api/jobs/shop/");
    writeLocal(K.shop, shop);

    // 2. Employees (Only owners can access)
    const sessionObj = Sessions.get();
    if (sessionObj && sessionObj.role === "owner") {
      const empsData = await apiRequest<any[]>("/api/employees/");
      const emps: Employee[] = empsData.map(e => ({
        pk: e.pk,
        id: e.employee_id,
        name: e.name,
        address: e.address || "",
        mobile: e.mobile,
        email: e.email,
        joiningDate: e.joining_date || "",
        salary: Number(e.salary),
        role: e.employee_role || "",
        photo: e.photo || undefined,
        suspended: e.suspended
      }));
      writeLocal(K.employees, emps);
    }

    // 3. Customers (Owners and employees can access)
    if (sessionObj && sessionObj.role !== "customer") {
      const custData = await apiRequest<any[]>("/api/customers/");
      const custs: Customer[] = custData.map(c => ({
        pk: c.pk,
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        email: c.email || ""
      }));
      writeLocal(K.customers, custs);
    }

    // 4. Jobs
    const jobsData = await apiRequest<any[]>("/api/jobs/");
    const jobs: Job[] = jobsData.map(j => ({
      ...j,
      amount: Number(j.amount)
    }));
    writeLocal(K.jobs, jobs);

    // 5. Notifications
    const notifData = await apiRequest<Notification[]>("/api/notifications/");
    writeLocal(K.notifications, notifData);

    // 6. Messages
    const msgData = await apiRequest<Message[]>("/api/customers/messages/");
    writeLocal(K.messages, msgData);

    emitSync();
  } catch (err) {
    console.error("Failed to sync store with server:", err);
  }
}

export function seedIfEmpty() {}

// ---------- CRUD Wrappers ----------
export const Employees = {
  all: () => readLocal<Employee[]>(K.employees, []),
  byId: (id: string) => Employees.all().find(e => e.id === id),
  upsert: async (e: Employee) => {
    const list = Employees.all();
    const idx = list.findIndex(x => x.id === e.id);
    if (idx >= 0) list[idx] = e; else list.push(e);
    writeLocal(K.employees, list);
    emitSync();

    const payload = {
      username: e.id,
      first_name: e.name,
      mobile: e.mobile,
      email: e.email,
      password: e.password || "emp123",
      employee_profile: {
        address: e.address,
        joining_date: e.joiningDate || null,
        salary: e.salary,
        employee_role: e.role,
        photo: e.photo || null
      }
    };

    if (e.pk) {
      await apiRequest(`/api/employees/${e.pk}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiRequest("/api/employees/", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    await syncStoreFromServer();
  },
  suspend: async (pk: number, suspend: boolean) => {
    const actionPath = suspend ? "suspend" : "unsuspend";
    await apiRequest(`/api/employees/${pk}/${actionPath}/`, { method: "POST" });
    await syncStoreFromServer();
  },
  remove: async (pk: number) => {
    const list = Employees.all().filter(e => e.pk !== pk);
    writeLocal(K.employees, list);
    emitSync();

    await apiRequest(`/api/employees/${pk}/`, { method: "DELETE" });
    await syncStoreFromServer();
  }
};

export const Customers = {
  all: () => readLocal<Customer[]>(K.customers, []),
  byId: (id: string) => Customers.all().find(c => c.id === id),
  byMobileOrEmail: (q: string) => {
    const normalized = q.toLowerCase().trim();
    return Customers.all().find(c =>
      c.mobile === normalized || c.email.toLowerCase() === normalized
    );
  },
  upsert: async (c: Customer) => {
    const list = Customers.all();
    const idx = list.findIndex(x => x.id === c.id);
    if (idx >= 0) list[idx] = c; else list.push(c);
    writeLocal(K.customers, list);
    emitSync();

    const payload = {
      first_name: c.name,
      mobile: c.mobile,
      email: c.email
    };

    if (c.pk) {
      await apiRequest(`/api/customers/${c.pk}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiRequest("/api/customers/", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    await syncStoreFromServer();
  }
};

export const Jobs = {
  all: () => readLocal<Job[]>(K.jobs, []),
  byId: (id: string) => Jobs.all().find(j => j.id === id),
  bySheet: (no: string) => Jobs.all().find(j => j.jobSheetNo.toLowerCase() === no.toLowerCase()),
  upsert: async (j: Job) => {
    let assignedEmployeePk: number | null = null;
    if (j.assignedEmployeeId) {
      const emp = Employees.byId(j.assignedEmployeeId);
      if (emp) assignedEmployeePk = emp.pk;
    }

    const list = Jobs.all();
    const idx = list.findIndex(x => x.id === j.id);
    if (idx >= 0) list[idx] = j; else list.unshift(j);
    writeLocal(K.jobs, list);
    emitSync();

    const payload = {
      customerName: j.customerName,
      customerMobile: j.customerMobile,
      customerEmail: j.customerEmail,
      brand: j.brand,
      model: j.model,
      color: j.color,
      mobileType: j.mobileType,
      picture: j.picture || null,
      passwordType: j.passwordType,
      passwordValue: j.passwordValue || "",
      fault: j.fault,
      description: j.description || "",
      featuresInstalled: j.featuresInstalled || "",
      amount: j.amount,
      repairStatus: j.repairStatus,
      deliveryStatus: j.deliveryStatus,
      deliveryDate: j.deliveryDate || null,
      assignedEmployeePk: assignedEmployeePk
    };

    if (j.id && j.id.length > 8 && !j.id.includes("new-job-temp-id")) {
      await apiRequest(`/api/jobs/${j.id}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiRequest("/api/jobs/", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    await syncStoreFromServer();
  },
  remove: async (id: string) => {
    const list = Jobs.all().filter(j => j.id !== id);
    writeLocal(K.jobs, list);
    emitSync();

    await apiRequest(`/api/jobs/${id}/`, { method: "DELETE" });
    await syncStoreFromServer();
  },
  rate: async (id: string, stars: number, comment: string) => {
    await apiRequest(`/api/jobs/${id}/rate/`, {
      method: "POST",
      body: JSON.stringify({ stars, comment })
    });
    await syncStoreFromServer();
  },
  deliver: async (id: string, otpCode: string) => {
    const res = await apiRequest(`/api/jobs/${id}/deliver/`, {
      method: "POST",
      body: JSON.stringify({ otp_code: otpCode })
    });
    await syncStoreFromServer();
    return res.job as Job;
  }
};

export const Notifications = {
  all: () => readLocal<Notification[]>(K.notifications, []),
  markRead: async (id: string) => {
    const list = Notifications.all().map(n => n.id === id ? { ...n, read: true } : n);
    writeLocal(K.notifications, list);
    emitSync();

    await apiRequest(`/api/notifications/${id}/read/`, { method: "POST" });
    await syncStoreFromServer();
  },
  markAllRead: async () => {
    const list = Notifications.all().map(n => ({ ...n, read: true }));
    writeLocal(K.notifications, list);
    emitSync();

    await apiRequest("/api/notifications/mark-all-read/", { method: "POST" });
    await syncStoreFromServer();
  },
  clearAll: async () => {
    writeLocal(K.notifications, []);
    emitSync();

    await apiRequest("/api/notifications/clear-all/", { method: "POST" });
    await syncStoreFromServer();
  },
  push: async (n: {
    type: NotificationType | string;
    title: string;
    message: string;
    actorName?: string;
    actorRole?: Role;
    jobSheetNo?: string;
  }) => {
    const newItem: Notification = {
      id: "notif-" + Date.now(),
      type: (n.type as NotificationType) || "repair_status",
      title: n.title,
      message: n.message,
      actorName: n.actorName,
      actorRole: n.actorRole,
      jobSheetNo: n.jobSheetNo,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const list = [newItem, ...Notifications.all()];
    writeLocal(K.notifications, list);
    emitSync();
  }
};

export const Messages = {
  all: () => readLocal<Message[]>(K.messages, []),
  forCustomer: (customerId: string) => {
    return Messages.all().filter(m => m.customerId === customerId);
  },
  push: async (m: { customer: number; subject: string; body: string }) => {
    await apiRequest("/api/customers/messages/", {
      method: "POST",
      body: JSON.stringify(m)
    });
    await syncStoreFromServer();
  },
  markRead: async (id: string) => {
    await apiRequest(`/api/customers/messages/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ read: true })
    });
    await syncStoreFromServer();
  }
};

export const Shop = {
  get: (): ShopProfile => readLocal<ShopProfile>(K.shop, {
    name: "Amit Mobile World (AMW)", address: "", contact: "", email: "", gstin: ""
  }),
  set: async (s: ShopProfile) => {
    writeLocal(K.shop, s);
    emitSync();

    await apiRequest("/api/jobs/shop/", {
      method: "POST",
      body: JSON.stringify(s)
    });
    await syncStoreFromServer();
  }
};

// ---------- OTP REST API ----------
export const Otp = {
  generate: async (mobile: string, purpose: "delivery" | "login", jobId?: string) => {
    const res = await apiRequest("/api/auth/send-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile, purpose, job_sheet_no: jobId })
    });
    return res.demo_otp as string;
  },
  verify: async (mobile: string, code: string, purpose: "delivery" | "login", jobId?: string) => {
    const res = await apiRequest("/api/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ mobile, otp_code: code, purpose, job_sheet_no: jobId })
    });
    return res.verified as boolean;
  }
};

// ---------- Sessions & Authentication ----------
export const Sessions = {
  get: (): Session | null => readLocal<Session | null>(K.session, null),
  set: (s: Session) => writeLocal(K.session, s),
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(K.session);
      clearTokens();
    }
  }
};

// ---------- Products & Inventory Service ----------
export const Products = {
  all: (): Product[] => {
    const list = readLocal<Product[]>(K.products, []);
    if (!list || list.length === 0) {
      writeLocal(K.products, DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    return list;
  },
  byId: (id: string) => Products.all().find(p => p.id === id),
  byCategory: (cat: Product["category"]) => Products.all().filter(p => p.category === cat),
  upsert: (product: Product) => {
    const list = Products.all();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    writeLocal(K.products, list);
    emitSync();
  },
  remove: (id: string) => {
    const list = Products.all().filter(p => p.id !== id);
    writeLocal(K.products, list);
    emitSync();
  },
  updateStock: (id: string, newStock: number) => {
    const list = Products.all();
    const item = list.find(p => p.id === id);
    if (item) {
      item.stock = Math.max(0, newStock);
      item.inStock = item.stock > 0;
      writeLocal(K.products, list);
      emitSync();
    }
  }
};

// ---------- Shopping Cart Service ----------
export const CART_CHANGED_EVENT = "amw:cart-changed";

export const Cart = {
  items: (): CartItem[] => readLocal<CartItem[]>(K.cart, []),
  add: (product: Product, quantity = 1) => {
    const cart = Cart.items();
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    writeLocal(K.cart, cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
    }
  },
  remove: (productId: string) => {
    const cart = Cart.items().filter(i => i.product.id !== productId);
    writeLocal(K.cart, cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
    }
  },
  updateQty: (productId: string, quantity: number) => {
    let cart = Cart.items();
    if (quantity <= 0) {
      cart = cart.filter(i => i.product.id !== productId);
    } else {
      const item = cart.find(i => i.product.id === productId);
      if (item) item.quantity = quantity;
    }
    writeLocal(K.cart, cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
    }
  },
  clear: () => {
    writeLocal(K.cart, []);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
    }
  },
  total: () => Cart.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
  count: () => Cart.items().reduce((acc, item) => acc + item.quantity, 0)
};

// ---------- Real Dashboard Backend API ----------
export const DashboardAPI = {
  fetchStats: async () => {
    try {
      if (getAccessToken()) {
        const stats = await apiRequest("/api/dashboard/stats/");
        return stats;
      }
    } catch (e) {
      console.warn("Backend dashboard stats fetch failed, falling back to local store calculation", e);
    }
    return null;
  }
};

