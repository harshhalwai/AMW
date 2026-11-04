import { apiRequest, getAccessToken, clearTokens, Session } from "../api/api";

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

const K = {
  employees: "amw_employees",
  customers: "amw_customers",
  jobs: "amw_jobs",
  notifications: "amw_notifications",
  messages: "amw_messages",
  shop: "amw_shop",
  session: "amw_session",
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
  push: async (n: { type: string; title: string; message: string; jobSheetNo?: string }) => {}
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
