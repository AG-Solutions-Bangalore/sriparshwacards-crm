import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ProfileView from '../components/profile/ProfileView';
import { useAuthContext } from '../context/AuthContext';
import { fetchProfile, updateProfile } from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState({ mobile: '', email: '' });

  /* ── FETCH PROFILE ── */
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile();
      console.log('[ProfilePage] panel-fetch-profile:', res);

      const data = res?.data || res?.profile || res?.user || res || {};
      setProfile(data);
      setForm({
        mobile: data?.mobile ?? data?.phone ?? '',
        email:  data?.email  ?? '',
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Unable to load profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  /* ── HANDLE FIELD CHANGE ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── SUBMIT UPDATE ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({ mobile: form.mobile, email: form.email });
      const msg = res?.message || 'Profile updated successfully.';
      toast.success(msg);
      await loadProfile(); // re-fetch to confirm saved values
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Unable to update profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <ProfileView
      profile={profile}
      form={form}
      loading={loading}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onLogout={handleLogout}
    />
  );
}

export default ProfilePage;
