import type { Job, ShopProfile } from "../services/store";
import { Download } from "lucide-react";

export function Invoice({ job, shop }: { job: Job; shop: ShopProfile }) {
  const subtotal = job.amount;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const invoiceNo = `INV-${job.jobSheetNo.replace(/\D/g, "")}`;

  return (
    <div className="print-area bg-white text-black mx-auto max-w-[800px] p-8 rounded-2xl border border-border shadow-card">
      <header className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">TAX INVOICE</h1>
          <p className="text-xs text-gray-500 mt-1">Original for recipient</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold">{shop.name}</h2>
          <p className="text-xs text-gray-600">{shop.address}</p>
          <p className="text-xs text-gray-600">{shop.contact} · {shop.email}</p>
          {shop.gstin && <p className="text-xs text-gray-600">GSTIN: {shop.gstin}</p>}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500">Bill To</div>
          <p className="font-bold mt-1">{job.customerName}</p>
          <p>{job.customerMobile}</p>
          <p>{job.customerEmail || "—"}</p>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-gray-500">Invoice No</span><span className="font-mono">{invoiceNo}</span>
            <span className="text-gray-500">Job Sheet</span><span className="font-mono">{job.jobSheetNo}</span>
            <span className="text-gray-500">Date</span><span>{new Date(job.jobDate).toLocaleDateString("en-IN")}</span>
            {job.deliveryDate && (<><span className="text-gray-500">Delivered</span><span>{new Date(job.deliveryDate).toLocaleDateString("en-IN")}</span></>)}
          </div>
        </div>
      </div>

      <table className="w-full mt-6 text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border-r border-gray-300">#</th>
            <th className="text-left p-2 border-r border-gray-300">Item / Service</th>
            <th className="text-right p-2 border-r border-gray-300 w-24">Qty</th>
            <th className="text-right p-2 w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-gray-300">1</td>
            <td className="p-2 border-r border-gray-300">
              Repair — {job.brand} {job.model}<br />
              <span className="text-xs text-gray-500">{job.fault}</span>
              {job.featuresInstalled && (
                <div className="text-xs text-gray-600 mt-1"><b>New Features Installed:</b> {job.featuresInstalled}</div>
              )}
            </td>
            <td className="p-2 text-right border-r border-gray-300">1</td>
            <td className="p-2 text-right">₹{subtotal.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <div className="w-72 text-sm space-y-1">
          <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
          <Row label="GST (18%)" value={`₹${gst.toLocaleString("en-IN")}`} />
          <div className="flex justify-between border-t border-black mt-2 pt-2 text-base font-bold">
            <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <footer className="mt-10 pt-4 border-t text-xs text-gray-500">
        <p>Thank you for choosing {shop.name}. All goods received in good condition. Repair warranty 30 days from delivery.</p>
        <p className="mt-2">This is a computer-generated invoice and does not require a signature.</p>
      </footer>

      <div className="no-print mt-6 flex justify-center gap-2">
        <button onClick={() => window.print()} className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium inline-flex items-center gap-2">
          <Download className="size-4" /> Download / Print PDF
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (<div className="flex justify-between"><span className="text-gray-500">{label}</span><span>{value}</span></div>);
}
