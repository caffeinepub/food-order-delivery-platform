import React, { useState, useEffect } from 'react';
import { User, Phone, Save, Loader2, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile, useSaveCallerProfile } from '../hooks/useQueries';

export default function AccountView() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading } = useGetCallerProfile();
  const saveProfileMutation = useSaveCallerProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfileMutation.mutateAsync({ name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-orange-100 shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-800 mb-2">Sign In to View Account</h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to manage your profile and preferences.
        </p>
        <button
          onClick={() => login()}
          disabled={loginStatus === 'logging-in'}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-orange-100 shadow-card p-8 animate-pulse">
        <div className="h-6 bg-orange-100 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-orange-50 rounded-lg" />
          <div className="h-10 bg-orange-50 rounded-lg" />
          <div className="h-10 bg-orange-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-orange-100 shadow-card overflow-hidden">
        <div className="bg-orange-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                {profile?.name || 'My Account'}
              </h2>
              <p className="text-orange-100 text-sm">
                {identity?.getPrincipal().toString().slice(0, 20)}...
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <User className="w-3.5 h-3.5 text-orange-500" /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-3.5 h-3.5 text-orange-500" /> Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
              placeholder="Your phone number"
            />
          </div>

          {saveProfileMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              Failed to save profile. Please try again.
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
              Profile saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={saveProfileMutation.isPending}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-orange flex items-center justify-center gap-2"
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
