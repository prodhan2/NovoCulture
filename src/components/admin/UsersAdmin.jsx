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
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
        <button
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-2 text-black font-bold hover:text-[var(--accent-terracotta)] transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          তালিকায় ফিরে যান
        </button>

        <div className="rounded-3xl border-2 border-[var(--accent-terracotta)] bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b-2 border-[var(--accent-terracotta)]/10">
            <div className="h-32 w-32 rounded-full border-4 border-[var(--accent-terracotta)] overflow-hidden bg-[var(--bg-cream)]">
              {selectedUser.photoURL ? (
                <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-black">
                  <User className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-black mb-2">{selectedUser.displayName || "নামহীন ব্যবহারকারী"}</h2>
              <p className="text-xl text-black font-bold opacity-60">{selectedUser.email}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                  <Info className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  ব্যক্তিগত তথ্য
                </h3>
                <div className="grid gap-6">
                  <InfoItem label="ফোন" value={selectedUser.phone} icon={<Phone className="h-5 w-5" />} />
                  <InfoItem label="পেশা" value={selectedUser.occupation} icon={<Briefcase className="h-5 w-5" />} />
                  <InfoItem label="লিঙ্গ" value={selectedUser.gender} icon={<User className="h-5 w-5" />} />
                  <InfoItem label="জন্ম তারিখ" value={selectedUser.dob} icon={<Calendar className="h-5 w-5" />} />
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  ঠিকানা
                </h3>
                <div className="p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-[var(--accent-terracotta)]/10">
                  <p className="text-lg font-bold text-black">{selectedUser.address || "ঠিকানা দেওয়া হয়নি"}</p>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  সামাজিক যোগাযোগ মাধ্যম
                </h3>
                <div className="grid gap-4">
                  <SocialItem label="Facebook" value={selectedUser.facebook} />
                  <SocialItem label="Twitter" value={selectedUser.twitter} />
                  <SocialItem label="Instagram" value={selectedUser.instagram} />
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                  <Info className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  জীবনী (Bio)
                </h3>
                <div className="p-6 rounded-2xl bg-[var(--bg-cream)] border-2 border-[var(--accent-terracotta)]/10">
                  <p className="text-lg font-medium text-black leading-relaxed">
                    {selectedUser.bio || "ব্যবহারকারী এখনো কোনো জীবনী লেখেননি।"}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-black text-black tracking-tight">ব্যবহারকারী তালিকা ({users.length})</h2>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white text-black font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-6 p-4 rounded-3xl border-2 border-[var(--accent-terracotta)]/10 bg-white shadow-sm">
              <Shimmer width="64px" height="64px" borderRadius="50%" />
              <div className="flex-1 space-y-2">
                <Shimmer width="150px" height="1.25rem" />
                <Shimmer width="200px" height="1rem" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="group flex items-center gap-6 p-4 rounded-3xl border-2 border-[var(--accent-terracotta)] bg-white hover:bg-[var(--accent-terracotta)] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="h-16 w-16 rounded-full border-2 border-[var(--accent-terracotta)] overflow-hidden bg-[var(--bg-cream)] shrink-0 group-hover:border-white">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-black">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black truncate">{user.displayName || "নামহীন"}</h3>
                <p className="font-bold opacity-60 truncate">{user.email}</p>
              </div>
              <div className="hidden sm:block px-4 py-2 rounded-xl bg-[var(--bg-cream)] text-black text-xs font-black uppercase tracking-widest group-hover:bg-white/20 group-hover:text-white">
                বিস্তারিত দেখুন
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-[var(--accent-terracotta)]/30 p-20 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-black/20" />
          <p className="text-xl font-black text-black/40">কোনো ব্যবহারকারী পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">{label}</p>
        <p className="text-lg font-black text-black">{value || "দেওয়া হয়নি"}</p>
      </div>
    </div>
  );
}

function SocialItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-[var(--accent-terracotta)]/10">
      <span className="font-black text-black">{label}</span>
      {value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-terracotta)] font-bold hover:underline truncate max-w-[200px]">
          {value}
        </a>
      ) : (
        <span className="text-black/40 font-bold italic">সংযুক্ত নেই</span>
      )}
    </div>
  );
}
