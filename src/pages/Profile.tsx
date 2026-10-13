import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, LogOut, Trash2, Loader2, AlertTriangle, User, Phone, MapPin, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Logout nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      // Delete user's listings first (cascade should handle interests)
      if (user) {
        await supabase.from('listings').delete().eq('user_id', user.id);
        await supabase.from('users').delete().eq('id', user.id);
      }

      // Sign out auth session
      await signOut();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Account delete nahi hua');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-enter min-h-screen px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="mt-12 text-center">
          <p className="text-sm">Login karo profile dekhne ke liye</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-bold text-[hsl(var(--primary-foreground))]"
          >
            Login Karo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="mt-4 text-2xl font-bold">👤 Mera Profile</h1>

      {error && (
        <div className="mt-4 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-3 text-sm text-[#833b2e]">
          {error}
        </div>
      )}

      {/* Profile Info */}
      <div className="mt-6 space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-center gap-3">
          <User size={18} className="text-[hsl(var(--muted-foreground))]" />
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Naam</p>
            <p className="font-bold">{user.name || 'Set nahi kiya'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3">
          <Phone size={18} className="text-[hsl(var(--muted-foreground))]" />
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Phone</p>
            <p className="font-bold">{user.phone || '-'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] pt-3">
          <MapPin size={18} className="text-[hsl(var(--muted-foreground))]" />
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Gaon</p>
            <p className="font-bold">{user.village || 'Set nahi kiya'}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> Wait...</>
          ) : (
            <><LogOut size={18} /> Logout</>
          )}
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-[#e5b5a5] text-sm font-bold text-[#833b2e]"
          >
            <Trash2 size={18} /> Account Delete Karo
          </button>
        ) : (
          <div className="rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#833b2e]" />
              <div>
                <p className="font-bold text-[#833b2e]">Pakka delete karna hai?</p>
                <p className="mt-1 text-xs text-[#833b2e]">
                  Aapki saari listings, interests, aur profile hamesha ke liye delete ho jayengi. Ye wapas nahi aayega.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="min-h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[#833b2e] text-xs font-bold text-white disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={14} /> Deleting...</>
                ) : (
                  <><Trash2 size={14} /> Haan, Delete</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Privacy link */}
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
        <Shield size={16} className="mt-0.5 shrink-0" />
        <div>
          <p>Aapka data kaise use hota hai — <a href="/privacy" className="font-bold underline">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
    }
