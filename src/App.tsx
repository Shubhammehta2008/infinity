import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import supabase from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ClientPortal from './pages/ClientPortal';
import AdminPortal from './pages/AdminPortal';
import { LogOut, LayoutDashboard, Folder, Receipt, Users, MessageSquareDashed, Sparkles } from 'lucide-react';

function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex bg-[#fafaf8]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[272px] shrink-0 flex-col justify-between border-r border-[#e8e6e1] bg-white sticky top-0 h-screen">
        <div>
          <div className="px-7 pt-8 pb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#111] rounded-[10px] flex items-center justify-center text-white text-[13px] font-bold tracking-tighter">—</div>
              <span className="text-[14px] font-semibold tracking-[-0.02em]">ATELIER / STUDIO</span>
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f1ece6] flex items-center justify-center text-[12px] font-semibold">{profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-none truncate">{profile?.full_name || user?.email?.split('@')[0]}</p>
                <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wide truncate">{profile?.role} • {profile?.company || 'Atelier'}</p>
              </div>
            </div>
          </div>
          <nav className="px-3 mt-2 space-y-6">
            <div>
              <p className="px-4 text-[10px] tracking-[0.18em] text-neutral-400 font-semibold mb-2">NAVIGATE</p>
              {(profile?.role === 'admin' ? [
                { label: 'Command Center', icon: LayoutDashboard, path: '/admin' },
                { label: 'Clients', icon: Users, path: '/admin/clients' },
                { label: 'Project Pipeline', icon: Folder, path: '/admin/projects' },
                { label: 'Invoices', icon: Receipt, path: '/admin/invoices' },
              ] : [
                { label: 'Overview', icon: LayoutDashboard, path: '/client' },
                { label: 'My Projects', icon: Folder, path: '/client/projects' },
                { label: 'Invoices', icon: Receipt, path: '/client/invoices' },
              ]).map(item => {
                const active = location.pathname === item.path || (item.path !== (isAdminPage ? '/admin' : '/client') && location.pathname.startsWith(item.path));
                return (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 h-9 rounded-full text-[13px] transition-all ${active ? 'bg-[#111] text-white' : 'text-neutral-600 hover:bg-[#f6f3ee]'}`}> 
                    <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="px-4">
              <div className="rounded-2xl bg-[#f8f4ef] border border-[#ece8e1] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-amber-700" />
                  <p className="text-[11px] font-semibold tracking-wide">DEPLOY NOTE</p>
                </div>
                <p className="text-[12px] leading-[1.45] text-neutral-600">Structured for Render: frontend on static, API as Node/Express-compatible serverless routes. Add <code className="bg-white px-1 rounded text-[11px]">/api</code> env.</p>
              </div>
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-[#ece8e1]">
          <button onClick={handleLogout} className="w-full h-9 rounded-full border border-[#e8e6e1] bg-white flex items-center justify-center gap-2 text-[12px] font-medium hover:bg-[#fafaf8] transition">
            <LogOut size={14} /> Sign Out
          </button>
          <p className="mt-3 text-[10px] text-center tracking-wide text-neutral-400">© {new Date().getFullYear()} ATELIER — PORTAL V1.2</p>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#e8e6e1] flex items-center justify-between px-4 h-[56px]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#111] rounded-[9px] flex items-center justify-center text-white text-[12px] font-bold">—</div>
          <span className="text-[12px] font-semibold">ATELIER</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 h-6 rounded-full bg-[#111] text-white flex items-center">{profile?.role?.toUpperCase()}</span>
          <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-[#f6f3ee] flex items-center justify-center"><LogOut size={14} /></button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 pt-[56px] md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#e8e6e1] flex justify-around items-center h-[64px] px-2">
        {(profile?.role === 'admin' ? [
          { label: 'Home', icon: LayoutDashboard, path: '/admin' },
          { label: 'Clients', icon: Users, path: '/admin/clients' },
          { label: 'Work', icon: Folder, path: '/admin/projects' },
          { label: 'Pay', icon: Receipt, path: '/admin/invoices' },
        ] : [
          { label: 'Home', icon: LayoutDashboard, path: '/client' },
          { label: 'Projects', icon: Folder, path: '/client/projects' },
          { label: 'Invoices', icon: Receipt, path: '/client/invoices' },
        ]).map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 text-[10px] ${active ? 'text-[#111]' : 'text-neutral-400'}`}>
              <item.icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { user, profile, loading, profileLoading } = useAuth();
  if (loading || profileLoading) {
    return <div className="min-h-screen grid place-items-center bg-[#fafaf8]"><div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/client" replace />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client/*" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
