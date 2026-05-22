"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Terminal, Plus, Trash2, Edit2, ShieldCheck, Users, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Challenge {
  id: string;
  levelId: number;
  title: string;
  clue: string;
  points: number;
  flag: string;
}

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  currentLevel: number;
  totalPoints: number;
  role: string;
}

export default function AdminPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    levelId: 1,
    title: "",
    clue: "",
    points: 100,
    flag: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Listen for challenges
    const qChallenges = query(collection(db, "challenges"), orderBy("levelId", "asc"));
    const unsubChallenges = onSnapshot(qChallenges, (snapshot) => {
      setChallenges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Challenge[]);
    });

    // Listen for users
    const qUsers = query(collection(db, "users"), orderBy("totalPoints", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
    });

    return () => {
      unsubChallenges();
      unsubUsers();
    };
  }, []);

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "challenges"), newChallenge);
      setNewChallenge({ levelId: challenges.length + 1, title: "", clue: "", points: 100, flag: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding challenge:", err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (confirm("REALLY_DELETE_INTEL_PACKAGE?")) {
      await deleteDoc(doc(db, "challenges", id));
    }
  };

  const handleUpdateChallenge = async (id: string, data: Partial<Challenge>) => {
    await setDoc(doc(db, "challenges", id), data, { merge: true });
    setIsEditing(null);
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-cyan-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-500 tracking-tighter flex items-center gap-3">
              <ShieldCheck size={32} /> COMMAND_AUTHORITY_CONSOLE
            </h1>
            <p className="text-cyan-900 text-xs mt-1 uppercase tracking-widest">
              Root access granted | Mission control
            </p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="hacker-btn border-cyan-900 text-cyan-900 hover:text-cyan-500 hover:border-cyan-500"
          >
            RETURN_TO_BASE
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Challenge Management */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={20} /> Challenge_Repository
              </h2>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="hacker-btn text-xs flex items-center gap-2 border-cyan-500 text-cyan-500"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />} 
                {showAddForm ? "CANCEL_UPLOAD" : "NEW_INTEL_PKG"}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddChallenge} className="hacker-card border-cyan-900 bg-cyan-950/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-cyan-800 uppercase">Level ID</label>
                    <input 
                      type="number" 
                      className="hacker-input text-sm p-2 border-cyan-900" 
                      value={newChallenge.levelId}
                      onChange={(e) => setNewChallenge({...newChallenge, levelId: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-cyan-800 uppercase">Points</label>
                    <input 
                      type="number" 
                      className="hacker-input text-sm p-2 border-cyan-900" 
                      value={newChallenge.points}
                      onChange={(e) => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyan-800 uppercase">Title</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-cyan-900" 
                    placeholder="MISSION_NAME"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyan-800 uppercase">Clue/Intel</label>
                  <textarea 
                    className="hacker-input text-sm p-2 border-cyan-900 h-24" 
                    placeholder="Provide mission briefing..."
                    value={newChallenge.clue}
                    onChange={(e) => setNewChallenge({...newChallenge, clue: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-cyan-800 uppercase">Flag</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-cyan-900" 
                    placeholder="Enter the plain text flag or number"
                    value={newChallenge.flag}
                    onChange={(e) => setNewChallenge({...newChallenge, flag: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full hacker-btn border-cyan-500 text-cyan-500 mt-4">
                  INITIALIZE_CHALLENGE_DEPLOYMENT
                </button>
              </form>
            )}

            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="hacker-card border-green-900/50 hover:border-green-500 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <span className="text-xs bg-green-900/20 px-2 py-1 text-green-500 border border-green-900">
                        LVL_{challenge.levelId.toString().padStart(2, '0')}
                      </span>
                      <h3 className="font-bold text-green-400 uppercase tracking-tight">{challenge.title}</h3>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-green-800 hover:text-green-500"><Edit2 size={16} /></button>
                      <button 
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="p-1 text-green-800 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] uppercase font-mono">
                    <div>
                      <span className="text-green-900">Flag:</span> <span className="text-green-500">{challenge.flag}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-900">Points:</span> <span className="text-green-500">{challenge.points}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Overview */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={20} /> Operative_Status
            </h2>
            <div className="hacker-card border-cyan-900/50">
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.uid} className="border-b border-cyan-900/30 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-cyan-400 uppercase">{user.username}</span>
                      <span className={`text-[8px] px-1 border ${user.role === 'admin' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-cyan-900">
                      <span>LVL: {user.currentLevel}</span>
                      <span>PTS: {user.totalPoints}</span>
                    </div>
                    <div className="mt-2 w-full bg-cyan-950 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full transition-all duration-1000" 
                        style={{ width: `${(user.currentLevel / 25) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
