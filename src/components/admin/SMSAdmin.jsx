import { useState, useEffect } from "react";
import { getAllUsers, getJoinRegistrations, getSettings, setSettings } from "../../services/firestore";
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
  UserCheck,
  UserMinus,
  CheckSquare,
  Square,
  Settings,
  Save,
  Key,
  Smartphone
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
    fetchData();
    fetchSettingsAndBalance();
  }, []);

  async function fetchSettingsAndBalance() {
    try {
      const settings = await getSettings();
      if (settings?.sms) {
        setSmsSettings(settings.sms);
        if (settings.sms.apiKey) {
          const balanceData = await getSMSBalance(settings.sms.apiKey);
          if (balanceData && balanceData.balance) {
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
      if (smsSettings.apiKey) {
        const balanceData = await getSMSBalance(smsSettings.apiKey);
        if (balanceData && balanceData.balance) {
          setBalance(balanceData.balance);
        }
      }
    } catch (error) {
      setStatus({ type: "error", text: "সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।" });
    } finally {
      setSavingSettings(false);
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      const [users, registrations] = await Promise.all([
        getAllUsers(),
        getJoinRegistrations()
      ]);

      // Combine and deduplicate by phone number
      const combined = [
        ...users.map(u => ({ 
          id: `u-${u.id}`, 
          name: u.displayName || "ব্যবহারকারী", 
          phone: u.phone, 
          source: "ব্যবহারকারী",
          email: u.email,
          photoURL: u.photoURL
        })),
        ...registrations.map(r => ({ 
          id: `r-${r.id}`, 
          name: r.name || "নিবন্ধিত", 
          phone: r.phone, 
          source: `নিবন্ধন (${r.category})`,
          email: r.email,
          photoURL: null // Registrations don't usually have photos in this schema
        }))
      ];

      // Filter out those without phone numbers and deduplicate
      const valid = combined.filter(c => c.phone && c.phone.trim().length >= 10);
      const unique = Array.from(new Map(valid.map(item => [item.phone, item])).values());
      
      setRecipients(unique);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = activeSourceFilter === "all" || r.source.includes(activeSourceFilter);
    
    return matchesSearch && matchesSource;
  });

  const sources = ["all", "ব্যবহারকারী", "donor", "members", "volunteer", "careers"];

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
      .map(r => r.phone.replace(/[^\d]/g, "")) // Clean numbers
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

  return (
    <div className="space-y-6">
      {/* Header & Balance & Settings Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">SMS ব্রডকাস্ট</h2>
          <p className="text-sm font-bold text-black/60">ব্যবহারকারীদের SMS পাঠান</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
              isEditingSettings 
                ? "bg-black text-white border-black" 
                : "bg-white text-black border-black/5 hover:border-black/20"
            }`}
          >
            <Settings className={`h-5 w-5 ${isEditingSettings ? "animate-spin-slow" : ""}`} />
            <span>API সেটিংস</span>
          </button>

          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-black text-white shadow-xl shadow-black/10">
            <Wallet className="h-5 w-5 text-orange-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">বর্তমান ব্যালেন্স</p>
              <p className="text-lg font-black">৳{balance || "0.00"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Settings Panel */}
      {isEditingSettings && (
        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-black shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-black">SMS API কনফিগারেশন</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black/40 px-1 flex items-center gap-2">
                <Key className="h-3 w-3" />
                API Key
              </label>
              <input
                type="text"
                value={smsSettings.apiKey}
                onChange={(e) => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                placeholder="bulksmsbd.net API Key লিখুন"
                className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black/40 px-1 flex items-center gap-2">
                <Smartphone className="h-3 w-3" />
                Sender ID
              </label>
              <input
                type="text"
                value={smsSettings.senderId}
                onChange={(e) => setSmsSettings({ ...smsSettings, senderId: e.target.value })}
                placeholder="Approved Sender ID লিখুন"
                className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-black"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSmsSettings}
              disabled={savingSettings}
              className="px-8 py-4 rounded-2xl bg-black text-white font-black flex items-center gap-3 transition-all hover:bg-black/80 active:scale-95 disabled:opacity-30"
            >
              {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
          status.type === "success" ? "bg-green-50 text-green-700 border-2 border-green-100" : "bg-red-50 text-red-700 border-2 border-red-100"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-bold">{status.text}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Message Input */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white border-2 border-black/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-6 w-6 text-[var(--accent-terracotta)]" />
              <h3 className="text-xl font-black text-black">বার্তা লিখুন</h3>
            </div>
            
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="এখানে আপনার বার্তাটি লিখুন..."
                className="w-full h-40 p-6 rounded-3xl bg-[var(--bg-cream)] border-2 border-[var(--accent-terracotta)]/10 focus:border-[var(--accent-terracotta)] outline-none transition-all font-medium text-black resize-none"
              />
              <div className="flex justify-between px-2 text-[10px] font-black uppercase tracking-widest text-black/40">
                <span>অক্ষর সংখ্যা: {message.length}</span>
                <span>বার্তা সংখ্যা: {Math.ceil(message.length / 160) || 0}</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || selectedIds.size === 0 || !message.trim()}
              className="w-full py-4 rounded-2xl bg-black text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-black/80 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-xl shadow-black/20"
            >
              {sending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
              <span>নির্বাচিত {selectedIds.size} জনকে SMS পাঠান</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-orange-50 border-2 border-orange-100 text-orange-800 text-sm font-medium">
            <p className="flex gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              SMS পাঠানোর জন্য bulksmsbd.net এর API ব্যবহার করা হবে। মাস্কিং SMS হলে অবশ্যই বাংলায় পাঠাতে হবে।
            </p>
          </div>
        </div>

        {/* Right: Recipient Selection */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 px-2">
            <div className="flex flex-wrap gap-2">
              {sources.map(source => (
                <button
                  key={source}
                  onClick={() => setActiveSourceFilter(source)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    activeSourceFilter === source
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white text-black border-black/5 hover:border-black/20"
                  }`}
                >
                  {source === "all" ? "সবগুলো" : source === "ব্যবহারকারী" ? "ইউজার" : t(`join.${source}`, source)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-black/5 focus:border-[var(--accent-terracotta)] outline-none transition-all text-sm font-bold"
                />
              </div>
              
              <button
                onClick={selectAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-black/5 text-sm font-bold hover:bg-black/5 transition-all whitespace-nowrap"
              >
                {selectedIds.size === filteredRecipients.length && filteredRecipients.length > 0 ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                {selectedIds.size === filteredRecipients.length && filteredRecipients.length > 0 ? "সবগুলো বাদ দিন" : "ফিল্টার্ড সিলেক্ট করুন"}
              </button>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-white animate-pulse border-2 border-black/5" />
              ))
            ) : filteredRecipients.length > 0 ? (
              filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  onClick={() => toggleSelect(recipient.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedIds.has(recipient.id)
                      ? "bg-white border-[var(--accent-terracotta)] shadow-md"
                      : "bg-white border-black/5 hover:border-black/20"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`h-12 w-12 rounded-full border-2 overflow-hidden flex items-center justify-center ${
                        selectedIds.has(recipient.id) ? "border-[var(--accent-terracotta)]" : "border-black/5"
                      }`}>
                        {recipient.photoURL ? (
                          <img src={recipient.photoURL} alt={recipient.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-[var(--bg-cream)] flex items-center justify-center text-black/20">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      {selectedIds.has(recipient.id) && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                          <CheckSquare className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-black truncate text-sm sm:text-base">{recipient.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-black/40 uppercase tracking-widest">
                          <Phone className="h-3 w-3" />
                          <span>{recipient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--accent-terracotta)] uppercase tracking-widest bg-[var(--accent-terracotta)]/5 px-2 py-0.5 rounded-full">
                          <span>{recipient.source}</span>
                        </div>
                      </div>
                      {recipient.email && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-black/30 mt-1 truncate">
                          <Mail className="h-3 w-3" />
                          <span>{recipient.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-black/10">
                <Users className="h-12 w-12 text-black/10 mx-auto mb-4" />
                <p className="font-bold text-black/40">কোনো প্রাপক পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
