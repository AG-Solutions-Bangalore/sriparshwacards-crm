import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ProfileView from '../components/profile/ProfileView';
import { useAuthContext } from '../context/AuthContext';
import { changeUserPassword, fetchProfile, updateProfile } from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [form, setForm] = useState({ mobile: '', email: '' });
  const [passForm, setPassForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  /* ── FETCH PROFILE ── */
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchProfile();
      const data = res?.data || res?.profile || res?.user || res || {};
      setProfile(data);
      setForm({
        mobile: data?.mobile ?? data?.phone ?? '',
        email: data?.email ?? '',
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Unable to load profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileVal = (form.mobile || '').trim();
    const emailVal = (form.email || '').trim();

    if (!mobileVal) {
      toast.error('Please enter a mobile number.');
      return;
    }

    if (!emailVal || !emailVal.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ mobile: mobileVal, email: emailVal });
      const msg = res?.message || 'Profile updated successfully.';
      toast.success(msg);
      await loadProfile();
    } catch (err) {
      console.error('[ProfilePage] error updating profile:', err);
      let msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Unable to update profile.';
      if (typeof msg === 'string' && (msg.includes('SQLSTATE') || msg.includes('Integrity constraint'))) {
        msg = 'Unable to update profile. Please verify your mobile and email input values.';
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    setChangingPass(true);
    try {
      const username = profile?.username || localStorage.getItem('sp_cards_username') || 'admin';
      const res = await changeUserPassword({
        username,
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      });
      const msg = res?.message || 'Password changed successfully.';
      toast.success(msg);
      setPassForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to change password.';
      toast.error(msg);
    } finally {
      setChangingPass(false);
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
      passForm={passForm}
      loading={loading}
      saving={saving}
      changingPass={changingPass}
      onChange={handleChange}
      onPassChange={handlePassChange}
      onSubmit={handleSubmit}
      onPassSubmit={handlePassSubmit}
      onLogout={handleLogout}
    />
  );
}

export default ProfilePage;
