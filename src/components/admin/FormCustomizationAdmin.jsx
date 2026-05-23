import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCustomForms,
  addCustomForm,
  setCustomForm,
  deleteCustomForm,
  getFormSubmissions,
  updateFormSubmissionStatus,
} from "../../services/firestore";
import { 
  Trash2, 
  Plus, 
  Loader2, 
  Copy, 
  ExternalLink, 
  Eye, 
  Edit3,
  Type, 
  Hash, 
  ImageIcon,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Phone,
  AlignLeft,
  MousePointer2,
  Calendar,
  Clock,
  Settings,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Tag,
  GripVertical,
  ListTodo,
  Trophy,
  CheckCircle
} from "lucide-react";

export default function FormCustomizationAdmin() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const data = await getCustomForms();
      
      // Update basic form data immediately to reduce flicker
      if (data && (showLoading || forms.length === 0)) {
        setForms(data.map(f => ({ ...f, submissionCount: 0 })));
      }
      
      // Fetch submission counts for each form with safety check
      const formsWithCounts = data ? await Promise.all(data.map(async (form) => {
        try {
          const submissions = await getFormSubmissions(form.id);
          return { ...form, submissionCount: submissions?.length || 0 };
        } catch (err) {
          console.error(`Error fetching submissions for form ${form.id}:`, err);
          return { ...form, submissionCount: 0 };
        }
      })) : [];
      
      setForms(formsWithCounts);
    } catch (error) {
      console.error("Error fetching forms:", error);
      if (showLoading) alert("ফর্ম লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function handleCreate() {
    const now = new Date().toISOString();
    const slug = `form-${Math.random().toString(36).substring(7)}`;
    const template = {
      title: "নতুন ফর্ম",
      slug: slug,
      fields: [
        { id: Date.now().toString(), type: "text", label: "আপনার নাম", required: true }
      ],
      created_at: now,
      active: true
    };
    try {
      const id = await addCustomForm(template);
      setForms([{ id, ...template }, ...forms]);
      setEditing(id);
    } catch (error) {
      console.error("Error creating form:", error);
    }
  }

  async function handleSave(form) {
    try {
      await setCustomForm(form.id, form);
      setEditing(null);
      // Refresh data silently
      fetchForms(false);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("ফর্ম সেভ করতে সমস্যা হয়েছে।");
    }
  }

  async function handleDelete(id) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ফর্মটি মুছে ফেলতে চান?")) return;
    try {
      await deleteCustomForm(id);
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  }

  async function handleViewSubmissions(form) {
    setViewingSubmissions(form);
    setLoadingSubmissions(true);
    try {
      const data = await getFormSubmissions(form.id);
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  const copyLink = (slug) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    alert("লিঙ্ক কপি হয়েছে!");
  };

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            ফর্ম কাস্টমাইজেশন
          </h1>
          <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">
            ডাইনামিক ফর্ম তৈরি ও সাবমিশন ম্যানেজ করুন
          </p>
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-[10px] font-black text-white transition-all hover:opacity-90 border-2 border-[var(--accent-terracotta)] uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ফর্ম</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 lg:px-10 pb-20">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-white border-2 border-black animate-pulse" />)}
          </div>
        ) : viewingSubmissions ? (
          <SubmissionsView 
            form={viewingSubmissions} 
            submissions={submissions} 
            setSubmissions={setSubmissions}
            loading={loadingSubmissions}
            onBack={() => setViewingSubmissions(null)}
          />
        ) : (
          <div className="grid gap-6">
            {forms.map((f, index) => (
              <div key={f.id} className="group relative bg-white rounded-3xl border-2 border-black transition-all hover:border-[var(--accent-terracotta)] hover:shadow-xl overflow-hidden">
                {editing === f.id ? (
                  <div className="p-8">
                    <FormEditor
                      form={f}
                      onSave={handleSave}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
                    {/* Serial Indicator */}
                    <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center text-[10px] font-black border-2 border-[var(--accent-terracotta)] z-10">
                      {index + 1}
                    </div>

                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 border-2 border-black text-black group-hover:bg-[var(--accent-terracotta)] group-hover:text-white transition-colors">
                        <ListTodo className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-black text-black truncate">{f.title}</h3>
                          <div className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-black text-[7px] uppercase tracking-widest ${
                            f.active ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]" : "bg-white text-black border-black"
                          }`}>
                            <div className={`h-1 w-1 rounded-full ${f.active ? 'bg-green-400' : 'bg-red-400'}`} />
                            {f.active ? "সক্রিয়" : "বন্ধ"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-black font-mono">/f/{f.slug}</span>
                          <div className="h-0.5 w-0.5 rounded-full bg-black" />
                          <span className="text-[9px] font-black text-[var(--accent-terracotta)] uppercase tracking-widest">
                            {f.submissionCount || 0} সাবমিশন
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-14 md:ml-0">
                      <button 
                        onClick={() => copyLink(f.slug)} 
                        className="p-2.5 rounded-xl border-2 border-black text-black hover:bg-black hover:text-white transition-all" 
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(f)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[var(--accent-terracotta)] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        <span>ভিউ</span>
                      </button>
                      <button
                        onClick={() => setEditing(f.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-terracotta)] text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 border-2 border-[var(--accent-terracotta)]"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-2.5 rounded-xl border-2 border-transparent text-black hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {forms.length === 0 && !loading && (
              <div className="rounded-[3rem] border-4 border-dashed border-black p-20 text-center bg-white/50">
                <Plus className="mx-auto h-12 w-12 text-black mb-4" />
                <p className="text-lg font-black text-black uppercase tracking-widest">কোনো ফর্ম খুঁজে পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormEditor({ form, onSave, onCancel }) {
  const [editedForm, setEditedForm] = useState({ ...form });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [categories, setCategories] = useState([
    { id: "scholarship", label: "স্কলারশিপ প্রোগ্রাম" },
    { id: "housing", label: "আবাসন ভাতা প্রোগ্রাম" },
    { id: "training", label: "প্রশিক্ষণ প্রোগ্রাম" },
    { id: "exam", label: "পরীক্ষা / কুইজ" },
    { id: "other", label: "অন্যান্য" },
  ]);

  // Update categories list if the current form has a custom category
  useEffect(() => {
    if (editedForm.category && !categories.find(c => c.id === editedForm.category)) {
      setCategories(prev => [...prev, { id: editedForm.category, label: editedForm.category }]);
    }
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = { id: newCategoryName.trim(), label: newCategoryName.trim() };
    setCategories(prev => [...prev, newCat]);
    setEditedForm({ ...editedForm, category: newCat.id });
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const fieldTypes = [
    { id: "text", label: "Short Text", icon: <Type className="h-4 w-4" />, defaultLabel: "আপনার নাম/তথ্য" },
    { id: "textarea", label: "Long Text", icon: <AlignLeft className="h-4 w-4" />, defaultLabel: "বিস্তারিত লিখুন" },
    { id: "number", label: "Number", icon: <Hash className="h-4 w-4" />, defaultLabel: "পরিমাণ/সংখ্যা" },
    { id: "email", label: "Email Address", icon: <Mail className="h-4 w-4" />, defaultLabel: "ইমেইল ঠিকানা" },
    { id: "phone", label: "Phone Number", icon: <Phone className="h-4 w-4" />, defaultLabel: "মোবাইল নাম্বার" },
    { id: "date", label: "Date", icon: <Calendar className="h-4 w-4" />, defaultLabel: "তারিখ নির্বাচন করুন" },
    { id: "time", label: "Time", icon: <Clock className="h-4 w-4" />, defaultLabel: "সময় নির্বাচন করুন" },
    { id: "image", label: "Image Upload", icon: <ImageIcon className="h-4 w-4" />, defaultLabel: "ছবি আপলোড করুন" },
    { id: "mcq", label: "MCQ / Exam Question", icon: <ListTodo className="h-4 w-4" />, defaultLabel: "আপনার প্রশ্নটি লিখুন" },
  ];

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...editedForm.fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setEditedForm({ ...editedForm, fields: newFields });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addField = (typeObj) => {
    const newField = {
      id: Date.now().toString(),
      type: typeObj.id,
      label: typeObj.defaultLabel,
      required: false,
      placeholder: "",
    };

    // Only add MCQ specific fields if it's an MCQ type to avoid Firestore 'undefined' errors
    if (typeObj.id === "mcq") {
      newField.options = ["অপশন ১", "অপশন ২"];
      newField.correctAnswer = 0;
      newField.points = 1;
    }

    setEditedForm({
      ...editedForm,
      fields: [...editedForm.fields, newField]
    });
    setShowTypeDropdown(false);
  };

  const removeField = (id) => {
    setEditedForm({
      ...editedForm,
      fields: editedForm.fields.filter(f => f.id !== id)
    });
  };

  const updateField = (id, updates) => {
    setEditedForm({
      ...editedForm, "fields": editedForm.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const addOption = (fieldId) => {
    const field = editedForm.fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    updateField(fieldId, {
      options: [...field.options, `নতুন অপশন ${field.options.length + 1}`]
    });
  };

  const removeOption = (fieldId, optIndex) => {
    const field = editedForm.fields.find(f => f.id === fieldId);
    if (!field || !field.options || field.options.length <= 2) return;
    
    const newOptions = field.options.filter((_, i) => i !== optIndex);
    const newCorrect = field.correctAnswer >= optIndex ? Math.max(0, field.correctAnswer - 1) : field.correctAnswer;
    
    updateField(fieldId, {
      options: newOptions,
      correctAnswer: newCorrect
    });
  };

  const updateOptionText = (fieldId, optIndex, text) => {
    const field = editedForm.fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    const newOptions = [...field.options];
    newOptions[optIndex] = text;
    updateField(fieldId, { options: newOptions });
  };

  const moveField = (index, direction) => {
    const newFields = [...editedForm.fields];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setEditedForm({ ...editedForm, fields: newFields });
  };

  const getFieldIcon = (type) => {
     switch (type) {
       case "text": return <Type className="h-5 w-5 text-black" />;
       case "textarea": return <AlignLeft className="h-5 w-5 text-black" />;
       case "number": return <Hash className="h-5 w-5 text-black" />;
       case "email": return <Mail className="h-5 w-5 text-black" />;
       case "phone": return <Phone className="h-5 w-5 text-black" />;
       case "date": return <Calendar className="h-5 w-5 text-black" />;
       case "time": return <Clock className="h-5 w-5 text-black" />;
       case "image": return <ImageIcon className="h-5 w-5 text-black" />;
      default: return <Type className="h-5 w-5 text-black" />;
     }
   };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
      {/* Left Side: Form Builder */}
      <div className="flex-1 space-y-8 min-w-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-black" />
            <h4 className="text-lg font-black text-black uppercase tracking-widest">সাধারণ সেটিংস</h4>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">ফর্মের শিরোনাম</label>
              <input
                value={editedForm.title}
                onChange={(e) => setEditedForm({ ...editedForm, title: e.target.value })}
                className="w-full rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none transition-all shadow-sm"
                placeholder="ফর্মের নাম দিন"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">URL স্লাগ (Slug)</label>
              <input
                value={editedForm.slug}
                onChange={(e) => setEditedForm({ ...editedForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none font-mono transition-all shadow-sm"
                placeholder="url-slug"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1 flex justify-between">
                <span>ফর্মের ধরন (Category)</span>
                <button 
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[var(--accent-terracotta)] hover:underline flex items-center gap-1"
                >
                  {isAddingCategory ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  {isAddingCategory ? "বাতিল" : "নতুন যোগ করুন"}
                </button>
              </label>
              
              {isAddingCategory ? (
                <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    className="flex-1 rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none transition-all shadow-sm"
                    placeholder="নতুন ক্যাটাগরির নাম"
                  />
                  <button 
                    onClick={() => handleAddCategory()}
                    className="px-4 py-2 bg-[var(--accent-terracotta)] text-white rounded-xl font-black text-xs uppercase"
                  >
                    যোগ
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={editedForm.category || "other"}
                    onChange={(e) => setEditedForm({ ...editedForm, category: e.target.value })}
                    className="w-full rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t-2 border-black">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-black" />
              <h4 className="text-sm font-black text-black uppercase tracking-widest">অ্যাডভান্সড অপশন</h4>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">সময়সীমা (Deadline)</label>
                <input
                  type="datetime-local"
                  value={editedForm.deadline || ""}
                  onChange={(e) => setEditedForm({ ...editedForm, deadline: e.target.value })}
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">পরীক্ষার সময় (মিনিট)</label>
                <input
                  type="number"
                  value={editedForm.duration || ""}
                  onChange={(e) => setEditedForm({ ...editedForm, duration: parseInt(e.target.value) || "" })}
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black focus:border-[var(--accent-terracotta)] outline-none transition-all shadow-sm"
                  placeholder="উদা: ৩০"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">স্ট্যাটাস</label>
                <button
                  onClick={() => setEditedForm({ ...editedForm, active: !editedForm.active })}
                  className={`w-full flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-2 text-sm font-black transition-all shadow-sm ${
                    editedForm.active 
                      ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]" 
                      : "bg-white text-black border-black hover:bg-[var(--accent-terracotta)]/10"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${editedForm.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  {editedForm.active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <AlignLeft className="h-6 w-6 text-black" />
              <h4 className="text-sm font-black text-black uppercase tracking-widest">ফর্ম ফিল্ডসমূহ</h4>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-terracotta)] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 border-2 border-[var(--accent-terracotta)] transition-all shadow-md"
              >
                <Plus className="h-4 w-4" /> নতুন ফিল্ড
                <ChevronDown className={`h-4 w-4 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showTypeDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-[var(--accent-terracotta)] overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                  <div className="p-1 grid gap-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {fieldTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => addField(type)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-black hover:bg-[var(--accent-terracotta)] hover:text-white rounded-lg transition-all"
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {(editedForm.fields || []).map((field, index) => (
              <div 
                key={field.id} 
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col gap-3 p-3 rounded-xl border-2 transition-all shadow-sm ${
                  draggedIndex === index ? "opacity-30 border-dashed border-[var(--accent-terracotta)] bg-black/10 scale-[0.98]" : "border-black bg-white hover:border-[var(--accent-terracotta)]"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2 border-r border-black/20 pr-2">
                    <div className="cursor-grab active:cursor-grabbing text-black hover:text-black">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="w-4 text-center font-black text-black text-[10px]">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-black/10 border border-black/10">
                      {getFieldIcon(field.type)}
                    </div>
                    <input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="flex-1 bg-transparent text-xs font-bold text-black border-none focus:ring-0 p-0 outline-none truncate"
                      placeholder="লেবেল..."
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateField(field.id, { required: !field.required })}
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all border ${
                        field.required ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]" : "bg-white text-black border-black"
                      }`}
                    >
                      Req
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-1.5 rounded-md text-black hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {field.type === "mcq" && field.options && (
                  <div className="ml-6 pl-4 border-l border-black/20 space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase text-black">
                      <span>পয়েন্ট:</span>
                      <input
                        type="number"
                        value={field.points || 1}
                        onChange={(e) => updateField(field.id, { points: parseInt(e.target.value) || 1 })}
                        className="w-10 bg-transparent text-black font-black outline-none text-right"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      {field.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 group/opt">
                          <button
                            onClick={() => updateField(field.id, { correctAnswer: optIdx })}
                            className={`shrink-0 h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                              field.correctAnswer === optIdx ? "bg-green-500 border-green-500 text-white" : "border-black"
                            }`}
                          >
                            {field.correctAnswer === optIdx && <CheckCircle className="h-2.5 w-2.5" />}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => updateOptionText(field.id, optIdx, e.target.value)}
                            className="flex-1 bg-black/10 rounded-md px-2 py-1 text-[10px] font-bold outline-none text-black"
                            placeholder="অপশন..."
                          />
                          <button onClick={() => removeOption(field.id, optIdx)} className="text-black hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addOption(field.id)} className="text-[9px] font-black uppercase text-[var(--accent-terracotta)] text-left pl-6">+ নতুন অপশন</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t-2 border-black">
          <button
            onClick={() => onSave(editedForm)}
            className="flex-1 rounded-xl bg-[var(--accent-terracotta)] px-8 py-3 text-sm font-black text-white transition-all hover:opacity-90 border-2 border-[var(--accent-terracotta)] shadow-lg"
          >
            সেভ করুন
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl bg-white border-2 border-[var(--accent-terracotta)] px-6 py-3 text-sm font-black text-[var(--accent-terracotta)] transition-all hover:bg-[var(--accent-terracotta)] hover:text-white"
          >
            বাতিল
          </button>
        </div>
      </div>

      {/* Right Side: Live Preview */}
      <div className="w-full lg:w-[400px] shrink-0">
        <div className="sticky top-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-[var(--accent-terracotta)]" />
            <h4 className="text-sm font-black text-black uppercase tracking-widest">লাইভ প্রিভিউ</h4>
          </div>
          
          <div className="bg-white rounded-[2rem] border-2 border-[var(--accent-terracotta)]/20 overflow-hidden shadow-2xl h-[calc(100vh-250px)] flex flex-col">
            <div className="p-6 bg-[var(--accent-terracotta)] text-white">
              <h1 className="text-xl font-black truncate">{editedForm.title || "ফর্মের শিরোনাম"}</h1>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-100">/f/{editedForm.slug}</p>
                {editedForm.deadline && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/80 uppercase tracking-widest animate-pulse">
                    <Clock3 className="h-3 w-3" />
                    <span>শেষ সময়: {new Date(editedForm.deadline).toLocaleString("bn-BD")}</span>
                  </div>
                )}
                {editedForm.duration && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/80 uppercase tracking-widest">
                    <Trophy className="h-3 w-3" />
                    <span>সময়সীমা: {editedForm.duration} মিনিট</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[var(--bg-cream-soft)]">
              {(editedForm.fields || []).map((field) => (
                <div key={field.id} className="space-y-3">
                  <label className="block text-[10px] font-black text-black uppercase tracking-widest">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === "mcq" ? (
                    <div className="grid gap-2">
                      {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-white text-[10px] font-bold text-black">
                          <div className="h-3 w-3 rounded-full border border-black" />
                          {opt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-10 rounded-xl border-2 border-black bg-white px-4 flex items-center text-[10px] font-bold text-black italic">
                      {field.placeholder || "এখানে ইনপুট দিন..."}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-6">
                <div className="w-full h-12 rounded-xl bg-[var(--accent-terracotta)] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                  জমা দিন
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionsView({ form, submissions, setSubmissions, loading, onBack }) {
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const handleStatusUpdate = async (submissionId, newStatus) => {
    setUpdatingId(submissionId);
    try {
      await updateFormSubmissionStatus(submissionId, newStatus);
      // Update local state instead of reloading
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId ? { ...s, status: newStatus } : s
      ));
      alert("স্ট্যাটাস আপডেট হয়েছে!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-xl border-2 border-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white transition-all text-[var(--accent-terracotta)]">
            <X className="h-5 w-5" />
          </button>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight">{form.title}</h3>
            <p className="text-[10px] font-black text-black uppercase tracking-widest">{submissions.length}টি সাবমিশন পাওয়া গেছে</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-black mb-4" />
          <p className="text-sm font-black text-black">সাবমিশন লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {/* Header for Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[var(--accent-terracotta)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-1">নং</div>
            <div className="col-span-4">ব্যবহারকারী</div>
            <div className="col-span-3">তারিখ</div>
            <div className="col-span-2 text-center">স্ট্যাটাস</div>
            <div className="col-span-2 text-right">অ্যাকশন</div>
          </div>

          {/* Submissions List */}
          {submissions.map((s, index) => (
            <div 
              key={s.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 bg-white border-2 border-black hover:border-[var(--accent-terracotta)] rounded-2xl transition-all group"
            >
              {/* Desktop: Number */}
              <div className="hidden md:block col-span-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-black text-xs">
                  {index + 1}
                </div>
              </div>

              {/* User Info */}
              <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-black text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-black truncate">{s.userName || s.data?.userName || s.data?.displayName || s.data?.name || "অজানা"}</p>
                  <p className="text-[10px] font-bold text-black">{s.userPhone || s.data?.userPhone || s.data?.email || "তথ্য নেই"}</p>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-1 md:col-span-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(s.created_at).toLocaleDateString("bn-BD")}</span>
                  <span className="opacity-50 ml-1">{new Date(s.created_at).toLocaleTimeString("bn-BD")}</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                <div className="relative w-full max-w-[120px]">
                  <select
                    value={s.status || "Pending"}
                    disabled={updatingId === s.id}
                    onChange={(e) => handleStatusUpdate(s.id, e.target.value)}
                    className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none border-2 transition-all cursor-pointer ${
                      s.status === "Accepted" ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)]" :
                      s.status === "Rejected" ? "bg-white text-black border-red-500" :
                      "bg-white text-black border-black/10 hover:border-[var(--accent-terracotta)]"
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none ${s.status === "Accepted" ? "text-white" : "text-black"}`} />
                  {updatingId === s.id && <Loader2 className="absolute -right-6 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-black" />}
                </div>
              </div>

              {/* Action */}
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => navigate(`/admin/submission/${form.id}/${s.id}`)}
                  className="flex items-center gap-2 rounded-lg border-2 border-[var(--accent-terracotta)] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white transition-all"
                >
                  <Eye className="h-3 w-3" /> ভিউ
                </button>
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-black">
              <p className="text-lg font-black text-black italic uppercase tracking-widest">এখনো কোনো সাবমিশন জমা পড়েনি</p>
            </div>
          )}
        </div>
      )}


    </div>
  );
}
