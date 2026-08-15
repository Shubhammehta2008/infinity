import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/client', { replace: true });
    }
  }, [user, profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        if (data.user) {
          // create profile
          await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: data.user.id, email, role, full_name: fullName, company })
          });
        }
        if (data.session) {
          navigate(role === 'admin' ? '/admin' : '/client');
        } else {
          setError('Check your email to confirm your account, then sign in.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const demoLogin = async (demoRole: 'admin' | 'client') => {
    const creds = demoRole === 'admin' ? { email: 'admin@studio.com', password: 'admin1234' } : { email: 'client@studio.com', password: 'client1234' };
    setEmail(creds.email); setPassword(creds.password);
    setLoading(true);
    try {
      let { error } = await supabase.auth.signInWithPassword(creds);
      if (error && error.message.includes('Invalid login')) {
        const { data, error: suError } = await supabase.auth.signUp({ email: creds.email, password: creds.password });
        if (suError) throw suError;
        if (data.user) {
          await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: data.user.id, email: creds.email, role: demoRole, full_name: demoRole === 'admin' ? 'Alex Rivera — Founder' : 'Jordan Smith', company: demoRole === 'admin' ? 'Atelier Studio' : 'North Studio Co.' }) });
        }
        const { error: siErr } = await supabase.auth.signInWithPassword(creds);
        if (siErr) throw siErr;
      } else if (error) throw error;
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[1.1fr_0.9fr] bg-[#fafaf8]">
      {/* Left brand panel */}
      <div className="relative hidden md:flex flex-col justify-between p-10 lg:p-12 bg-white border-r border-[#e8e6e1] overflow-hidden">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#111] rounded-[12px] flex items-center justify-center text-white font-bold text-[15px]">—</div>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">ATELIER / STUDIO</span>
          </Link>
          <div className="mt-16 max-w-[460px]">
            <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-[#f6f3ee] border border-[#ece8e1] text-[11px] tracking-wide font-medium">
              <Sparkles size={12} /> SECURE CLIENT PORTAL • V1.2
            </div>
            <h1 className="mt-6 text-[42px] leading-[0.95] tracking-[-0.04em] font-[600]">
              Design work,<br />delivered with<br /><span className="font-[300] italic">clarity.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6] text-neutral-600">A minimal command center for freelance designers and their clients — requests, revisions, files, invoices. No Slack Threads. No lost Drive links.</p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { k: '99.8%', v: 'On-time delivery' },
                { k: '2 roles', v: 'Admin • Client' },
                { k: 'Render-ready', v: 'Node + React build' },
                { k: 'Dummy pay', v: 'No Stripe needed' },
              ].map(i => (
                <div key={i.k} className="rounded-2xl bg-[#fafaf8] border border-[#ece8e1] p-4">
                  <p className="text-[18px] font-semibold tracking-tight">{i.k}</p>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 mt-1">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <ShieldCheck size={14} /> SOC2-ready patterns • RLS-ready • Upload buckets isolated
        </div>
        {/* grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center px-6 py-10 md:px-10 lg:px-14">
        <div className="md:hidden mb-8 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#111] rounded-[10px] grid place-items-center text-white font-bold">—</div>
          <span className="text-[13px] font-semibold">ATELIER / STUDIO</span>
        </div>
        <div className="max-w-[420px] w-full mx-auto">
          <h2 className="text-[28px] tracking-[-0.03em] font-semibold">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-[13px] text-neutral-500 mt-2 leading-[1.5]">{isSignUp ? 'Start in 30 seconds. Choose your role — freelancer or client.' : 'Sign in to your secure client portal.'}</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button onClick={() => demoLogin('client')} disabled={loading} className="h-10 rounded-full border border-[#e8e6e1] bg-white text-[13px] font-medium hover:bg-[#f6f3ee] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : null} Demo Client
            </button>
            <button onClick={() => demoLogin('admin')} disabled={loading} className="h-10 rounded-full bg-[#111] text-white text-[13px] font-medium hover:bg-black flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : null} Demo Admin
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ece8e1]" /><span className="text-[10px] tracking-widest text-neutral-400">OR</span><div className="h-px flex-1 bg-[#ece8e1]" />
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="text-[11px] tracking-wide font-semibold text-neutral-600">FULL NAME</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[14px] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111]" placeholder="Alex Rivera" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] tracking-wide font-semibold text-neutral-600">ROLE</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setRole('client')} className={`h-11 rounded-full border text-[13px] font-medium ${role === 'client' ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#e8e6e1]'}`}>Client</button>
                      <button type="button" onClick={() => setRole('admin')} className={`h-11 rounded-full border text-[13px] font-medium ${role === 'admin' ? 'bg-[#111] text-white border-[#111]' : 'bg-white border-[#e8e6e1]'}`}>Admin</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] tracking-wide font-semibold text-neutral-600">COMPANY</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[14px] outline-none focus:border-[#111]" placeholder="Optional" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-[11px] tracking-wide font-semibold text-neutral-600">EMAIL</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required type="email" className="mt-1.5 w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 text-[14px] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111]" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-[11px] tracking-wide font-semibold text-neutral-600">PASSWORD</label>
              <div className="mt-1.5 relative">
                <input value={password} onChange={e => setPassword(e.target.value)} required type={showPw ? 'text' : 'password'} className="w-full h-11 rounded-full border border-[#e8e6e1] bg-white px-4 pr-11 text-[14px] outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111]" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f6f3ee] grid place-items-center">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            {error && <div className="rounded-2xl bg-[#fff1f1] border border-[#ffd6d6] p-3 text-[13px] text-red-700 leading-[1.4]">{error}</div>}
            <button disabled={loading} type="submit" className="w-full h-11 rounded-full bg-[#111] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <button onClick={() => signInWithGoogle('Atelier Studio Portal')} className="mt-3 w-full h-11 rounded-full bg-white border border-[#e8e6e1] text-[13px] font-medium hover:bg-[#fafaf8] flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-4 h-4" /> Continue with Google
          </button>

          <p className="mt-6 text-center text-[13px] text-neutral-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 font-medium">{isSignUp ? 'Sign in' : 'Create account'}</button>
          </p>

          <div className="mt-8 rounded-2xl border border-[#ece8e1] bg-white p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f6f3ee] grid place-items-center shrink-0">🔒</div>
            <p className="text-[12px] leading-[1.5] text-neutral-600"><span className="font-semibold text-neutral-900">Render-ready architecture:</span> Frontend is pure React/Vite static — deployable to Render Static. API routes are Express-compatible serverless functions (<code className="bg-[#fafaf8] border px-1 rounded text-[11px]">/api/*</code>) that map 1:1 to an Express server for Render Web Services. Swap fetch baseURL and deploy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
