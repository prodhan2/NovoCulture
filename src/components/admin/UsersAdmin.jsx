import { useState, useEffect } from "react";
import { getAllUsers } from "../../services/firestore";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Globe, Info, ArrowLeft, Loader2, Search } from "lucide-react";
import Shimmer from "../common/Shimmer";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedUser) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
        {/* Compact Header Area */}
        <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="p-3 rounded-xl border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                প্রোফাইল ডিটেইলস
              </h1>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
                ব্যবহারকারীর বিস্তারিত তথ্য দেখুন
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 lg:px-10 pb-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Basic Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-3xl border-2 border-black/5 p-8 text-center space-y-6 shadow-sm">
                <div className="h-32 w-32 rounded-full border-4 border-[var(--accent-terracotta)] mx-auto overflow-hidden bg-black/5 shadow-xl">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-black/10">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-black leading-tight">{selectedUser.displayName || "নামহীন"}</h2>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <SocialItem label="Facebook" value={selectedUser.facebook} />
                <SocialItem label="Twitter" value={selectedUser.twitter} />
                <SocialItem label="Instagram" value={selectedUser.instagram} />
              </div>
            </div>

            {/* Right: Detailed Info */}
            <div className="lg:col-span-8 space-y-12">
              <div className="grid gap-8 sm:grid-cols-2">
                <InfoItem label="ফোন" value={selectedUser.phone} icon={<Phone className="h-4 w-4" />} />
                <InfoItem label="পেশা" value={selectedUser.occupation} icon={<Briefcase className="h-4 w-4" />} />
                <InfoItem label="লিঙ্গ" value={selectedUser.gender} icon={<User className="h-4 w-4" />} />
                <InfoItem label="জন্ম তারিখ" value={selectedUser.dob} icon={<Calendar className="h-4 w-4" />} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] px-1">ঠিকানা</label>
                <div className="p-6 rounded-2xl bg-black/5 border-2 border-black/5">
                  <p className="text-sm font-bold text-black leading-relaxed">{selectedUser.address || "ঠিকানা দেওয়া হয়নি"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] px-1">জীবনী (Bio)</label>
                <div className="p-6 rounded-2xl bg-black/5 border-2 border-black/5">
                  <p className="text-sm font-bold text-black leading-relaxed italic">
                    {selectedUser.bio || "ব্যবহারকারী এখনো কোনো জীবনী লেখেননি।"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            ব্যবহারকারী তালিকা
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            মোট {users.length} জন নিবন্ধিত ব্যবহারকারী
          </p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
          <input
            type="text"
            placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[var(--accent-terracotta)] bg-white text-xs font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 transition-all text-black placeholder:text-black/10"
          />
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-10 pb-20">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-white border-2 border-black/5 animate-pulse" />)}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="group relative flex items-center gap-4 p-4 rounded-2xl border-2 border-black/5 bg-white hover:border-[var(--accent-terracotta)] hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Serial Indicator */}
                <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center text-[8px] font-black border-2 border-[var(--accent-terracotta)] z-10">
                  {index + 1}
                </div>

                <div className="h-12 w-12 rounded-full border-2 border-black/5 overflow-hidden bg-black/5 shrink-0 group-hover:border-black/20 transition-colors">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-black/10">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-black truncate leading-tight group-hover:text-[var(--accent-terracotta)] transition-colors">{user.displayName || "নামহীন"}</h3>
                  <p className="text-[10px] font-bold text-black/30 truncate">{user.email}</p>
                </div>
                <div className="p-2 rounded-lg bg-black/5 text-black/20 group-hover:bg-[var(--accent-terracotta)] group-hover:text-white transition-all">
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[3rem] border-4 border-dashed border-black/5 p-20 text-center bg-white/50">
            <User className="h-12 w-12 mx-auto mb-4 text-black/10" />
            <p className="text-lg font-black text-black/20 uppercase tracking-widest">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-black/5 bg-white shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-black/5 text-black flex items-center justify-center shrink-0 border border-black/5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-0.5">{label}</p>
        <p className="text-sm font-black text-black truncate">{value || "দেওয়া হয়নি"}</p>
      </div>
    </div>
  );
}

function SocialItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-black/5 bg-white group hover:border-[var(--accent-terracotta)] transition-all">
      <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">{label}</span>
      {value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-black hover:text-[var(--accent-terracotta)] hover:underline truncate max-w-[150px]">
          {value.replace(/^https?:\/\/(www\.)?/, '')}
        </a>
      ) : (
        <span className="text-[9px] font-bold italic text-black/10">নেই</span>
      )}
    </div>
  );
}
