"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API || "http://localhost:5000";

export default function Dashboard() {
  const { token, setToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [amount, setAmount] = useState(199);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        setData(d);
      } catch (e: any) {
        setErr("Failed to load dashboard.");
      }
    })();
  }, [token]);

  async function buy() {
    if (!amount || amount <= 0) return setErr("Enter a valid amount.");
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ amount }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Purchase failed");
      // refresh dashboard
      const refreshed = await fetch(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(await refreshed.json());
      alert("Purchase complete.");
    } catch (e: any) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken(null);
    router.push("/login");
  }

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Please login first.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-lg">
            <span className="text-blue-600">FileSure</span> Dashboard
          </div>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {err && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4">
            {err}
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 text-center">
            Referral Dashboard
          </h1>

          <div className="grid md:grid-cols-4 gap-4">
            <Stat label="Referred Users" value={data.totalReferred} />
            <Stat label="Converted Users" value={data.convertedUsers} />
            <Stat label="Credits (Balance)" value={data.totalCreditsBalance} />
            <Stat label="Credits (Lifetime)" value={data.totalCreditsEarned} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Referral Link
            </h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono bg-gray-100 p-3 rounded-lg break-all border border-gray-200">
                {data.referralLink}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(data.referralLink)}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Make a Purchase
            </h2>
            <input
              type="number"
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
            />
            <button
              onClick={buy}
              disabled={busy}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-md w-full font-semibold transition"
            >
              {busy ? "Processing…" : "Buy Product"}
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center shadow-sm"
    >
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </motion.div>
  );
}
