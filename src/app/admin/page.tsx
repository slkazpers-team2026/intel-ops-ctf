"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Terminal, Plus, Trash2, Edit2, ShieldCheck, Users, Save, X, UserMinus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Challenge {
  id: string;
  levelId: number;
  title: string;
  clue: string;
  points: number;
  flag: string;
  formatGuide?: string;
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
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    levelId: 1,
    title: "",
    clue: "",
    points: 100,
    flag: "",
    formatGuide: ""
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
      setNewChallenge({ levelId: challenges.length + 1, title: "", clue: "", points: 100, flag: "", formatGuide: "" });
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

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChallenge || !isEditing) return;
    
    try {
      const { id, ...data } = editChallenge;
      await setDoc(doc(db, "challenges", isEditing), data, { merge: true });
      setIsEditing(null);
      setEditChallenge(null);
    } catch (err) {
      console.error("Error updating challenge:", err);
    }
  };

  const handleResetScore = async (uid: string) => {
    if (confirm("RESET_OPERATIVE_SCORE_TO_ZERO?")) {
      try {
        await setDoc(doc(db, "users", uid), { 
          totalPoints: 0,
          currentLevel: 1 
        }, { merge: true });
      } catch (err) {
        console.error("Error resetting score:", err);
      }
    }
  };

  const handleRemoveUser = async (uid: string) => {
    if (confirm("PERMANENTLY_REMOVE_OPERATIVE_FROM_SYSTEM?")) {
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (err) {
        console.error("Error removing user:", err);
      }
    }
  };

  const startEditing = (challenge: Challenge) => {
    setIsEditing(challenge.id);
    setEditChallenge(challenge);
    setShowAddForm(false);
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-cyan-500 uppercase">Deploy_New_Intel</h3>
                  <X size={16} className="text-cyan-900 cursor-pointer" onClick={() => setShowAddForm(false)} />
                </div>
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
                <div className="space-y-1">
                  <label className="text-[10px] text-cyan-800 uppercase">Format Guide</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-cyan-900" 
                    placeholder="e.g. xxxxxxxxxx or xxxxxxx@xxxxx.xxx"
                    value={newChallenge.formatGuide}
                    onChange={(e) => setNewChallenge({...newChallenge, formatGuide: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full hacker-btn border-cyan-500 text-cyan-500 mt-4">
                  INITIALIZE_CHALLENGE_DEPLOYMENT
                </button>
              </form>
            )}

            {isEditing && editChallenge && (
              <form onSubmit={handleUpdateChallenge} className="hacker-card border-yellow-600 bg-yellow-950/5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-yellow-500 uppercase">Modify_Intel_Package: {editChallenge.title}</h3>
                  <X size={16} className="text-yellow-900 cursor-pointer" onClick={() => setIsEditing(null)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-yellow-800 uppercase">Level ID</label>
                    <input 
                      type="number" 
                      className="hacker-input text-sm p-2 border-yellow-900 focus:border-yellow-500" 
                      value={editChallenge.levelId}
                      onChange={(e) => setEditChallenge({...editChallenge, levelId: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-yellow-800 uppercase">Points</label>
                    <input 
                      type="number" 
                      className="hacker-input text-sm p-2 border-yellow-900 focus:border-yellow-500" 
                      value={editChallenge.points}
                      onChange={(e) => setEditChallenge({...editChallenge, points: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-yellow-800 uppercase">Title</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-yellow-900 focus:border-yellow-500" 
                    value={editChallenge.title}
                    onChange={(e) => setEditChallenge({...editChallenge, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-yellow-800 uppercase">Clue/Intel</label>
                  <textarea 
                    className="hacker-input text-sm p-2 border-yellow-900 h-24 focus:border-yellow-500" 
                    value={editChallenge.clue}
                    onChange={(e) => setEditChallenge({...editChallenge, clue: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-yellow-800 uppercase">Flag</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-yellow-900 focus:border-yellow-500" 
                    value={editChallenge.flag}
                    onChange={(e) => setEditChallenge({...editChallenge, flag: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-yellow-800 uppercase">Format Guide</label>
                  <input 
                    type="text" 
                    className="hacker-input text-sm p-2 border-yellow-900 focus:border-yellow-500" 
                    value={editChallenge.formatGuide || ""}
                    onChange={(e) => setEditChallenge({...editChallenge, formatGuide: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="flex-1 hacker-btn border-yellow-500 text-yellow-500">
                    SAVE_MODIFICATIONS
                  </button>
                  <button type="button" onClick={() => setIsEditing(null)} className="hacker-btn border-gray-700 text-gray-700">
                    ABORT
                  </button>
                </div>
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
                      <button 
                        onClick={() => startEditing(challenge)}
                        className="p-1 text-green-800 hover:text-green-500"
                      >
                        <Edit2 size={16} />
                      </button>
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

          {/* User Management Overview */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={20} /> Admin_User_Management
            </h2>
            <div className="hacker-card border-cyan-900/50 p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="bg-cyan-950/20 text-[10px] text-cyan-800 uppercase border-b border-cyan-900/50">
                      <th className="py-3 px-4">Operative</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-900/20">
                    {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-cyan-500/5 transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-cyan-400 uppercase leading-none">{user.username}</span>
                            <span className="text-[9px] text-cyan-900 mt-1">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] text-cyan-700">
                              <span>LVL: {user.currentLevel}</span>
                              <span>PTS: {user.totalPoints}</span>
                            </div>
                            <div className="w-24 bg-cyan-950 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-cyan-500 h-full transition-all duration-1000" 
                                style={{ width: `${Math.min((user.currentLevel / 25) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleResetScore(user.uid)}
                              title="Reset Score"
                              className="p-1.5 border border-cyan-900 text-cyan-900 hover:text-yellow-500 hover:border-yellow-500 transition-colors"
                            >
                              <RotateCcw size={14} />
                            </button>
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleRemoveUser(user.uid)}
                                title="Remove User"
                                className="p-1.5 border border-cyan-900 text-cyan-900 hover:text-red-500 hover:border-red-500 transition-colors"
                              >
                                <UserMinus size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
