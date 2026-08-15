import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Clock3, CheckCircle2, Eye, FileUp, MessageSquare, Receipt, ArrowUpRight, Loader2, UploadCloud, X, Send, CreditCard, FileText, Download } from 'lucide-react';

type Project = any;
type Invoice = any;
type Comment = any;

const STATUS_STEPS = ['Submitted', 'In Review', 'In Progress', 'Needs Changes', 'Final Review', 'Completed'];
const STATUS_COLOR: Record<string, string> = {
  Submitted: 'bg-[#fff7e6] text-[#8a5a00] border-[#ffe4a8]',
  'In Review': 'bg-[#eef2ff] text-[#2f3b9b] border-[#c9d1ff]',
  'In Progress': 'bg-[#e9f7ef] text-[#1a6b3c] border-[#bfe8cf]',
  'Needs Changes': 'bg-[#fff1f1] text-[#8c1d1d] border-[#ffcaca]',
  'Final Review': 'bg-[#f5f0ff] text-[#5a2bb5] border-[#d9c8ff]',
  Completed: 'bg-[#111] text-white border-[#111]',
};

function useProjects() {
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const email = profile?.email || user?.email;
      const res = await fetch(`/api/projects?client_email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { if (profile || user) fetchProjects(); }, [profile?.email, user?.email]);
  return { projects, loading, refresh: fetchProjects };
}

function ClientOverview() {
  const { profile, user } = useAuth();
  const { projects, loading } = useProjects();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        setInvoicesLoading(true);
        const email = profile?.email || user?.email;
        const res = await fetch(`/api/projects?client_email=${encodeURIComponent(email)}`);
        const proj = await res.json();
        if (Array.isArray(proj) && proj.length) {
          const clientId = proj[0].client_id;
          const invRes = await fetch(`/api/invoices?client_id=${clientId}`);
          const invData = await invRes.json();
          setInvoices(Array.isArray(invData) ? invData : []);
        } else {
          const invRes = await fetch(`/api/invoices?client_email=${encodeURIComponent(email)}`);
          const invData = await invRes.json();
          setInvoices(Array.isArray(invData) ? invData : []);
        }
      } catch { } finally { setInvoicesLoading(false); }
    };
    fetchInv();
  }, [profile?.email]);

  const active = projects.filter((p: any) => p.status !== 'Completed');
  const completed = projects.filter((p: any) => p.status === 'Completed');
  const unpaid = invoices.filter((i: any) => i.status !== 'Paid');

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[30px] md:text-[36px] tracking-[-0.03em] font-semibold leading-[0.95]">Good morning, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}.</h1>
          <p className="text-[13px] text-neutral-500 mt-2">Here's what's happening with your design work today.</p>
        </div>
        <Link to="/client/projects/new" className="h-10 px-5 rounded-full bg-[#111] text-white text-[13px] font-medium inline-flex items-center gap-2 hover:bg-black"><Plus size={16} /> New Request</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Active Projects', value: loading ? '—' : active.length, sub: `${projects.length} total`, icon: Clock3 },
          { label: 'Completed', value: loading ? '—' : completed.length, sub: 'delivered', icon: CheckCircle2 },
          { label: 'Unpaid Invoices', value: invoicesLoading ? '—' : unpaid.length, sub: unpaid.length ? `$${unpaid.reduce((s: number, i: any) => s + Number(i.amount), 0).toLocaleString()} due` : 'all clear', icon: Receipt },
          { label: 'Avg. turnaround', value: '3.4d', sub: 'last 30 days', icon: FileUp },
        ].map((c, i) => (
          <div key={i} className="rounded-[22px] bg-white border border-[#e8e6e1] p-5">
            <div className="flex items-center justify-between mb-4">
              <c.icon size={16} className="text-neutral-500" />
              <span className="text-[10px] tracking-widest text-neutral-400 font-semibold">METRIC</span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.02em] leading-none">{c.value}</p>
            <p className="text-[12px] text-neutral-500 mt-1.5">{c.label} • {c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold tracking-[-0.01em]">Recent projects</h3>
            <Link to="/client/projects" className="text-[12px] font-medium flex items-center gap-1 hover:underline">View all <ArrowUpRight size={14} /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-[72px] rounded-2xl shimmer" />)}</div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f6f3ee] mx-auto grid place-items-center mb-3">✦</div>
              <p className="text-[14px] font-medium">No requests yet</p>
              <p className="text-[12px] text-neutral-500 mt-1">Create your first design brief and attach references.</p>
              <Link to="/client/projects/new" className="mt-4 inline-flex h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium items-center gap-1">Create request <Plus size={14} /></Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p: any) => (
                <Link key={p.id} to={`/client/projects/${p.id}`} className="flex items-center justify-between p-4 rounded-2xl border border-[#ece8e1] hover:border-[#111] transition group">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{p.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2"><span className={`px-2 h-5 rounded-full border text-[10px] inline-flex items-center font-medium ${STATUS_COLOR[p.status] || 'bg-white'}`}>{p.status}</span> {p.type} • {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-neutral-400 group-hover:text-black transition" />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[24px] bg-[#111] text-white p-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-[220px] h-[220px] rounded-full bg-white/10 blur-[1px]" />
          <h3 className="text-[14px] font-semibold relative">How this portal works</h3>
          <div className="mt-5 space-y-4 relative">
            {[
              { n: '01', t: 'Submit brief + moodboard', d: 'Use the new request form. Attach PDFs, images, Figma links.' },
              { n: '02', t: 'Track live status', d: 'See real timeline: Submitted → Review → Progress → Delivery' },
              { n: '03', t: 'Request revisions', d: 'Leave threaded comments. Admin gets notified instantly.' },
              { n: '04', t: 'Pay dummy invoice', d: 'Test flow UI — card entry, 3D secure mock, receipt. No Stripe.' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <span className="text-[11px] font-mono tracking-wide text-white/50 mt-0.5">{s.n}</span>
                <div>
                  <p className="text-[13px] font-medium">{s.t}</p>
                  <p className="text-[12px] leading-[1.4] text-white/60 mt-1">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-white/50 tracking-wide">SECURE • ENCRYPTED • RENDER READY</p>
            <div className="w-7 h-7 rounded-full bg-white text-black grid place-items-center text-[11px] font-bold">—</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsList() {
  const { projects, loading, refresh } = useProjects();
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p: any) => p.status === filter);
  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">My Projects</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-[#e8e6e1]">
            {['All', ...STATUS_STEPS].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`h-7 px-3 rounded-full text-[11px] font-medium transition ${filter === s ? 'bg-[#111] text-white' : 'text-neutral-600 hover:bg-[#fafaf8]'}`}>{s}</button>
            ))}
          </div>
          <Link to="/client/projects/new" className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium inline-flex items-center gap-1.5"><Plus size={14} /> New</Link>
        </div>
      </div>
      {loading ? (
        <div className="grid md:grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-[132px] rounded-[20px] shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-10 text-center"><p className="text-[14px] font-medium">No projects in “{filter}”</p><p className="text-[12px] text-neutral-500 mt-1">Try a different filter or create a new brief.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((p: any) => (
            <Link key={p.id} to={`/client/projects/${p.id}`} className="group rounded-[22px] bg-white border border-[#e8e6e1] p-5 hover:border-[#111] transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] group-hover:underline underline-offset-4">{p.title}</h3>
                  <p className="text-[12px] text-neutral-500 mt-1 line-clamp-2 leading-[1.5]">{p.description || 'No description'}</p>
                </div>
                <span className={`shrink-0 px-2.5 h-6 rounded-full border text-[10px] font-semibold tracking-wide inline-flex items-center ${STATUS_COLOR[p.status]}`}>{p.status?.toUpperCase()}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500"><span className="px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{p.type}</span><span>{p.priority}</span> • <span>{new Date(p.created_at).toLocaleDateString()}</span></div>
                <Eye size={14} className="text-neutral-400 group-hover:text-black" />
              </div>
              {p.final_files?.length > 0 && <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 h-6 w-fit"><Download size={12} /> {p.final_files.length} final file(s)</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewProjectPage() {
  const { profile, user } = useAuth();
  const [form, setForm] = useState({ title: '', type: 'Brand Identity', description: '', budget_range: '$500 – $1,000', deadline: '', priority: 'Medium' });
  const [files, setFiles] = useState<{ name: string, url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    setUploading(true);
    try {
      for (const f of Array.from(fileList)) {
        const reader = new FileReader();
        const base64: string = await new Promise((res, rej) => { reader.onload = () => res((reader.result as string).split(',')[1]); reader.onerror = rej; reader.readAsDataURL(f); });
        const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: f.name, fileBase64: base64, contentType: f.type, folder: 'references' }) });
        const j = await r.json();
        if (j.url) setFiles(prev => [...prev, { name: f.name, url: j.url }]);
      }
    } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        client_id: profile?.id || null,
        client_email: profile?.email || user?.email,
        client_name: profile?.full_name || user?.email,
        title: form.title,
        type: form.type,
        description: form.description,
        budget_range: form.budget_range,
        deadline: form.deadline || null,
        priority: form.priority,
        reference_files: files,
        status: 'Submitted'
      };
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { setSuccessId(data.id); setTimeout(() => navigate(`/client/projects/${data.id}`), 1200); }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  if (successId) {
    return (
      <div className="max-w-[640px] mx-auto px-6 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-full bg-[#111] text-white grid place-items-center mx-auto mb-5"><CheckCircle2 /></motion.div>
        <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Brief submitted — #{successId}</h2>
        <p className="text-[13px] text-neutral-500 mt-2 leading-[1.5]">Your request is now “Submitted”. Your designer will move it to “In Review” shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[780px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <Link to="/client/projects" className="text-[12px] text-neutral-500 hover:text-black inline-flex items-center gap-1 mb-6">← Back to projects</Link>
      <div className="rounded-[28px] bg-white border border-[#e8e6e1] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.03em]">New Design Request</h1>
            <p className="text-[13px] text-neutral-500 mt-1">Describe what you need. Attach moodboards.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-500"><FileUp size={14} /> Your files stay private</div>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-neutral-600">PROJECT TITLE *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g., New landing page + brand refresh for North" className="mt-2 w-full h-12 rounded-full border border-[#e8e6e1] px-5 text-[14px] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] bg-[#fcfbf9]" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-neutral-600">TYPE</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-2 w-full h-12 rounded-full border border-[#e8e6e1] px-5 text-[14px] bg-white outline-none focus:border-[#111]">
                {['Brand Identity', 'Website Design', 'Marketing Assets', 'Illustration', 'Packaging', 'Motion / Video', 'UX Audit', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-neutral-600">BUDGET RANGE</label>
              <select value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })} className="mt-2 w-full h-12 rounded-full border border-[#e8e6e1] px-5 text-[14px] bg-white outline-none focus:border-[#111]">
                {['<$500', '$500 – $1,000', '$1,000 – $2,500', '$2,500 – $5,000', '$5,000+'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-neutral-600">DEADLINE</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-2 w-full h-12 rounded-full border border-[#e8e6e1] px-5 text-[14px] bg-white outline-none focus:border-[#111]" />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-neutral-600">PRIORITY</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map(p => <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} className={`h-12 rounded-full border text-[13px] font-medium ${form.priority === p ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#e8e6e1]'}`}>{p}</button>)}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-neutral-600">BRIEF / DESCRIPTION</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Goals, audience, must-haves, do-not-dos, references…" className="mt-2 w-full rounded-[20px] border border-[#e8e6e1] p-4 text-[14px] bg-[#fcfbf9] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] resize-none" />
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-neutral-600">REFERENCE FILES</label>
            <div className="mt-2 rounded-[20px] border border-dashed border-[#d8d4ce] bg-[#fdfcfa] p-5">
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white border border-[#e8e6e1] grid place-items-center"><UploadCloud size={18} /></div>
                <span className="text-[13px] font-medium">Drop files or click to upload</span>
                <span className="text-[11px] text-neutral-500">PNG, JPG, PDF, FIG — up to 10 files</span>
                <input type="file" multiple onChange={handleUpload} className="hidden" />
              </label>
              {files.length > 0 && <div className="mt-4 grid gap-2">{files.map((f, i) => <div key={i} className="flex items-center justify-between bg-white border border-[#ece8e1] rounded-full px-4 h-10 text-[12px]"><span className="truncate">{f.name}</span><button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="w-6 h-6 rounded-full bg-[#f6f3ee] grid place-items-center"><X size={12} /></button></div>)}</div>}
              {uploading && <p className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-neutral-500">By submitting, you agree to our studio terms. Invoices are generated after “Final Review”.</p>
            <button disabled={submitting || uploading} className="h-11 px-6 rounded-full bg-[#111] text-white text-[13px] font-medium hover:bg-black disabled:opacity-60 inline-flex items-center gap-2">{submitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Submit Brief</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectDetailRoute() {
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  return <ProjectDetail id={id!} />;
}

function ProjectDetail({ id }: { id: string }) {
  const { profile, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const pr = await fetch(`/api/projects?id=${id}`).then(r => r.json());
      const item = Array.isArray(pr) ? pr[0] : pr;
      setProject(item);
      if (item) {
        const cm = await fetch(`/api/comments?project_id=${item.id}`).then(r => r.json());
        setComments(Array.isArray(cm) ? cm : []);
      }
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, [id]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: project.id, author_id: profile?.user_id || user?.id, author_name: profile?.full_name || user?.email, author_role: profile?.role || 'client', message: newComment }) });
      if (res.ok) { setNewComment(''); const data = await fetch(`/api/comments?project_id=${project.id}`).then(r => r.json()); setComments(Array.isArray(data) ? data : []); }
    } catch { }
  };

  if (loading) return <div className="max-w-[900px] mx-auto px-6 py-12"><div className="h-[200px] rounded-[24px] shimmer" /></div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(project.status);

  return (
    <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <Link to="/client/projects" className="text-[12px] text-neutral-500 hover:text-black inline-flex items-center gap-1 mb-5">← Back</Link>
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="rounded-[28px] bg-white border border-[#e8e6e1] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.03em] leading-[1.05]">{project.title}</h1>
              <p className="text-[12px] text-neutral-500 mt-2">ID #{project.id} • Created {new Date(project.created_at).toLocaleString()} • Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}</p>
            </div>
            <span className={`px-3 h-7 rounded-full border text-[11px] font-semibold tracking-wide inline-flex items-center ${STATUS_COLOR[project.status]}`}>{project.status}</span>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3">LIVE STATUS TRACKER</p>
            <div className="relative flex gap-0 overflow-x-auto pb-2">
              {STATUS_STEPS.map((s, i) => {
                const isDone = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={s} className="flex items-center gap-2 pr-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full grid place-items-center border text-[12px] font-bold transition-all ${isDone ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-neutral-400 border-[#e8e6e1]'} ${isCurrent ? 'ring-2 ring-[#111] ring-offset-2' : ''}`}>{isDone ? '✓' : i + 1}</div>
                      <span className={`mt-2 text-[10px] tracking-wide font-medium whitespace-nowrap ${isCurrent ? 'text-[#111]' : isDone ? 'text-neutral-700' : 'text-neutral-400'}`}>{s.toUpperCase()}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`w-[32px] h-px ${i < currentStepIndex ? 'bg-[#111]' : 'bg-[#e8e6e1]'} mt-[-14px]`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-[18px] bg-[#fafaf8] border border-[#ece8e1] p-4">
              <p className="text-[11px] font-semibold tracking-wide text-neutral-500">BRIEF</p>
              <p className="text-[13px] leading-[1.6] mt-2 whitespace-pre-wrap">{project.description || 'No brief provided'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]"><span className="px-2.5 h-6 rounded-full bg-white border border-[#ece8e1] inline-flex items-center">{project.type}</span><span className="px-2.5 h-6 rounded-full bg-white border border-[#ece8e1] inline-flex items-center">{project.budget_range}</span><span className="px-2.5 h-6 rounded-full bg-white border border-[#ece8e1] inline-flex items-center">{project.priority} priority</span></div>
            </div>
            <div className="space-y-3">
              <div className="rounded-[18px] bg-[#fafaf8] border border-[#ece8e1] p-4">
                <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-2">REFERENCE FILES</p>
                {(project.reference_files as any[])?.length ? (project.reference_files as any[]).map((f: any, i: number) => <a key={i} href={f.url} target="_blank" className="flex items-center justify-between py-2 text-[12px] hover:underline"><span className="truncate">{f.name || f.url}</span><Download size={12} /></a>) : <p className="text-[12px] text-neutral-500">No references</p>}
              </div>
              <div className="rounded-[18px] bg-[#111] text-white p-4">
                <p className="text-[11px] tracking-wide text-white/60 font-semibold mb-2">FINAL DELIVERY</p>
                {(project.final_files as any[])?.length ? (project.final_files as any[]).map((f: any, i: number) => <a key={i} href={f.url} target="_blank" className="flex items-center justify-between py-2 text-[12px] hover:text-white/80"><span className="truncate">{f.name || f.url}</span><Download size={12} /></a>) : <p className="text-[12px] text-white/60">Awaiting delivery — you’ll see it here when marked “Completed”.</p>}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3 flex items-center gap-2"><MessageSquare size={12} /> REVISIONS & COMMENTS ({comments.length})</p>
            <div className="rounded-[20px] border border-[#ece8e1] bg-[#fcfbf9] p-3 md:p-4">
              <div className="space-y-3 max-h-[300px] overflow-auto pr-1">
                {comments.length === 0 ? <p className="text-[12px] text-neutral-500 text-center py-6">No comments yet. Ask for changes here.</p> : comments.map((c: any) => (
                  <div key={c.id} className={`flex gap-2.5 ${c.author_role === 'admin' ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${c.author_role === 'admin' ? 'bg-[#111] text-white' : 'bg-[#f1ece6] text-neutral-700'}`}>{c.author_name?.[0]?.toUpperCase() || '?'}</div>
                    <div className={`max-w-[75%] rounded-[18px] px-4 py-2.5 border ${c.author_role === 'admin' ? 'bg-white border-[#ece8e1]' : 'bg-[#111] text-white border-[#111]'}`}>
                      <p className="text-[11px] opacity-70 mb-1 flex items-center gap-1.5">{c.author_name} • {c.author_role.toUpperCase()} • {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[13px] leading-[1.4] whitespace-pre-wrap">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), postComment())} placeholder="Leave a revision note…" className="flex-1 h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111]" />
                <button onClick={postComment} className="w-11 h-11 rounded-full bg-[#111] text-white grid place-items-center hover:bg-black"><Send size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* right: invoice teaser / pay */}
        <div className="space-y-4">
          <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-5">
            <h3 className="text-[13px] font-semibold">Project Meta</h3>
            <div className="mt-4 space-y-3 text-[12px]">
              <div className="flex justify-between"><span className="text-neutral-500">Client</span><span className="font-medium">{project.client_name}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Type</span><span className="font-medium">{project.type}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Priority</span><span className="font-medium">{project.priority}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className={`px-2 h-5 rounded-full border text-[10px] font-medium inline-flex items-center ${STATUS_COLOR[project.status]}`}>{project.status}</span></div>
              <div className="pt-3 mt-3 border-t border-[#ece8e1] flex items-center gap-2 text-[11px] text-neutral-500"><Clock3 size={12} /> Last update {new Date(project.updated_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-[24px] bg-[#f8f4ef] border border-[#ece8e1] p-5">
            <p className="text-[11px] font-semibold tracking-wide text-neutral-500">NEED HELP?</p>
            <p className="text-[13px] leading-[1.5] mt-2">Message directly in revisions thread. Turnaround is typically 24-48h for “In Review”.</p>
            <Link to="/client/invoices" className="mt-4 h-9 px-4 rounded-full bg-white border border-[#e8e6e1] inline-flex items-center gap-1.5 text-[12px] font-medium hover:border-[#111]"><Receipt size={14} /> View invoices</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientInvoices() {
  const { profile, user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'secure' | 'success'>('form');
  const [cardForm, setCardForm] = useState({ number: '4242 4242 4242 4242', exp: '12/28', cvc: '123', name: 'Jordan Smith' });

  const fetchInvoices = async () => {
    try { setLoading(true); const email = profile?.email || user?.email; const r = await fetch(`/api/invoices?client_email=${encodeURIComponent(email)}`).then(r => r.json()); const r2 = await fetch(`/api/invoices?client_id=${profile?.id || ''}`).then(r => r.json()); const combined = [...(Array.isArray(r) ? r : []), ...(Array.isArray(r2) ? r2 : [])]; const dedup = Array.from(new Map(combined.map((i: any) => [i.id, i])).values()); setInvoices(dedup); } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchInvoices(); }, [profile?.id]);

  const startPay = (inv: Invoice) => { setPaying(inv.id); setPaymentStep('form'); };

  const confirmPay = async () => {
    if (!paying) return;
    setPaymentStep('processing');
    await new Promise(r => setTimeout(r, 1200));
    setPaymentStep('secure');
    await new Promise(r => setTimeout(r, 1400));
    const res = await fetch('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: paying, paid: true }) });
    if (res.ok) { setPaymentStep('success'); await new Promise(r => setTimeout(r, 1100)); fetchInvoices(); setPaying(null); }
    else { setPaymentStep('form'); }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Invoices</h1>
      <p className="text-[13px] text-neutral-500 mt-1">Dummy/test payment UI — no real gateway. Simulate 3-D Secure and receipt.</p>

      {loading ? <div className="mt-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-[92px] rounded-[18px] shimmer" />)}</div> : invoices.length === 0 ? (
        <div className="mt-6 rounded-[24px] bg-white border border-[#e8e6e1] p-10 text-center"><p className="text-[14px] font-medium">No invoices yet</p><p className="text-[12px] text-neutral-500 mt-1">They appear when freelancer generates one from admin.</p></div>
      ) : (
        <div className="mt-6 space-y-3">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="rounded-[22px] bg-white border border-[#e8e6e1] p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold">{inv.title}</h3>
                  <span className={`px-2 h-5 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center border ${inv.status === 'Paid' ? 'bg-[#111] text-white border-[#111]' : inv.status === 'Overdue' ? 'bg-[#fff1f1] text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>{inv.status?.toUpperCase()}</span>
                </div>
                <p className="text-[12px] text-neutral-500 mt-1">INV-{String(inv.id).padStart(5, '0')} • Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'} • {inv.items?.length || 1} line item(s) • ${Number(inv.amount).toLocaleString()} {inv.currency}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{(inv.items || []).slice(0, 3).map((it: any, i: number) => <span key={i} className="text-[11px] px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{it.label || it.title}: ${it.amount}</span>)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-semibold tracking-tight">${Number(inv.amount).toLocaleString()}</span>
                {inv.status !== 'Paid' ? <button onClick={() => startPay(inv)} className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium inline-flex items-center gap-1.5 hover:bg-black"><CreditCard size={14} /> Pay now</button> : <span className="h-9 px-4 rounded-full bg-[#f1ece6] text-[12px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Paid {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : ''}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {paying && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[420px] rounded-[28px] bg-white border border-[#e8e6e1] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold">Pay invoice #{String(paying).padStart(5, '0')}</h3>
              <button onClick={() => setPaying(null)} className="w-8 h-8 rounded-full bg-[#f6f3ee] grid place-items-center"><X size={14} /></button>
            </div>
            {paymentStep === 'form' && (
              <>
                <div className="rounded-[18px] bg-[#fafaf8] border border-[#ece8e1] p-4 mb-4">
                  <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3">DUMMY CARD • TEST MODE</p>
                  <div className="space-y-3">
                    <input value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} placeholder="Name on card" className="w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111]" />
                    <input value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })} placeholder="Card number" className="w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111] font-mono" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={cardForm.exp} onChange={e => setCardForm({ ...cardForm, exp: e.target.value })} placeholder="MM/YY" className="h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111] font-mono" />
                      <input value={cardForm.cvc} onChange={e => setCardForm({ ...cardForm, cvc: e.target.value })} placeholder="CVC" className="h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111] font-mono" />
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-neutral-500 leading-[1.4]">This is a simulated UI only. No real card is charged, no Stripe. Feel free to use <code className="bg-white border px-1 rounded">4242...</code></p>
                </div>
                <button onClick={confirmPay} className="w-full h-12 rounded-full bg-[#111] text-white text-[13px] font-medium hover:bg-black inline-flex items-center justify-center gap-2"><CreditCard size={16} /> Pay securely</button>
                <p className="text-center text-[11px] text-neutral-400 mt-3">Encrypted • Render-ready • PCI dummy</p>
              </>
            )}
            {paymentStep === 'processing' && <div className="py-14 text-center"><Loader2 className="animate-spin mx-auto mb-3" /><p className="text-[14px] font-medium">Processing payment...</p><p className="text-[12px] text-neutral-500 mt-1">Contacting dummy gateway</p></div>}
            {paymentStep === 'secure' && <div className="py-14 text-center"><div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto grid place-items-center mb-3">🔒</div><p className="text-[14px] font-medium">3-D Secure verification</p><p className="text-[12px] text-neutral-500 mt-1">Simulating bank challenge...</p></div>}
            {paymentStep === 'success' && <div className="py-14 text-center"><div className="w-12 h-12 rounded-full bg-[#111] text-white mx-auto grid place-items-center mb-3"><CheckCircle2 /></div><p className="text-[16px] font-semibold">Paid successfully</p><p className="text-[12px] text-neutral-500 mt-1">Receipt sent (dummy) • Invoice marked Paid</p></div>}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NewProjectWrapper() {
  const navigate = useNavigate();
  if (!navigate) return null;
  return <NewProjectPage />;
}

export default function ClientPortal() {
  return (
    <Routes>
      <Route index element={<ClientOverview />} />
      <Route path="projects" element={<ProjectsList />} />
      <Route path="projects/new" element={<NewProjectPage />} />
      <Route path="projects/:id" element={<ProjectDetailRoute />} />
      <Route path="invoices" element={<ClientInvoices />} />
      <Route path="*" element={<ClientOverview />} />
    </Routes>
  );
}

// to make hook happy
import { useNavigate } from 'react-router-dom';
