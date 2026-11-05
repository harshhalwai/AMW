import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone, ShieldCheck, Wrench, UserCircle, ArrowRight, Sparkles, Star,
  CheckCircle2, ChevronDown, Phone, Mail, MapPin, Award, Activity, Search,
  ShoppingBag, X, Plus, Minus, Tag, Clock, Check, Layers, AlertCircle, Eye,
  Lock, ArrowUpRight, HelpCircle
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Products, Cart, Jobs, CART_CHANGED_EVENT, type Product, type CartItem, type Job
} from "../services/store";
import { StatusBadge } from "@/components/ui-bits";
import { toast } from "sonner";
import { cn } from "../utils/utils";

const PRODUCT_CATEGORIES = ["All", "Mobile", "Accessory", "Spare Part", "Gadget"] as const;

export function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Public quick tracker state
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedJob, setTrackedJob] = useState<Job | null>(null);
  const [searched, setSearched] = useState(false);

  // Online Repair Booking Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookBrand, setBookBrand] = useState("Apple");
  const [bookModel, setBookModel] = useState("");
  const [bookFault, setBookFault] = useState("Screen Replacement");
  const [bookName, setBookName] = useState("");
  const [bookMobile, setBookMobile] = useState("");
  const [bookDate, setBookDate] = useState("");

  // Product Catalog State
  const [productCat, setProductCat] = useState<typeof PRODUCT_CATEGORIES[number]>("All");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart Drawer State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(Cart.items());
  const [cartTick, setCartTick] = useState(0);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleCartChange = () => {
      setCartItems(Cart.items());
      setCartTick(t => t + 1);
    };
    window.addEventListener(CART_CHANGED_EVENT, handleCartChange);
    return () => window.removeEventListener(CART_CHANGED_EVENT, handleCartChange);
  }, []);

  const allProducts = Products.all();

  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (productCat !== "All") {
      list = list.filter(p => p.category === productCat);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProducts, productCat, productSearch]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      toast.error("Please enter a Job Sheet # or Mobile number");
      return;
    }
    const clean = trackQuery.trim().toLowerCase();
    const found = Jobs.all().find(
      j =>
        j.jobSheetNo.toLowerCase().includes(clean) ||
        j.customerMobile.includes(clean)
    );
    setTrackedJob(found || null);
    setSearched(true);
    if (!found) {
      toast.error("No active repair found matching that Sheet # or Mobile.");
    } else {
      toast.success("Repair record located!");
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookMobile || !bookModel) {
      toast.error("Please fill in customer name, mobile, and device model");
      return;
    }
    const sheetNo = `AMW-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    toast.success("Repair appointment scheduled!", {
      description: `Ticket #${sheetNo} reserved for ${bookBrand} ${bookModel}. We will call you on ${bookMobile} shortly.`,
      duration: 8000,
    });
    setBookModalOpen(false);
    setBookModel("");
    setBookName("");
    setBookMobile("");
  };

  const addToCart = (p: Product) => {
    Cart.add(p, 1);
    toast.success(`Added ${p.name} to cart`);
  };

  const cartTotal = Cart.total();
  const cartCount = Cart.count();

  const stats = [
    { label: "Happy Customers", value: "15,000+" },
    { label: "Devices Repaired", value: "32,000+" },
    { label: "First-Time Fix Rate", value: "96.4%" },
    { label: "Years Experience", value: "10+" },
  ];

  const services = [
    { title: "Screen Replacement", desc: "Original OEM specification glass & OLED displays with 90-day warranty and TrueTone calibration.", icon: <Smartphone className="size-6 text-[#FF5733]" /> },
    { title: "Battery Health Upgrade", desc: "Restore 100% capacity with high-density zero-cycle batteries and thermal protection.", icon: <Activity className="size-6 text-[#22C55E]" /> },
    { title: "Charging Port Repair", desc: "Fix loose USB-C / Lightning ports, faulty charging ICs, and wireless charging coils.", icon: <Wrench className="size-6 text-[#FF784E]" /> },
    { title: "Motherboard Diagnostics", desc: "Micro-soldering, audio IC fixes, NAND storage upgrades, and dead board resurrection.", icon: <ShieldCheck className="size-6 text-[#FF5733]" /> },
    { title: "Water Damage Recovery", desc: "Ultrasonic chemical decontamination, short-circuit clearing, and board-level restoration.", icon: <Sparkles className="size-6 text-sky-400" /> },
    { title: "Camera & Sensor Fixes", desc: "Repair blurry optical lenses, FaceID/TouchID sensors, and image stabilization.", icon: <Award className="size-6 text-[#F59E0B]" /> },
  ];

  const faqs = [
    { q: "How long does a typical mobile repair take?", a: "Most routine repairs (screen swaps, battery upgrades, charging ports) are completed within 45 to 60 minutes. Deep motherboard diagnostic repairs can take 1 to 2 business days." },
    { q: "Do you use genuine OEM replacement components?", a: "Yes. We source certified OEM specification parts directly from authorized suppliers. Every replacement passes a 12-point quality checklist before customer delivery." },
    { q: "Is there a warranty on your repair services?", a: "All display and battery replacements carry a comprehensive 90-day warranty covering touch response, flickering, and component integrity." },
    { q: "How does OTP-verified pickup work?", a: "When your phone is repaired and ready for pickup, an SMS/OTP is sent to your registered mobile number. Our technician verifies this OTP before handing over the device for maximum security." },
  ];

  return (
    <div className="min-h-screen bg-[#080A0F] text-white selection:bg-[#FF5733] selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 size-[550px] bg-[#FF5733]/10 blur-[140px] rounded-full" />
        <div className="absolute top-[800px] -right-40 size-[500px] bg-[#FF784E]/10 blur-[140px] rounded-full" />
      </div>

      {/* STICKY GLASS HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#272B36]/80 bg-[#080A0F]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF5733] to-[#FF784E] grid place-items-center shadow-elegant group-hover:scale-105 transition-transform">
              <Smartphone className="size-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                <span>AMW</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF5733]/20 text-[#FF784E] border border-[#FF5733]/30">
                  FLAGSHIP
                </span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[#A1A1AA]">
                Amit Mobile World
              </div>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#A1A1AA]">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#products" className="hover:text-white transition-colors">Products &amp; Parts</a>
            <a href="#tracker" className="hover:text-white transition-colors">Track Repair</a>
            <a href="#portals" className="hover:text-white transition-colors">Staff &amp; Portals</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-[#272B36] bg-[#151923] hover:border-[#FF5733]/50 text-white transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-[#FF5733] text-white font-mono text-[10px] font-bold grid place-items-center shadow-md animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            <Button
              onClick={() => setBookModalOpen(true)}
              className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold hidden sm:inline-flex"
            >
              <Plus className="size-3.5 mr-1" /> Book Repair
            </Button>

            <Button asChild variant="outline" size="sm" className="border-[#272B36] bg-[#151923] text-white hover:border-[#FF5733] rounded-xl text-xs">
              <a href="#portals">Portals</a>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 text-xs font-bold">
            <Award className="size-3.5" /> Delhi's Premier Smartphone Care &amp; Gadgets Store
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
            Premium Repair, Genuine Upgrades <span className="text-gradient">&amp; Mobile Tech</span>.
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
            Amit Mobile World (AMW) pairs certified technicians with original OEM specification parts, transparent pricing, live OTP delivery tracking, and a curated catalog of flagships &amp; accessories.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => setBookModalOpen(true)}
              size="lg"
              className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl px-6 text-sm font-bold"
            >
              Book Repair Online
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#272B36] bg-[#151923] text-white hover:border-[#FF5733] rounded-xl px-6 text-sm font-semibold"
            >
              <a href="#tracker">Track Live Repair</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#272B36] bg-[#151923] text-white hover:border-[#FF5733] rounded-xl px-6 text-sm font-semibold"
            >
              <a href="#products">Shop Accessories</a>
            </Button>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#272B36] max-w-lg text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#22C55E] shrink-0" />
              <span className="text-muted-foreground font-medium">100% OEM Parts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#22C55E] shrink-0" />
              <span className="text-muted-foreground font-medium">90-Day Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#22C55E] shrink-0" />
              <span className="text-muted-foreground font-medium">OTP Secure Pickup</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card Preview */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-3xl border border-[#272B36] bg-[#151923]/90 backdrop-blur-xl p-6 shadow-elegant space-y-5">
            <div className="flex items-center justify-between border-b border-[#272B36] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Diagnostics Bench</span>
              </div>
              <span className="font-mono text-xs text-[#FF784E] font-bold">#AMW-1048</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#11141C] border border-[#272B36]">
                <div className="size-10 rounded-lg bg-[#FF5733]/15 text-[#FF784E] grid place-items-center shrink-0">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Device in Service</div>
                  <div className="text-sm font-bold text-white truncate">iPhone 14 Pro Max 256GB</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5733]/20 text-[#FF784E] border border-[#FF5733]/30">
                  In Progress
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11141C] border border-[#272B36] space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Diagnostic Checklist</span>
                  <span className="text-[#22C55E] text-[10px]">Passed 11/12</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="size-3 text-[#22C55E]" /> OLED Digitizer Swap</span>
                  <span className="flex items-center gap-1.5"><Check className="size-3 text-[#22C55E]" /> TrueTone Eprom Flash</span>
                  <span className="flex items-center gap-1.5"><Check className="size-3 text-[#22C55E]" /> Battery Health Check</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3 text-[#FF5733]" /> QC Burn-in Stress Test</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FF5733]/10 border border-[#FF5733]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-[#FF784E]" />
                  <span className="text-white font-medium">OTP Delivery Protection</span>
                </div>
                <span className="font-mono text-[#FF784E] font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNTER STRIP */}
      <section className="relative z-10 border-y border-[#272B36] bg-[#11141C]/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK LIVE REPAIR TRACKER SECTION */}
      <section id="tracker" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
            Instant Customer Tracker
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Track Your Repair in Real-Time
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Enter your Job Sheet # (e.g. AMW-1000) or registered mobile number below to see live diagnostics.
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={trackQuery}
              onChange={e => setTrackQuery(e.target.value)}
              placeholder="Enter Job Sheet Number (e.g. AMW-1000) or 10-digit mobile..."
              className="pl-10 h-12 rounded-xl bg-[#151923] border-[#272B36] text-white focus-visible:ring-[#FF5733]"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl px-8 font-bold text-sm">
            Lookup Status
          </Button>
        </form>

        {searched && trackedJob && (
          <div className="rounded-2xl border border-[#272B36] bg-[#151923] p-6 space-y-5 shadow-card animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272B36] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF784E] font-mono">{trackedJob.jobSheetNo}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{trackedJob.brand} {trackedJob.model}</h3>
                <p className="text-xs text-muted-foreground">Registered for {trackedJob.customerName} on {new Date(trackedJob.jobDate).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="sm:text-right">
                <div className="text-lg font-black font-mono text-white">₹{trackedJob.amount.toLocaleString("en-IN")}</div>
                <StatusBadge status={trackedJob.deliveryStatus === "Delivered" ? "Delivered" : trackedJob.repairStatus} />
              </div>
            </div>

            {/* Step-by-step progress visualizer */}
            <div className="pt-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Service Pipeline</div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-400">1. Intake</span>
                </div>
                <div className="space-y-1">
                  <div className={cn("h-1.5 rounded-full", trackedJob.repairStatus !== "Pending" ? "bg-emerald-500" : "bg-[#FF5733] animate-pulse")} />
                  <span className={cn("font-bold", trackedJob.repairStatus !== "Pending" ? "text-emerald-400" : "text-[#FF784E]")}>
                    2. Diagnostics
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={cn("h-1.5 rounded-full", trackedJob.repairStatus === "Completed" || trackedJob.deliveryStatus === "Delivered" ? "bg-emerald-500" : "bg-secondary")} />
                  <span className={cn("font-bold", trackedJob.repairStatus === "Completed" || trackedJob.deliveryStatus === "Delivered" ? "text-emerald-400" : "text-muted-foreground")}>
                    3. QC Tested
                  </span>
                </div>
                <div className="space-y-1">
                  <div className={cn("h-1.5 rounded-full", trackedJob.deliveryStatus === "Delivered" ? "bg-emerald-500" : "bg-secondary")} />
                  <span className={cn("font-bold", trackedJob.deliveryStatus === "Delivered" ? "text-emerald-400" : "text-muted-foreground")}>
                    4. Delivered
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11141C] border border-[#272B36] text-xs space-y-1">
              <span className="text-muted-foreground font-semibold">Reported Defect: </span>
              <span className="text-white font-medium">{trackedJob.fault}</span>
            </div>

            <div className="flex justify-end">
              <Button asChild size="sm" variant="outline" className="border-[#272B36] rounded-xl text-xs">
                <Link to="/login/customer">Login to View Tax Invoice</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* PRODUCTS & ACCESSORIES STORE CATALOG SECTION */}
      <section id="products" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              AMW Store &amp; Spare Parts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Phones, Accessories &amp; OEM Parts
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
              Buy certified smartphones, original chargers, shockproof cases, and original replacement display screens with full shop warranty.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setProductCat(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
                  productCat === cat
                    ? "bg-[#FF5733] text-white border-[#FF5733] shadow-elegant"
                    : "bg-[#151923] text-muted-foreground border-[#272B36] hover:text-white hover:border-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group rounded-2xl border border-[#272B36] bg-[#151923] p-4 flex flex-col justify-between hover:border-[#FF5733]/50 transition-all duration-300 shadow-card hover:-translate-y-1"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#11141C] mb-3.5 border border-[#272B36]/60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5733] text-white shadow-md">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-2.5 right-2.5">
                    <StatusBadge status={product.stock === 0 ? "Out of Stock" : "In Stock"} />
                  </span>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF784E] mb-1">
                  {product.brand} · {product.category}
                </div>

                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#FF784E] transition-colors line-clamp-1">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-black text-white font-mono">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through font-mono">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-400">
                  <Star className="size-3.5 fill-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#272B36] flex items-center gap-2">
                <Button
                  onClick={() => setSelectedProduct(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#272B36] bg-[#11141C] text-white hover:border-[#FF5733] rounded-xl text-xs"
                >
                  <Eye className="size-3.5 mr-1" /> Quick View
                </Button>
                <Button
                  onClick={() => addToCart(product)}
                  size="sm"
                  className="bg-[#FF5733] hover:bg-[#FF784E] text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="size-3.5" /> Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES DIAGNOSTICS SECTION */}
      <section id="services" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
            Certified Lab Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Specialized Hardware &amp; Software Repairs
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            From cracked OLED display assemblies to complex motherboard micro-soldering, our ESD-safe workstation fixes issues right.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((ser, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-[#151923] border border-[#272B36] hover:border-[#FF5733]/50 hover:-translate-y-1 transition-all duration-300 shadow-card"
            >
              <div className="size-12 rounded-xl bg-[#11141C] border border-[#272B36] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {ser.icon}
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 text-white group-hover:text-[#FF784E] transition-colors">
                {ser.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ser.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PORTALS ACCESS SECTION */}
      <section id="portals" className="relative z-10 py-16 sm:py-24 bg-[#11141C]/80 border-y border-[#272B36]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Secure Staff &amp; Customer Portals
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Role-based management system for shop owners, technicians, and retail customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PortalCard
              to="/login/owner"
              title="Shop Owner Portal"
              desc="Full control: sales analytics, customer ledger, employee management, and billing."
              icon={<ShieldCheck className="size-6 text-[#FF5733]" />}
              hint="owner / owner123"
            />
            <PortalCard
              to="/login/employee"
              title="Technician Portal"
              desc="Assigned repair queue, status progression, diagnostic notes, and OTP verification."
              icon={<Wrench className="size-6 text-[#FF784E]" />}
              hint="EMP001 / emp123"
            />
            <PortalCard
              to="/login/customer"
              title="Customer Portal"
              desc="Live device progress tracking, invoice downloads, feedback, and support chat."
              icon={<UserCircle className="size-6 text-emerald-400" />}
              hint="9123456780 / AMW-1000"
            />
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Customer Testimonials
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Verified feedback from repair job clients across Delhi NCR</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ReviewCard
            name="Amit Sharma"
            device="iPhone 13 Pro Display Swap"
            comment="Absolutely brilliant service! Replaced my display in 45 minutes right in front of me. Highly professional setup."
            stars={5}
          />
          <ReviewCard
            name="Priya Patel"
            device="Samsung Galaxy S22 Battery Fix"
            comment="Very transparent system. I could track the progress of my repair online using the OTP portal. Highly recommended!"
            stars={5}
          />
          <ReviewCard
            name="Rohan Das"
            device="OnePlus Nord Motherboard IC"
            comment="Other shops said my phone was dead forever. AMW micro-soldered it back to life. Truly expert technicians."
            stars={5}
          />
        </div>
      </section>

      {/* FAQS SECTION */}
      <section id="faqs" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Everything you need to know about our repair warranties and store policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const open = activeFaq === idx;
            return (
              <div key={idx} className="rounded-xl border border-[#272B36] bg-[#151923] overflow-hidden">
                <button
                  onClick={() => setActiveFaq(open ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-xs sm:text-sm text-white hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-muted-foreground border-t border-[#272B36]/80 bg-[#11141C]/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SHOP FOOTER */}
      <footer className="relative z-10 border-t border-[#272B36] bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#FF5733] grid place-items-center">
                <Smartphone className="size-4 text-white" />
              </div>
              <div className="font-bold text-white tracking-tight">Amit Mobile World (AMW)</div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Certified smartphone diagnostics, authentic OEM components, warranty assurance, and live OTP verification.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">Workshop Schedule</h4>
            <ul className="text-muted-foreground space-y-1.5 font-medium">
              <li>Mon – Sat: 10:00 AM – 08:30 PM</li>
              <li className="text-[#FF784E]">Sunday: Closed (Weekly Rest)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">Customer Portals</h4>
            <ul className="text-muted-foreground space-y-1.5 font-medium">
              <li><Link to="/login/customer" className="hover:text-white transition-colors">Customer Tracking</Link></li>
              <li><Link to="/login/employee" className="hover:text-white transition-colors">Technician Terminal</Link></li>
              <li><Link to="/login/owner" className="hover:text-white transition-colors">Owner Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-white font-bold mb-3">Contact Support</h4>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2"><Phone className="size-3.5 text-[#FF784E] mt-0.5" /> +91 98100 12345</li>
              <li className="flex items-start gap-2"><Mail className="size-3.5 text-[#FF784E] mt-0.5" /> support@amitmobileworld.in</li>
              <li className="flex items-start gap-2"><MapPin className="size-3.5 text-[#FF784E] mt-0.5" /> Shop 12, Main Market, Sector 5, New Delhi</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#272B36]/80 py-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Amit Mobile World (AMW) · Premium UI/UX Redesign. All rights reserved.
        </div>
      </footer>

      {/* ONLINE REPAIR BOOKING MODAL */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-[#272B36] rounded-2xl p-6 w-full max-w-lg shadow-elegant animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#272B36]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="size-5 text-[#FF5733]" />
                Book Online Repair
              </h2>
              <button onClick={() => setBookModalOpen(false)} className="p-1 text-muted-foreground hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Device Brand *</Label>
                  <select
                    value={bookBrand}
                    onChange={e => setBookBrand(e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-[#11141C] px-3 text-xs text-white"
                  >
                    <option value="Apple">Apple iPhone</option>
                    <option value="Samsung">Samsung Galaxy</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi / Redmi</option>
                    <option value="Realme">Realme</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Other">Other Brand</option>
                  </select>
                </div>
                <div>
                  <Label>Device Model *</Label>
                  <Input
                    required
                    value={bookModel}
                    onChange={e => setBookModel(e.target.value)}
                    placeholder="e.g. 13 Pro, S23 Ultra"
                    className="mt-1 bg-[#11141C] border-[#272B36]"
                  />
                </div>
              </div>

              <div>
                <Label>Primary Fault / Service Required</Label>
                <select
                  value={bookFault}
                  onChange={e => setBookFault(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-[#11141C] px-3 text-xs text-white"
                >
                  <option value="Screen Replacement">Screen / OLED Replacement</option>
                  <option value="Battery Health Upgrade">Battery Replacement (Health Drain)</option>
                  <option value="Charging Port Repair">Charging Port / No Charge</option>
                  <option value="Water Damage Recovery">Water / Liquid Damage Diagnostic</option>
                  <option value="Motherboard IC Repair">Motherboard IC / Dead Phone</option>
                  <option value="Camera Lens Repair">Camera Lens / Blurry Sensor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Your Name *</Label>
                  <Input
                    required
                    value={bookName}
                    onChange={e => setBookName(e.target.value)}
                    placeholder="Amit Kumar"
                    className="mt-1 bg-[#11141C] border-[#272B36]"
                  />
                </div>
                <div>
                  <Label>Mobile Number (For OTP) *</Label>
                  <Input
                    required
                    value={bookMobile}
                    onChange={e => setBookMobile(e.target.value)}
                    placeholder="98100 12345"
                    className="mt-1 bg-[#11141C] border-[#272B36]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#272B36]">
                <Button type="button" variant="outline" onClick={() => setBookModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#FF5733] hover:bg-[#FF784E] text-white">
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151923] border border-[#272B36] rounded-2xl p-6 w-full max-w-xl shadow-elegant animate-scale-in">
            <div className="flex items-start justify-between pb-4 border-b border-[#272B36]">
              <div>
                <span className="text-[10px] font-bold text-[#FF784E] uppercase tracking-wider">{selectedProduct.brand} · {selectedProduct.category}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedProduct.name}</h2>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 text-muted-foreground hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 py-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#11141C] border border-[#272B36]">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="size-full object-cover" />
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-2xl font-black text-white font-mono">₹{selectedProduct.price.toLocaleString("en-IN")}</div>
                  {selectedProduct.originalPrice && (
                    <div className="text-xs text-muted-foreground line-through font-mono">MRP: ₹{selectedProduct.originalPrice.toLocaleString("en-IN")}</div>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Warranty:</span>
                  <span className="text-white ml-1.5">{selectedProduct.warranty}</span>
                </div>

                <div>
                  <span className="text-muted-foreground font-semibold">Stock Availability:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">{selectedProduct.stock} units available</span>
                </div>

                {selectedProduct.specs && (
                  <div className="space-y-1 pt-1">
                    <span className="text-muted-foreground font-semibold block">Key Specifications:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-white">
                      {selectedProduct.specs.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272B36]">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="bg-[#FF5733] hover:bg-[#FF784E] text-white"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART / RESERVE DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#151923] border-l border-[#272B36] p-6 flex flex-col justify-between shadow-2xl h-full animate-slide-up">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#272B36]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-5 text-[#FF5733]" />
                  <h3 className="font-bold text-base text-white">Your Shopping Cart ({cartCount})</h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-1 text-muted-foreground hover:text-white">
                  <X className="size-5" />
                </button>
              </div>

              {/* Cart Item List */}
              <div className="py-4 space-y-3 overflow-y-auto max-h-[60vh]">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#11141C] border border-[#272B36]">
                    <img src={item.product.image} alt={item.product.name} className="size-12 rounded-lg object-cover bg-secondary border border-[#272B36]" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] font-mono text-[#FF784E] font-bold">₹{item.product.price.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => Cart.updateQty(item.product.id, item.quantity - 1)} className="size-6 rounded bg-[#272B36] grid place-items-center text-xs text-white">-</button>
                      <span className="font-mono text-xs text-white px-1.5">{item.quantity}</span>
                      <button onClick={() => Cart.updateQty(item.product.id, item.quantity + 1)} className="size-6 rounded bg-[#272B36] grid place-items-center text-xs text-white">+</button>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Your cart is empty. Explore our products and add accessories or spare parts!
                  </div>
                )}
              </div>
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-[#272B36] space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white text-base">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <Button
                  onClick={() => {
                    toast.success("Order request placed!", {
                      description: "Our store manager will contact you for pickup/delivery verification.",
                    });
                    Cart.clear();
                    setCartOpen(false);
                  }}
                  className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white font-bold h-11 rounded-xl"
                >
                  Reserve Order / Pickup in Shop
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PortalCard({ to, title, desc, icon, hint }: { to: string; title: string; desc: string; icon: React.ReactNode; hint: string }) {
  return (
    <Link to={to} className="group flex flex-col justify-between p-6 rounded-2xl bg-[#151923] border border-[#272B36] hover:shadow-elegant hover:border-[#FF5733]/50 transition-all duration-300">
      <div>
        <div className="size-12 rounded-xl bg-[#11141C] border border-[#272B36] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">{icon}</div>
        <h3 className="font-bold text-base mb-1 text-white group-hover:text-[#FF784E] transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-[11px] pt-3 border-t border-[#272B36]/80">
        <span className="text-muted-foreground font-mono">Demo: {hint}</span>
        <span className="inline-flex items-center gap-1 text-[#FF5733] font-bold group-hover:translate-x-1 transition-transform">
          Enter <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}

function ReviewCard({ name, device, comment, stars }: { name: string; device: string; comment: string; stars: number }) {
  return (
    <div className="p-6 rounded-2xl bg-[#151923] border border-[#272B36] shadow-card space-y-3">
      <div className="flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground italic font-medium leading-relaxed">"{comment}"</p>
      <div className="pt-3 border-t border-[#272B36] flex justify-between items-center">
        <div>
          <div className="text-xs font-bold text-white">{name}</div>
          <div className="text-[10px] text-[#FF784E] font-medium">{device}</div>
        </div>
        <div className="size-8 rounded-full bg-[#FF5733]/15 text-[#FF784E] font-bold grid place-items-center text-xs border border-[#FF5733]/30">
          {name.charAt(0)}
        </div>
      </div>
    </div>
  );
}
