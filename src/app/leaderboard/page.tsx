"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Terminal, Trophy, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  uid: string;
  username: string;
  totalPoints: number;
  currentLevel: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("totalPoints", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboardData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setData(leaderboardData);
    });

    return () => unsubscribe();
  }, []);

  const chartData = data.map(user => ({
    name: user.username,
    points: user.totalPoints,
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-green-900 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="p-2 border border-green-900 text-green-800 hover:text-green-500 hover:border-green-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-green-500 tracking-tighter flex items-center gap-3">
                <Trophy size={32} /> LIVE_LEADERBOARD
              </h1>
              <p className="text-green-800 text-xs mt-1 uppercase tracking-widest">
                Real-time field intelligence overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-800">
            <Users size={16} />
            <span className="text-xs uppercase font-mono tracking-tighter">Active Operatives: {data.length}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Chart */}
          <div className="hacker-card min-h-[400px]">
            <h2 className="text-sm font-bold text-green-500 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> Points_Distribution_Chart
            </h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#004400" 
                    fontSize={10} 
                    tick={{ fill: '#004400' }}
                  />
                  <YAxis 
                    stroke="#004400" 
                    fontSize={10} 
                    tick={{ fill: '#004400' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      border: '1px solid #00ff00',
                      borderRadius: '0',
                      color: '#00ff00'
                    }}
                    itemStyle={{ color: '#00ff00' }}
                    cursor={{ fill: 'rgba(0, 255, 0, 0.05)' }}
                  />
                  <Bar dataKey="points">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00ffff' : '#00ff00'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="hacker-card">
            <h2 className="text-sm font-bold text-green-500 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> Ranking_Manifest
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-green-900 text-[10px] text-green-900 uppercase">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Operative</th>
                    <th className="py-3 px-4 text-center">Level</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {data.map((user, index) => (
                    <tr 
                      key={user.uid} 
                      className={`border-b border-green-900/30 hover:bg-green-500/5 transition-colors ${index === 0 ? "text-cyan-400" : "text-green-500"}`}
                    >
                      <td className="py-4 px-4 font-bold">
                        {index + 1 === 1 ? "TOP_SPEC" : `#${(index + 1).toString().padStart(2, '0')}`}
                      </td>
                      <td className="py-4 px-4 uppercase">{user.username}</td>
                      <td className="py-4 px-4 text-center">{user.currentLevel}</td>
                      <td className="py-4 px-4 text-right font-bold">{user.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
