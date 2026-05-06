"use client";

import { useEffect, useState } from "react";
import type { Reader } from "../types";

const fakeReaders: Reader[] = [
  { id: "reader_001", name: "Aarav",   tier: "premium", region: "IN", topics: "tech,science" },
  { id: "reader_002", name: "Priya",   tier: "free",    region: "IN", topics: "world,culture" },
  { id: "reader_003", name: "Sarah",   tier: "premium", region: "US", topics: "business,tech" },
  { id: "reader_004", name: "James",   tier: "free",    region: "UK", topics: "sports,world" },
  { id: "reader_005", name: "Yuki",    tier: "premium", region: "JP", topics: "culture,science" },
  { id: "reader_006", name: "Carlos",  tier: "free",    region: "MX", topics: "world,business" },
  { id: "reader_007", name: "Fatima",  tier: "premium", region: "AE", topics: "world,culture,science" },
  { id: "reader_008", name: "Wei",     tier: "free",    region: "SG", topics: "tech" },
  { id: "reader_009", name: "Olivia",  tier: "premium", region: "UK", topics: "culture,business" },
  { id: "reader_010", name: "Rohit",   tier: "free",    region: "IN", topics: "sports,tech" }
];

const LS_KEY = "chronicle.demo.reader";
const COOKIE_NAME = "chronicle_reader";

function setCookie(id: string) {
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=86400; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

function applyCustomerId(id: string) {
  const orgId = process.env.NEXT_PUBLIC_ECID_ORG_ID || "";
  if (!orgId) return;
  // Visitor API may not be ready yet — poll until available (max ~5s)
  let attempts = 0;
  function attempt() {
    if (window.Visitor) {
      try {
        window.Visitor.getInstance(orgId).setCustomerIDs({
          crm_id: { id, authState: window.Visitor.AuthState.AUTHENTICATED }
        });
      } catch (e) {
        console.warn("[reader-picker] setCustomerIDs failed", e);
      }
    } else if (attempts++ < 50) {
      setTimeout(attempt, 100);
    }
  }
  attempt();
}

export default function ReaderPicker() {
  const [open, setOpen] = useState(false);
  const [currentReader, setCurrentReader] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showAlways = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    setEnabled(showAlways || params.get("demo") === "true");

    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      setCurrentReader(saved);
      setCookie(saved);         // ensure cookie is fresh for Launch to read
      applyCustomerId(saved);   // re-stitch ECID customer ID after reload
    }
  }, []);

  function selectReader(reader: Reader) {
    localStorage.setItem(LS_KEY, reader.id);
    setCookie(reader.id);
    setCurrentReader(reader.id);
    applyCustomerId(reader.id);

    // Re-fire Target with the new customer context
    if (window.adobe?.target?.triggerView) {
      try { window.adobe.target.triggerView(window.location.pathname); } catch {}
    }
  }

  function logOut() {
    localStorage.removeItem(LS_KEY);
    clearCookie();
    setCurrentReader(null);

    const orgId = process.env.NEXT_PUBLIC_ECID_ORG_ID || "";
    if (orgId && window.Visitor) {
      try {
        window.Visitor.getInstance(orgId).setCustomerIDs({
          crm_id: { id: "", authState: window.Visitor.AuthState.LOGGED_OUT }
        });
      } catch {}
    }
    if (window.adobe?.target?.triggerView) {
      try { window.adobe.target.triggerView(window.location.pathname); } catch {}
    }
  }

  if (!enabled) return null;
  const current = fakeReaders.find((r) => r.id === currentReader);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-neutral-900 text-white rounded-full px-4 py-2 shadow-lg"
      >
        {current ? `👤 ${current.name} (${current.tier})` : "Demo: pick reader"}
      </button>
      {open && (
        <div className="mt-2 w-80 bg-white border border-neutral-300 rounded shadow-xl p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            Demo: Reader Picker — simulates authenticated session
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
            {fakeReaders.map((r) => (
              <button
                key={r.id}
                onClick={() => selectReader(r)}
                className={`w-full text-left py-2 px-1 hover:bg-neutral-50 ${
                  currentReader === r.id ? "bg-yellow-50" : ""
                }`}
              >
                <div className="font-semibold">
                  {r.name}{" "}
                  <span className="text-neutral-500 font-normal">· {r.tier} · {r.region}</span>
                </div>
                <div className="text-neutral-500">{r.topics}</div>
              </button>
            ))}
          </div>
          {currentReader && (
            <button
              onClick={logOut}
              className="mt-2 w-full text-center py-1.5 border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
