"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDocs, where } from "firebase/firestore";
import { Lock, Unlock, CheckCircle2, Trophy, Terminal, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface Challenge {
  id: string;
  levelId: number;
  title: string;
  clue: string;
  points: number;
  flag: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submission, setSubmission] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("levelId", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChallenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(fetchedChallenges);
    });

    return () => unsubscribe();
  }, []);

  const handleFlagSubmit = async (challenge: Challenge) => {
    const flagInput = submission[challenge.id];
    if (!flagInput) return;

    const normalizedInput = flagInput.trim().toLowerCase();
    const normalizedFlag = challenge.flag.trim().toLowerCase();

    if (normalizedInput === normalizedFlag) {
      setFeedback({ ...feedback, [challenge.id]: "CORRECT_FLAG_ACCEPTED" });
      
      // Update user progress
      if (profile && profile.currentLevel === challenge.levelId) {
        await updateDoc(doc(db, "users", profile.uid), {
          currentLevel: increment(1),
          totalPoints: increment(challenge.points)
        });
      }
    } else {
      setFeedback({ ...feedback, [challenge.id]: "INVALID_FLAG_REJECTED" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-green-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-500 tracking-tighter flex items-center gap-3">
              <Terminal size={32} /> INTEL_OPERATIONS_CENTER
            </h1>
            <p className="text-green-800 text-xs mt-1 uppercase tracking-widest">
              Welcome back, Agent {profile?.username} | Level {profile?.currentLevel}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-green-800 uppercase tracking-widest">Total Points</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">{profile?.totalPoints}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 border border-green-900 text-green-900 hover:text-red-500 hover:border-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Dashboard Navigation */}
        <div className="flex gap-4 mb-8">
          <button className="hacker-btn bg-green-500/10 border-green-500 text-green-500">Challenges</button>
          <button onClick={() => router.push("/leaderboard")} className="hacker-btn border-green-900 text-green-900">Leaderboard</button>
          {profile?.role === "admin" && (
            <button onClick={() => router.push("/admin")} className="hacker-btn border-cyan-900 text-cyan-900">Admin_Panel</button>
          )}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {challenges.map((challenge) => {
            const isLocked = (profile?.currentLevel || 1) < challenge.levelId;
            const isCompleted = (profile?.currentLevel || 1) > challenge.levelId;

            return (
              <div 
                key={challenge.id} 
                className={`hacker-card flex flex-col ${isLocked ? "opacity-40 grayscale" : "opacity-100"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] bg-green-900/30 px-2 py-1 text-green-500 border border-green-900">
                    LEVEL_{challenge.levelId.toString().padStart(2, '0')}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : isLocked ? (
                    <Lock className="text-green-900" size={20} />
                  ) : (
                    <Unlock className="text-cyan-500 animate-pulse" size={20} />
                  )}
                </div>

                <h3 className="text-lg font-bold mb-2 text-green-400 uppercase tracking-tight">
                  {isLocked ? "ENCRYPTED_DATA" : challenge.title}
                </h3>
                
                <p className="text-xs text-green-800 mb-6 flex-grow leading-relaxed">
                  {isLocked ? "ACCESS_DENIED: Complete previous level to decrypt Intel Clue." : challenge.clue}
                </p>

                {!isLocked && !isCompleted && (
                  <div className="space-y-3 mt-auto">
                    <input
                      type="text"
                      placeholder="ENTER_FLAG_HERE"
                      className="hacker-input text-xs p-2"
                      value={submission[challenge.id] || ""}
                      onChange={(e) => setSubmission({ ...submission, [challenge.id]: e.target.value })}
                    />
                    <button 
                      onClick={() => handleFlagSubmit(challenge)}
                      className="w-full hacker-btn text-xs py-1.5"
                    >
                      SUBMIT_INTEL
                    </button>
                    {feedback[challenge.id] && (
                      <p className={`text-[10px] font-mono text-center ${feedback[challenge.id].includes("CORRECT") ? "text-green-500" : "text-red-500"}`}>
                        {feedback[challenge.id]}
                      </p>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-auto bg-green-900/20 p-2 border border-green-500/30 text-center">
                    <p className="text-[10px] text-green-500 font-bold tracking-widest">TASK_SUCCESSFUL</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center pt-4 border-t border-green-900/50">
                  <span className="text-[10px] text-green-900 font-mono">VAL: {challenge.points} PTS</span>
                  <Trophy size={14} className={isCompleted ? "text-yellow-500" : "text-green-900"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
