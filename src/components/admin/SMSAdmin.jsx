import { useState, useEffect } from "react";
import { getAllUsers, getJoinRegistrations, getSettings, setSettings, getDonations } from "../../services/firestore";
import { sendSMS, getSMSBalance, SMSErrorCodes } from "../../services/sms";
import { 
  Send, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wallet, 
  Search, 
  Phone,
  Mail,
  User,
  UserCheck,
  UserMinus,
  CheckSquare,
  Square,
  Settings,
  Save,
  Key,
  Smartphone,
  Tag
} from "lucide-react";

import { useTranslation } from "react-i18next";

export default function SMSAdmin() {
  const { t } = useTranslation();
  const [recipients, setRecipients] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: string }
  const [activeSourceFilter, setActiveSourceFilter] = useState("all");

  // SMS API Settings
  const [smsSettings, setSmsSettings] = useState({
    apiKey: "",
    senderId: ""
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function init() {
      try {
        if (isMounted) {
          setLoading(true);
          // Run these in parallel but handle them carefully
          const results = await Promise.allSettled([
            fetchData(isMounted),
            fetchSettingsAndBalance(isMounted)
          ]);
          
          results.forEach((result, idx) => {
            if (result.status === "rejected") {
              console.error(`SMS Admin Init task ${idx} failed:`, result.reason);
            }
          });
        }
      } catch (error) {
        console.error("SMS Admin Init overall failed:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  async function fetchSettingsAndBalance(isMounted = true) {
    try {
      const settings = await getSettings();
      if (!isMounted) return;
      
      if (settings?.sms) {
        setSmsSettings(settings.sms);
        if (settings.sms.apiKey) {
          const balanceData = await getSMSBalance(settings.sms.apiKey);
          if (isMounted && balanceData && balanceData.balance !== undefined) {
            setBalance(balanceData.balance);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings/balance:", error);
    }
  }

  async function saveSmsSettings() {
    try {
      setSavingSettings(true);
      await setSettings({ sms: smsSettings });
      setIsEditingSettings(false);
      setStatus({ type: "success", text: "SMS সেটিংস সফলভাবে সংরক্ষিত হয়েছে।" });
      await fetchSettingsAndBalance();
    } catch (error) {
      setStatus({ type: "error", text: "সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।" });
    } finally {
      setSavingSettings(false);
    }
  }

  async function fetchData(isMounted = true) {
    try {
      const [usersData, registrationsData, donationsData] = await Promise.all([
        getAllUsers(),
        getJoinRegistrations(),
        getDonations()
      ]);

      if (!isMounted) return;

      const users = Array.isArray(usersData) ? usersData : [];
      const registrations = Array.isArray(registrationsData) ? registrationsData : [];
      const donations = Array.isArray(donationsData) ? donationsData : [];

      console.log("Raw Users:", users.length, "Raw Registrations:", registrations.length, "Raw Donations:", donations.length);

      // Combine and deduplicate by phone number
      const combined = [
        ...users.map(u => ({ 
          id: u.id ? `u-${u.id}` : `u-temp-${Math.random().toString(36).substr(2, 9)}`, 
          name: u.displayName || u.name || "ব্যবহারকারী", 
          phone: u.phone, 
          source: "ব্যবহারকারী",
          email: u.email,
          photoURL: u.photoURL
        })),
        ...registrations.map(r => ({ 
          id: r.id ? `r-${r.id}` : `r-temp-${Math.random().toString(36).substr(2, 9)}`, 
          name: r.name || "নিবন্ধিত", 
          phone: r.phone, 
          source: `নিবন্ধন (${r.category || 'অন্যান্য'})`,
          email: r.email,
          photoURL: null 
        })),
        ...donations.map(d => ({
          id: d.id ? `d-${d.id}` : `d-temp-${Math.random().toString(36).substr(2, 9)}`,
          name: d.name || "দাতা",
          phone: d.phone,
          source: "অনুদান",
          email: d.email || "",
          photoURL: null
        }))
      ];

      // Filter out those without phone numbers and deduplicate
      const valid = combined.filter(c => {
        if (!c.phone) return false;
        const cleanPhone = String(c.phone).replace(/[^\d]/g, "");
        return cleanPhone.length >= 10;
      });
      
      // Use phone number as key for deduplication
      const uniqueMap = new Map();
      valid.forEach(item => {
        const cleanPhone = String(item.phone).replace(/[^\d]/g, "");
        // If we already have this phone, prefer the one with a name if the current one is "নিবন্ধিত" or "ব্যবহারকারী" or "দাতা"
        if (!uniqueMap.has(cleanPhone)) {
          uniqueMap.set(cleanPhone, item);
        } else {
          const existing = uniqueMap.get(cleanPhone);
          if (item.name && item.name !== "ব্যবহারকারী" && item.name !== "নিবন্ধিত" && item.name !== "দাতা") {
            uniqueMap.set(cleanPhone, item);
          }
        }
      });
      
      const unique = Array.from(uniqueMap.values());
      console.log("Unique SMS recipients:", unique.length);
      setRecipients(unique);
    } catch (error) {
      console.error("Error fetching SMS data:", error);
    }
  }


  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const filteredRecipients = recipients.filter(r => {
    const name = (r.name || "").toLowerCase();
    const phone = String(r.phone || "");
    const email = (r.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = 
      name.includes(query) ||
      phone.includes(query) ||
      email.includes(query);
    
    const matchesSource = activeSourceFilter === "all" || (r.source && r.source.includes(activeSourceFilter));
    
    return matchesSearch && matchesSource;
  });

  const sources = ["all", "ব্যবহারকারী", "অনুদান", "donor", "members", "volunteer", "careers"];

  async function handleSend() {
    if (!smsSettings.apiKey || !smsSettings.senderId) {
      setStatus({ type: "error", text: "দয়া করে প্রথমে SMS API সেটিংস কনফিগার করুন।" });
      setIsEditingSettings(true);
      return;
    }
    if (selectedIds.size === 0) {
      setStatus({ type: "error", text: "দয়া করে অন্তত একজন প্রাপক নির্বাচন করুন।" });
      return;
    }
    if (!message.trim()) {
      setStatus({ type: "error", text: "দয়া করে একটি বার্তা লিখুন।" });
      return;
    }

    const selectedNumbers = recipients
      .filter(r => selectedIds.has(r.id))
      .map(r => String(r.phone || "").replace(/[^\d]/g, "")) // Clean numbers
      .join(",");

    try {
      setSending(true);
      setStatus(null);
      const result = await sendSMS(smsSettings.apiKey, smsSettings.senderId, selectedNumbers, message);
      
      if (result.response_code === "202") {
        setStatus({ type: "success", text: "বার্তা সফলভাবে পাঠানো হয়েছে!" });
        setMessage("");
        setSelectedIds(new Set());
        fetchSettingsAndBalance(); // Refresh balance
      } else {
        const errorMsg = SMSErrorCodes[result.response_code] || "বার্তা পাঠাতে ব্যর্থ হয়েছে।";
        setStatus({ type: "error", text: `ত্রুটি (${result.response_code}): ${errorMsg}` });
      }
    } catch (error) {
      setStatus({ type: "error", text: "সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।" });
    } finally {
      setSending(false);
    }
  }

  const adjustHeight = (e) => {
    const target = e.target || e;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustHeight);
      }, 100);
    }
  }, [loading, isEditingSettings, message]);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            SMS ব্রডকাস্ট
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            ব্যবহারকারীদের SMS পাঠান এবং API কনফিগার করুন
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
              isEditingSettings 
                ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]" 
                : "bg-white text-[var(--accent-terracotta)] border-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white"
            }`}
          >
            <Settings className={`h-4 w-4 ${isEditingSettings ? "animate-spin-slow" : ""}`} />
            <span>API সেটিংস</span>
          </button>

          <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)]">
            <Wallet className="h-4 w-4 text-[var(--accent-terracotta)]" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/40">ব্যালেন্স</p>
              <p className="text-base font-black leading-none">৳{balance || "0.00"}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 lg:px-10 flex h-48 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : (
        <div className="px-4 sm:px-8 lg:px-10 pb-20 w-full space-y-12">
          
          {/* API Settings Section - Horizontal Style */}
          {isEditingSettings && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pb-12 border-b-2 border-black/5">
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  API Key
                </label>
                <div className="md:col-span-3">
                  <textarea
                    rows={1}
                    value={smsSettings.apiKey}
                    onInput={adjustHeight}
                    onChange={(e) => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                    placeholder="bulksmsbd.net API Key লিখুন"
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  Sender ID
                </label>
                <div className="md:col-span-3">
                  <textarea
                    rows={1}
                    value={smsSettings.senderId}
                    onInput={adjustHeight}
                    onChange={(e) => setSmsSettings({ ...smsSettings, senderId: e.target.value })}
                    placeholder="Approved Sender ID লিখুন"
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                  />
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={saveSmsSettings}
                      disabled={savingSettings}
                      className="flex items-center gap-3 rounded-xl bg-[var(--accent-terracotta)] px-10 py-4 text-sm font-black text-white shadow-xl shadow-[var(--accent-terracotta)]/10 transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 uppercase tracking-widest border-2 border-[var(--accent-terracotta)]"
                    >
                      {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      <span>{savingSettings ? "সেভ হচ্ছে…" : "সেটিংস সেভ করুন"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 animate-in fade-in slide-in-from-left-4 duration-500 md:ml-[25%] ${
              status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {status.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="text-sm font-black tracking-tight">{status.text}</span>
            </div>
          )}

          <div className="grid gap-16 lg:grid-cols-12">
            {/* Left: Message Input - Horizontal Style */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 md:gap-8 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  বার্তা লিখুন
                </label>
                <div className="md:col-span-2 space-y-4">
                  <textarea
                    rows={4}
                    value={message}
                    onInput={adjustHeight}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="এখানে আপনার বার্তাটি লিখুন..."
                    className="w-full rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white px-6 py-5 text-lg font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[160px]"
                  />
                  <div className="flex justify-between px-2 text-[10px] font-black uppercase tracking-widest text-black/40">
                    <span>অক্ষর: {message.length}</span>
                    <span>SMS: {Math.ceil(message.length / 160) || 0}</span>
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={sending || selectedIds.size === 0 || !message.trim()}
                    className="w-full py-6 rounded-2xl bg-[var(--accent-terracotta)] text-white font-black text-xl flex items-center justify-center gap-4 transition-all hover:opacity-90 hover:-translate-y-1 active:scale-95 disabled:opacity-30 border-2 border-[var(--accent-terracotta)] shadow-2xl shadow-[var(--accent-terracotta)]/20"
                  >
                    {sending ? <Loader2 className="h-8 w-8 animate-spin" /> : <Send className="h-8 w-8" />}
                    <span>নির্বাচিত {selectedIds.size} জনকে পাঠান</span>
                  </button>
                  
                  <div className="p-4 rounded-xl bg-black/5 text-[10px] font-bold text-black/60 flex gap-2 items-center">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>bulksmsbd.net API ব্যবহার করা হবে। বাংলায় বার্তা পাঠানো নিরাপদ।</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recipient Selection - Compact List */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {sources.map(source => (
                    <button
                      key={source}
                      onClick={() => setActiveSourceFilter(source)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                        activeSourceFilter === source
                          ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]"
                          : "bg-white text-black border-black/10 hover:border-[var(--accent-terracotta)]"
                      }`}
                    >
                      {source === "all" ? "সবগুলো" : source === "ব্যবহারকারী" ? "ইউজার" : t(`join.${source}`, source)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="নাম বা ফোন..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-[var(--accent-terracotta)] focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-xs font-bold text-black placeholder:text-black/20"
                    />
                  </div>
                  
                  <button
                    onClick={selectAll}
                    className="px-4 py-3 rounded-xl bg-white border-2 border-[var(--accent-terracotta)] text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white transition-all whitespace-nowrap"
                  >
                    {selectedIds.size === filteredRecipients.length && filteredRecipients.length > 0 ? "বাদ দিন" : "সব সিলেক্ট"}
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient, index) => (
                    <div
                      key={recipient.id}
                      onClick={() => toggleSelect(recipient.id)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedIds.has(recipient.id)
                          ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]"
                          : "bg-white text-black border-black/10 hover:border-[var(--accent-terracotta)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black border ${
                          selectedIds.has(recipient.id) ? "bg-white text-[var(--accent-terracotta)] border-white" : "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black truncate leading-tight">{recipient.name || "অজানা"}</p>
                          <p className={`text-[10px] font-bold ${selectedIds.has(recipient.id) ? "text-white/60" : "text-black/40"}`}>{recipient.phone}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        selectedIds.has(recipient.id) ? "bg-white text-[var(--accent-terracotta)] border-white" : "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]"
                      }`}>
                        {recipient.source}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-black/5 rounded-3xl border-2 border-dashed border-black/10">
                    <p className="text-sm font-black text-black/20">কোনো প্রাপক পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
