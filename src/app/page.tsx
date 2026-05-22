"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Terminal, Lock, User, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Initialize user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: username || email.split("@")[0],
          email: email,
          currentLevel: 1,
          totalPoints: 0,
          role: "player",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full hacker-card"
      >
        <div className="flex items-center gap-2 mb-8 border-b border-green-900 pb-4">
          <Terminal className="text-green-500" size={24} />
          <h1 className="text-2xl font-bold tracking-[0.2em] text-green-500">
            INTEL_ACCESS_v1.0
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-green-800 flex items-center gap-2">
                <User size={12} /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="hacker-input"
                placeholder="OPERATIVE_CODENAME"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-green-800 flex items-center gap-2">
              <User size={12} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hacker-input"
              placeholder="INTEL_ID@SECURE.OPS"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-green-800 flex items-center gap-2">
              <Lock size={12} /> Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hacker-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono flex items-start gap-2 bg-red-950/20 p-3 border border-red-900">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full hacker-btn"
          >
            {loading ? "PROCESSING..." : isRegistering ? "INITIALIZE_PROFILE" : "AUTHORIZE_ACCESS"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] uppercase tracking-widest text-green-900 hover:text-green-500 transition-colors"
          >
            {isRegistering ? "Already have clearance? Login" : "Need authorization? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
