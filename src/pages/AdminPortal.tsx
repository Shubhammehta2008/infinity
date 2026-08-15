import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Users, FolderKanban, DollarSign, ArrowUpRight, Clock, Search, Plus, Pencil, Trash2, FileUp, Loader2, Send, CheckCircle2, X, Download, MessageSquare, Receipt, CreditCard, FileText, Calendar, Filter, MoreHorizontal } from 'lucide-react';

type Profile = any;
type Project = any;
type Invoice = any;

const STATUS_STEPS = ['Submitted', 'In Review', 'In Progress', 'Needs Changes', 'Final Review', 'Completed'];
const STATUS_COLOR: Record<string, string> = {
  Submitted: 'bg-[#fff7e6] text-[#8a5a00] border-[#ffe4a8]',
  'In Review': 'bg-[#eef2ff] text-[#2f3b9b] border-[#c9d1ff]',
  'In Progress': 'bg-[#e9f7ef] text-[#1a6b3c] border-[#bfe8cf]',
  'Needs Changes': 'bg-[#fff1f1] text-[#8c1d1d] border-[#ffcaca]',
  'Final Review': 'bg-[#f5f0ff] text-[#5a2bb5] border-[#d9c8ff]',
  Completed: 'bg-[#111] text-white border-[#111]',
};

function AdminOverview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projRes, profRes, invRes] = await Promise.all([
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/profiles').then(r => r.json()),
          fetch('/api/invoices').then(r => r.json())
        ]);
        setProjects(Array.isArray(projRes) ? projRes : []);
        setProfiles(Array.isArray(profRes) ? profRes : []);
        setInvoices(Array.isArray(invRes) ? invRes : []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const clients = profiles.filter((p: any) => p.role === 'client');
  const active = projects.filter((p: any) => p.status !== 'Completed');
  const revenuePending = invoices.filter((i: any) => i.status !== 'Paid').reduce((s: number, i: any) => s + Number(i.amount), 0);
  const revenuePaid = invoices.filter((i: any) => i.status === 'Paid').reduce((s: number, i: any) => s + Number(i.amount), 0);

  const pipelineCount = STATUS_STEPS.map(s => ({ status: s, count: projects.filter((p: any) => p.status === s).length }));

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[30px] md:text-[36px] font-semibold tracking-[-0.03em] leading-[0.95]">Command Center</h1>
          <p className="text-[13px] text-neutral-500 mt-2">Freelancer HQ — manage clients, pipeline, delivery & revenue.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/clients" className="h-9 px-4 rounded-full bg-white border border-[#e8e6e1] text-[12px] font-medium inline-flex items-center gap-1.5"><Users size={14} /> Clients</Link>
          <Link to="/admin/projects" className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium inline-flex items-center gap-1.5"><FolderKanban size={14} /> Pipeline</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active projects', value: loading ? '—' : active.length, sub: `${projects.length} total • ${projects.filter((p: any) => p.status === 'Submitted').length} new`, icon: FolderKanban },
          { label: 'Clients', value: loading ? '—' : clients.length, sub: 'registered portals', icon: Users },
          { label: 'Pending revenue', value: loading ? '—' : `$${revenuePending.toLocaleString()}`, sub: `${invoices.filter((i: any) => i.status !== 'Paid').length} unpaid`, icon: DollarSign },
          { label: 'Collected', value: loading ? '—' : `$${revenuePaid.toLocaleString()}`, sub: 'paid invoices', icon: Receipt },
        ].map((c, i) => (
          <div key={i} className="rounded-[22px] bg-white border border-[#e8e6e1] p-5">
            <div className="flex items-center justify-between mb-3"><c.icon size={16} className="text-neutral-400" /><span className="text-[10px] tracking-widest text-neutral-400 font-semibold">ADMIN METRIC</span></div>
            <p className="text-[28px] font-semibold tracking-[-0.02em] leading-none">{c.value}</p>
            <p className="text-[11px] text-neutral-500 mt-2">{c.label} • {c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 mb-6">
        <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-6">
          <div className="flex items-center justify-between mb-5"><h3 className="text-[14px] font-semibold">Pipeline distribution</h3><span className="text-[11px] text-neutral-500">{projects.length} requests</span></div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {pipelineCount.map(pc => (
              <div key={pc.status} className="rounded-[16px] border border-[#ece8e1] bg-[#fafaf8] p-3">
                <p className="text-[20px] font-semibold tracking-tight">{pc.count}</p>
                <p className="text-[10px] uppercase tracking-wide text-neutral-500 mt-1 leading-[1.2]">{pc.status}</p>
                <div className="mt-2 h-1 rounded-full bg-[#ece8e1] overflow-hidden"><div className="h-full bg-[#111] transition-all" style={{ width: `${projects.length ? (pc.count / Math.max(...pipelineCount.map(p => p.count), 1)) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] bg-[#111] text-white p-6 relative overflow-hidden">
          <h3 className="text-[13px] font-semibold tracking-wide">REVENUE SPLIT</h3>
          <div className="mt-6 flex items-end gap-3 h-[86px]">
            {[0.2, 0.5, 0.35, 0.8, 0.6, revenuePaid > 0 ? 1 : 0.3].map((v, i) => <div key={i} className="flex-1 rounded-full bg-white/15" style={{ height: `${v * 100}%` }}><div className="w-full h-full rounded-full bg-white" style={{ opacity: 0.8 - i * 0.08 }} /></div>)}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-[12px]">
            <div><p className="text-white/60 text-[11px] tracking-wide">PENDING</p><p className="text-[16px] font-semibold mt-1">${revenuePending.toLocaleString()}</p></div>
            <div><p className="text-white/60 text-[11px] tracking-wide">COLLECTED</p><p className="text-[16px] font-semibold mt-1">${revenuePaid.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-semibold">Incoming requests</h3><Link to="/admin/projects" className="text-[11px] font-medium flex items-center gap-1">Open pipeline <ArrowUpRight size={12} /></Link></div>
          {loading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div> : projects.slice(0, 5).map((p: any) => (
            <Link key={p.id} to={`/admin/projects/${p.id}`} className="flex items-center justify-between py-3 border-b last:border-b-0 border-[#f0ede8] group">
              <div className="min-w-0"><p className="text-[13px] font-medium truncate group-hover:underline">{p.title}</p><p className="text-[11px] text-neutral-500 mt-0.5">{p.client_name} • {p.type} • {new Date(p.created_at).toLocaleDateString()}</p></div>
              <span className={`shrink-0 ml-3 px-2.5 h-6 rounded-full border text-[10px] font-semibold inline-flex items-center ${STATUS_COLOR[p.status]}`}>{p.status}</span>
            </Link>
          ))}
        </div>
        <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-semibold">Recent clients</h3><Link to="/admin/clients" className="text-[11px] font-medium flex items-center gap-1">Manage <ArrowUpRight size={12} /></Link></div>
          {loading ? <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div> : clients.slice(0, 5).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b last:border-b-0 border-[#f0ede8]">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#f6f3ee] grid place-items-center text-[11px] font-bold">{c.full_name?.[0]?.toUpperCase() || c.email[0].toUpperCase()}</div><div><p className="text-[13px] font-medium">{c.full_name}</p><p className="text-[11px] text-neutral-500">{c.email}</p></div></div>
              <span className="text-[10px] px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center tracking-wide">{projects.filter((p: any) => p.client_id === c.id || p.client_email === c.email).length} projects</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminClients() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pr, pf] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/profiles').then(r => r.json())
      ]);
      setProjects(Array.isArray(pr) ? pr : []);
      setProfiles(Array.isArray(pf) ? pf : []);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const clients = profiles.filter((p: any) => p.role === 'client').filter((c: any) => !q || c.email.toLowerCase().includes(q.toLowerCase()) || c.full_name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Clients</h1>
        <div className="flex items-center gap-2">
          <div className="h-9 rounded-full bg-white border border-[#e8e6e1] flex items-center gap-2 px-3"><Search size={14} className="text-neutral-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email or name" className="bg-transparent outline-none text-[12px] w-[180px]" /></div>
        </div>
      </div>
      {loading ? <div className="grid md:grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-[96px] shimmer rounded-[20px]" />)}</div> : clients.length === 0 ? <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-10 text-center text-[13px] text-neutral-500">No clients found</div> : (
        <div className="grid md:grid-cols-2 gap-3">
          {clients.map((c: any) => {
            const cp = projects.filter((p: any) => p.client_id === c.id || p.client_email === c.email);
            return (
              <div key={c.id} className="rounded-[22px] bg-white border border-[#e8e6e1] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#f6f3ee] grid place-items-center text-[13px] font-bold">{c.full_name?.[0]?.toUpperCase() || c.email[0].toUpperCase()}</div>
                    <div><p className="text-[14px] font-semibold tracking-[-0.01em]">{c.full_name}</p><p className="text-[12px] text-neutral-500">{c.email} • {c.company || 'No company'}</p><p className="text-[11px] text-neutral-400 mt-1">Joined {new Date(c.created_at).toLocaleDateString()} • {cp.length} projects • {cp.filter((p: any) => p.status === 'Completed').length} completed</p></div>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-[#fafaf8] border border-[#ece8e1] grid place-items-center"><MoreHorizontal size={14} /></button>
                </div>
                <div className="mt-4 flex gap-2">{cp.slice(0, 3).map((p: any) => <span key={p.id} className={`text-[10px] px-2 h-5 rounded-full border inline-flex items-center font-medium ${STATUS_COLOR[p.status]}`}>{p.status}</span>)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const fetchProjects = async () => {
    try { setLoading(true); const data = await fetch('/api/projects').then(r => r.json()); setProjects(Array.isArray(data) ? data : []); } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchProjects(); }, []);
  const filtered = projects.filter((p: any) => {
    const matchStatus = filter === 'All' || p.status === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client_email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });
  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchProjects();
  };

  return (
    <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Project Pipeline</h1>
        <div className="flex items-center gap-2">
          <div className="h-9 rounded-full bg-white border border-[#e8e6e1] flex items-center gap-2 px-3"><Search size={14} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects / client" className="bg-transparent outline-none text-[12px] w-[200px]" /></div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', ...STATUS_STEPS].map(s => <button key={s} onClick={() => setFilter(s)} className={`h-8 px-3.5 rounded-full border text-[12px] font-medium transition ${filter === s ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#e8e6e1] text-neutral-600 hover:border-[#111]'}`}>{s}</button>)}
      </div>
      {loading ? <div className="grid md:grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-[138px] shimmer rounded-[20px]" />)}</div> : filtered.length === 0 ? <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-12 text-center text-[13px] text-neutral-500">No projects in this filter</div> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p: any) => (
            <div key={p.id} className="group rounded-[22px] bg-white border border-[#e8e6e1] p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0"><Link to={`/admin/projects/${p.id}`} className="text-[14px] font-semibold tracking-[-0.01em] leading-[1.2] hover:underline">{p.title}</Link><p className="text-[11px] text-neutral-500 mt-1 truncate">{p.client_name} • {p.client_email}</p></div>
                <span className={`shrink-0 px-2.5 h-6 rounded-full border text-[10px] font-bold tracking-wide inline-flex items-center ${STATUS_COLOR[p.status]}`}>{p.status}</span>
              </div>
              <p className="text-[12px] leading-[1.5] text-neutral-600 line-clamp-2 min-h-[36px]">{p.description || 'No description'}</p>
              <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]"><span className="px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{p.type}</span><span className="px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{p.priority}</span><span className="px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{p.budget_range}</span></div>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {STATUS_STEPS.map(s => <button key={s} onClick={() => updateStatus(p.id, s)} className={`h-7 rounded-full text-[10px] font-medium border transition ${p.status === s ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#ece8e1] text-neutral-600 hover:border-neutral-900'}`}>{s}</button>)}
              </div>
              <div className="mt-4 pt-4 border-t border-[#f0ede8] flex items-center justify-between text-[11px] text-neutral-500"><span className="flex items-center gap-1"><Clock size={12} /> {new Date(p.updated_at).toLocaleDateString()}</span><Link to={`/admin/projects/${p.id}`} className="font-medium text-[#111] inline-flex items-center gap-1 hover:underline">Manage <ArrowUpRight size={12} /></Link></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProjectDetail() {
  const loc = useLocation();
  const id = loc.pathname.split('/').pop()!;
  const { profile, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [finalFiles, setFinalFiles] = useState<{ name: string, url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchAll = async () => {
    const pr = await fetch(`/api/projects?id=${id}`).then(r => r.json());
    const item = Array.isArray(pr) ? pr[0] : pr;
    setProject(item);
    if (item) {
      const cm = await fetch(`/api/comments?project_id=${item.id}`).then(r => r.json());
      setComments(Array.isArray(cm) ? cm : []);
      setFinalFiles(item.final_files || []);
    }
  };
  useEffect(() => { fetchAll(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!project) return;
    setSavingStatus(true);
    await fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id, status }) });
    setSavingStatus(false);
    fetchAll();
  };

  const uploadFinal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    setUploading(true);
    try {
      for (const f of Array.from(fileList)) {
        const reader = new FileReader();
        const base64: string = await new Promise((res, rej) => { reader.onload = () => res((reader.result as string).split(',')[1]); reader.onerror = rej; reader.readAsDataURL(f); });
        const r = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: f.name, fileBase64: base64, contentType: f.type, folder: 'finals' }) });
        const j = await r.json();
        if (j.url) setFinalFiles(prev => [...prev, { name: f.name, url: j.url }]);
      }
    } catch { } finally { setUploading(false); }
  };

  const saveFinalFiles = async () => {
    if (!project) return;
    await fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id, final_files: finalFiles }) });
    fetchAll();
  };

  const postComment = async () => {
    if (!newComment.trim() || !project) return;
    await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: project.id, author_id: profile?.user_id || user?.id, author_name: profile?.full_name || user?.email, author_role: profile?.role || 'admin', message: newComment }) });
    setNewComment('');
    const cm = await fetch(`/api/comments?project_id=${project.id}`).then(r => r.json());
    setComments(Array.isArray(cm) ? cm : []);
  };

  if (!project) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <Link to="/admin/projects" className="text-[12px] text-neutral-500 hover:text-black mb-5 inline-flex">← Back to pipeline</Link>
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-[28px] bg-white border border-[#e8e6e1] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3 mb-6"><div><h1 className="text-[24px] font-semibold tracking-[-0.03em]">{project.title}</h1><p className="text-[12px] text-neutral-500 mt-1">{project.client_name} • {project.client_email} • {project.type}</p></div><span className={`px-3 h-7 rounded-full border text-[11px] font-bold inline-flex items-center ${STATUS_COLOR[project.status]}`}>{project.status}</span></div>

          <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3">UPDATE STATUS</p>
          <div className="flex flex-wrap gap-2 mb-6">{STATUS_STEPS.map(s => <button key={s} disabled={savingStatus} onClick={() => updateStatus(s)} className={`h-9 px-4 rounded-full border text-[12px] font-medium transition ${project.status === s ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#e8e6e1] hover:border-[#111]'}`}>{savingStatus && project.status !== s ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}{s}</button>)}</div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-[18px] bg-[#fafaf8] border border-[#ece8e1] p-4"><p className="text-[11px] font-semibold tracking-wide text-neutral-500">CLIENT BRIEF</p><p className="text-[13px] leading-[1.6] mt-2 whitespace-pre-wrap">{project.description}</p><p className="mt-3 text-[11px] text-neutral-500">Budget: {project.budget_range} • Priority: {project.priority} • Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}</p></div>
            <div className="space-y-3">
              <div className="rounded-[18px] bg-[#fafaf8] border border-[#ece8e1] p-4"><p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-2">REFERENCES</p>{(project.reference_files as any[])?.length ? (project.reference_files as any[]).map((f: any, i: number) => <a key={i} href={f.url} target="_blank" className="flex items-center justify-between py-2 text-[12px] hover:underline"><span className="truncate">{f.name || f.url}</span><Download size={12} /></a>) : <p className="text-[12px] text-neutral-500">None</p>}</div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#ece8e1] p-4 bg-[#fcfbf9]">
            <p className="text-[11px] font-semibold tracking-wide text-neutral-500 mb-3 flex items-center gap-2"><MessageSquare size={12} /> THREAD ({comments.length})</p>
            <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
              {comments.map((c: any) => <div key={c.id} className={`flex gap-2.5 ${c.author_role === 'admin' ? 'flex-row-reverse' : ''}`}><div className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${c.author_role === 'admin' ? 'bg-[#111] text-white' : 'bg-[#f1ece6]'}`}>{c.author_name?.[0]?.toUpperCase()}</div><div className={`max-w-[78%] rounded-[16px] px-4 py-2.5 border ${c.author_role === 'admin' ? 'bg-white border-[#ece8e1]' : 'bg-[#111] text-white border-[#111]'}`}><p className="text-[11px] opacity-60 mb-1">{c.author_name} • {c.author_role.toUpperCase()}</p><p className="text-[13px] leading-[1.4]">{c.message}</p></div></div>)}
              {comments.length === 0 && <p className="text-center text-[12px] text-neutral-500 py-6">No comments</p>}
            </div>
            <div className="mt-3 flex gap-2"><input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), postComment())} placeholder="Reply to client…" className="flex-1 h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[13px] outline-none focus:border-[#111]" /><button onClick={postComment} className="w-11 h-11 rounded-full bg-[#111] text-white grid place-items-center"><Send size={16} /></button></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-5">
            <h3 className="text-[13px] font-semibold">Final Delivery</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Upload finals here. They become visible to client.</p>
            <label className="mt-4 flex flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#d8d4ce] bg-[#fdfcfa] p-6 cursor-pointer hover:bg-[#fafaf8]">
              <FileUp size={18} />
              <span className="text-[12px] font-medium">Click to upload final files</span>
              <span className="text-[11px] text-neutral-500">ZIP, PDF, PNG — high res</span>
              <input type="file" multiple onChange={uploadFinal} className="hidden" />
            </label>
            {uploading && <p className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Uploading...</p>}
            {finalFiles.length > 0 && <div className="mt-3 space-y-2">{finalFiles.map((f, i) => <div key={i} className="flex items-center justify-between bg-[#fafaf8] border border-[#ece8e1] rounded-full px-3 h-9 text-[12px]"><span className="truncate">{f.name}</span><button onClick={() => setFinalFiles(finalFiles.filter((_, j) => j !== i))} className="w-6 h-6 rounded-full bg-white border border-[#ece8e1] grid place-items-center"><X size={12} /></button></div>)}</div>}
            <button onClick={saveFinalFiles} className="mt-4 w-full h-10 rounded-full bg-[#111] text-white text-[12px] font-medium hover:bg-black">Save final files & notify client</button>
          </div>
          <div className="rounded-[24px] bg-[#f8f4ef] border border-[#ece8e1] p-5">
            <p className="text-[11px] font-semibold tracking-wide text-neutral-500">CLIENT INFO</p>
            <div className="mt-3 space-y-2 text-[12px]"><div className="flex justify-between"><span className="text-neutral-500">Name</span><span className="font-medium">{project.client_name}</span></div><div className="flex justify-between"><span className="text-neutral-500">Email</span><span className="font-medium truncate ml-4">{project.client_email}</span></div><div className="flex justify-between"><span className="text-neutral-500">Created</span><span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span></div></div>
            <div className="mt-4 h-px bg-[#ece8e1]" />
            <p className="mt-4 text-[11px] font-semibold tracking-wide text-neutral-500">RENDER DEPLOY TIP</p>
            <p className="mt-2 text-[12px] leading-[1.5] text-neutral-600">This admin portal maps to Express routes: <code className="bg-white border px-1 rounded text-[11px]">GET /api/projects</code>, <code className="bg-white border px-1 rounded text-[11px]">PUT /api/projects</code>. Swap Vercel functions to Express on Render.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ project_id: '', client_id: '', client_email: '', title: '', amount: '', due_date: '', itemsText: 'Design — Concept & Execution\nRevisions — 2 rounds' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try { setLoading(true); const [inv, proj, prof] = await Promise.all([fetch('/api/invoices').then(r => r.json()), fetch('/api/projects').then(r => r.json()), fetch('/api/profiles').then(r => r.json())]); setInvoices(Array.isArray(inv) ? inv : []); setProjects(Array.isArray(proj) ? proj : []); setProfiles(Array.isArray(prof) ? prof : []); } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setSaving(true);
    try {
      const items = form.itemsText.split('\n').filter(Boolean).map(line => { const parts = line.split('—'); return { label: parts[0]?.trim() || line.trim(), amount: Math.round(Number(form.amount) / form.itemsText.split('\n').filter(Boolean).length) }; });
      const payload = { project_id: form.project_id ? Number(form.project_id) : null, client_id: form.client_id ? Number(form.client_id) : null, client_email: form.client_email || null, title: form.title, amount: Number(form.amount), currency: 'USD', status: 'Unpaid', due_date: form.due_date || null, items };
      const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowNew(false); setForm({ project_id: '', client_id: '', client_email: '', title: '', amount: '', due_date: '', itemsText: 'Design — Concept & Execution\nRevisions — 2 rounds' }); fetchAll(); }
    } catch { } finally { setSaving(false); }
  };

  const updateInvoiceStatus = async (id: number, status: string) => {
    await fetch('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: status === 'Paid' ? 'Paid' : status, paid: status === 'Paid' }) });
    fetchAll();
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 pb-28 md:pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-[28px] font-semibold tracking-[-0.03em]">Invoices</h1><p className="text-[12px] text-neutral-500 mt-1">Generate invoices tied to projects. Client pays via dummy UI.</p></div>
        <button onClick={() => setShowNew(true)} className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium inline-flex items-center gap-1.5"><Plus size={14} /> New Invoice</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-[88px] shimmer rounded-[18px]" />)}</div> : invoices.length === 0 ? <div className="rounded-[24px] bg-white border border-[#e8e6e1] p-10 text-center text-[13px] text-neutral-500">No invoices yet</div> : (
        <div className="space-y-3">
          {invoices.map((inv: any) => (
            <div key={inv.id} className="rounded-[22px] bg-white border border-[#e8e6e1] p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2"><h3 className="text-[14px] font-semibold">{inv.title}</h3><span className={`px-2 h-5 rounded-full border text-[10px] font-bold inline-flex items-center tracking-wide ${inv.status === 'Paid' ? 'bg-[#111] text-white border-[#111]' : inv.status === 'Overdue' ? 'bg-[#fff1f1] text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>{inv.status?.toUpperCase()}</span></div>
                <p className="text-[11px] text-neutral-500 mt-1">INV-{String(inv.id).padStart(5, '0')} • Client: {inv.client_email || inv.client_id || '—'} • Project #{inv.project_id || '—'} • Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{(inv.items || []).map((it: any, i: number) => <span key={i} className="text-[11px] px-2 h-5 rounded-full bg-[#fafaf8] border border-[#ece8e1] inline-flex items-center">{it.label}</span>)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold">${Number(inv.amount).toLocaleString()}</span>
                <div className="flex items-center gap-1 ml-2">
                  {['Unpaid', 'Paid', 'Overdue'].map(st => <button key={st} onClick={() => updateInvoiceStatus(inv.id, st)} className={`h-7 px-2.5 rounded-full border text-[11px] font-medium ${inv.status === st ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#ece8e1] hover:border-[#111]'}`}>{st}</button>)}
                  <button onClick={async () => { await fetch('/api/invoices', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: inv.id }) }); fetchAll(); }} className="w-7 h-7 rounded-full bg-[#fff1f1] border border-red-200 grid place-items-center text-red-700"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[560px] rounded-[28px] bg-white border border-[#e8e6e1] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5"><h3 className="text-[16px] font-semibold">Generate invoice</h3><button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full bg-[#f6f3ee] grid place-items-center"><X size={14} /></button></div>
            <form onSubmit={createInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">PROJECT</label><select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px] bg-white"><option value="">— No link —</option>{projects.map((p: any) => <option key={p.id} value={p.id}>#{p.id} {p.title}</option>)}</select></div>
                <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">CLIENT PROFILE</label><select value={form.client_id} onChange={e => { const pr = profiles.find((p: any) => String(p.id) === e.target.value); setForm({ ...form, client_id: e.target.value, client_email: pr?.email || form.client_email }); }} className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px] bg-white"><option value="">— Select —</option>{profiles.filter((p: any) => p.role === 'client').map((c: any) => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}</select></div>
              </div>
              <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">CLIENT EMAIL (fallback)</label><input value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} placeholder="client@company.com" className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px]" /></div>
              <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">INVOICE TITLE</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Brand identity — North Studio Co." className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">AMOUNT (USD)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="1200" className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px]" /></div>
                <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">DUE DATE</label><input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] px-4 text-[13px]" /></div>
              </div>
              <div><label className="text-[11px] font-semibold tracking-wide text-neutral-500">LINE ITEMS (newline separated)</label><textarea value={form.itemsText} onChange={e => setForm({ ...form, itemsText: e.target.value })} rows={3} className="mt-1.5 w-full rounded-[18px] border border-[#e8e6e1] p-3 text-[13px]" /></div>
              <button disabled={saving} className="w-full h-11 rounded-full bg-[#111] text-white text-[13px] font-medium hover:bg-black disabled:opacity-60 flex items-center justify-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <><Receipt size={14} /> Generate & Send</>}</button>
              <p className="text-[11px] text-neutral-500 text-center">Dummy invoice — client will see it and can “pay” via test UI. No Stripe call.</p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AdminPortal() {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="clients" element={<AdminClients />} />
      <Route path="projects" element={<AdminProjects />} />
      <Route path="projects/:id" element={<AdminProjectDetail />} />
      <Route path="invoices" element={<AdminInvoices />} />
      <Route path="*" element={<AdminOverview />} />
    </Routes>
  );
}
