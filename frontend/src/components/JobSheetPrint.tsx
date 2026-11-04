import type { Employee, Job, ShopProfile } from "../services/store";
import { PatternInput } from "./PatternInput";
import { Smartphone } from "lucide-react";

export function JobSheetPrint({ job, shop, employee }: { job: Job; shop: ShopProfile; employee: Employee | null }) {
  return (
    <div className="print-area bg-white text-black mx-auto max-w-[800px] p-8 rounded-2xl border border-border shadow-card">
      <header className="border-b-2 border-black pb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {shop.logo
            ? <img src={shop.logo} alt="Logo" className="size-14 rounded" />
            : <div className="size-14 rounded bg-black text-white grid place-items-center"><Smartphone className="size-7" /></div>}
          <div>
            <h1 className="text-2xl font-black tracking-tight">{shop.name}</h1>
            <p className="text-xs text-gray-600">{shop.address || "Shop address placeholder"}</p>
            <p className="text-xs text-gray-600">Contact: {shop.contact || "Contact placeholder"}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">Job Sheet</div>
          <div className="font-mono text-lg font-bold">{job.jobSheetNo}</div>
          <div className="text-xs text-gray-600">Date: {new Date(job.jobDate).toLocaleDateString("en-IN")}</div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <Block title="Customer">
          <p><b>{job.customerName}</b></p>
          <p>{job.customerMobile}</p>
          <p>{job.customerEmail || "—"}</p>
        </Block>
        <Block title="Device">
          <p><b>{job.brand} {job.model}</b></p>
          <p>Color: {job.color || "—"} · Type: {job.mobileType}</p>
          <p>Password Type: {job.passwordType}</p>
          {job.passwordType !== "Pattern" && job.passwordValue && <p>Code: {job.passwordValue}</p>}
        </Block>
      </div>

      {job.passwordType === "Pattern" && job.passwordValue && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pattern</div>
          <PatternInput value={job.passwordValue} onChange={() => {}} readOnly />
        </div>
      )}

      <div className="mt-4">
        <Block title="Repair">
          <p><b>Fault:</b> {job.fault}</p>
          {job.description && <p>{job.description}</p>}
          {job.featuresInstalled && <p className="mt-1"><b>New Features Installed:</b> {job.featuresInstalled}</p>}
        </Block>
      </div>

      <table className="w-full mt-5 text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border-r border-gray-300">Description</th>
            <th className="text-right p-2 w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-gray-300">Repair charges — {job.fault}</td>
            <td className="p-2 text-right">₹{job.amount.toLocaleString("en-IN")}</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="p-2 border-r border-gray-300 font-bold">Total</td>
            <td className="p-2 text-right font-bold">₹{job.amount.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
        <SigBlock label="Employee" name={employee?.name || "—"} />
        <SigBlock label="Customer Signature" />
        <SigBlock label="Owner Signature" />
      </div>

      <footer className="mt-6 pt-3 border-t text-[10px] text-gray-500 text-center">
        This is a system-generated job sheet · {shop.name} · {shop.email}
      </footer>

      <div className="no-print mt-6 text-center">
        <button onClick={() => window.print()} className="px-5 py-2 rounded-md bg-black text-white text-sm font-medium">Print Job Sheet</button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-300 rounded p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{title}</div>
      {children}
    </div>
  );
}
function SigBlock({ label, name }: { label: string; name?: string }) {
  return (
    <div>
      <div className="h-14 border-b border-gray-400" />
      <div className="mt-1 text-gray-600">{label}</div>
      {name && <div className="font-medium">{name}</div>}
    </div>
  );
}
