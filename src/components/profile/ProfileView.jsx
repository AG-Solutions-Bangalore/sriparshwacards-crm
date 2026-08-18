import { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import { useAppContext } from '../../context/AppContext';

function ProfileView({
  profile,
  form,
  passForm,
  loading,
  saving,
  changingPass,
  onChange,
  onPassChange,
  onSubmit,
  onPassSubmit,
}) {
  const { companyInfo, companyLogoUrl } = useAppContext();
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F0] text-[#1A1817] font-sans">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              User Profile
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">
              Manage your personal account settings, contact details & password
            </p>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-white px-3 py-1.5 shadow-xs border border-[#E5E0D8] text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFECE6] text-xs font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                {profile?.name
                  ? profile.name.slice(0, 2).toUpperCase()
                  : 'AD'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1817] leading-tight">
                  {profile?.name || profile?.username || 'Admin User'}
                </p>
                <p className="text-[10px] text-[#8C857B] leading-tight">
                  {profile?.role || 'Manager'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-[#E8E3DA] bg-white p-12 shadow-xs">
            <div className="flex flex-col items-center gap-3 text-[#8C857B]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A1817] border-t-transparent" />
              <p className="text-xs font-semibold uppercase tracking-wider">Loading profile details...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Card: Summary Avatar & Quick Info */}
            <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#EFECE6] font-serif text-2xl font-bold text-[#1A1817] border-2 border-[#D5CFC5] shadow-xs">
                  {profile?.name
                    ? profile.name.slice(0, 2).toUpperCase()
                    : 'AD'}
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1A1817]">
                  {profile?.name || profile?.username || 'Admin User'}
                </h2>
                <p className="text-xs font-medium text-[#8C857B]">
                  {profile?.role || 'Administrator'}
                </p>

                <div className="mt-6 w-full border-t border-[#F0ECE1] pt-6 text-left space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C857B]">Username</span>
                    <p className="mt-0.5 text-xs font-semibold text-[#1A1817]">{profile?.username || 'admin'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C857B]">Current Mobile</span>
                    <p className="mt-0.5 text-xs font-semibold text-[#1A1817]">{profile?.mobile || profile?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C857B]">Current Email</span>
                    <p className="mt-0.5 text-xs font-semibold text-[#1A1817]">{profile?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Company Details Card */}
              {companyInfo && (
                <div className="mt-6 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] p-5 text-left space-y-3">
                  <div className="flex items-center gap-3 border-b border-[#E2DDD5] pb-3">
                    {companyLogoUrl && (
                      <img src={companyLogoUrl} alt="Logo" className="h-7 w-auto object-contain" />
                    )}
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#1A1817]">{companyInfo.company_name}</h3>
                      <p className="text-[10px] text-[#8C857B]">{companyInfo.company_email}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8C857B]">Address</span>
                    <p className="mt-0.5 text-[11px] text-[#1A1817] leading-relaxed">{companyInfo.company_address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8C857B]">Mobile</span>
                      <p className="mt-0.5 font-mono text-[#1A1817]">{companyInfo.company_mobile_no}</p>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8C857B]">WhatsApp</span>
                      <p className="mt-0.5 font-mono text-[#1A1817]">{companyInfo.company_whatsapp_no}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Edit Profile + Change Password */}
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Edit Profile Information Card */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#F0ECE1] px-6 py-4 bg-[#FAF8F5]">
                  <h2 className="font-serif text-lg font-normal text-[#1A1817]">Edit Profile Information</h2>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-5">
                  {/* Mobile Input */}
                  <div>
                    <label htmlFor="mobile" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#59534C]">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C857B]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        id="mobile"
                        name="mobile"
                        type="text"
                        value={form.mobile}
                        onChange={onChange}
                        placeholder="Enter mobile number"
                        required
                        className="w-full rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] py-2.5 pl-10 pr-4 text-xs text-[#1A1817] shadow-xs outline-none transition focus:border-[#1A1817]"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#59534C]">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C857B]">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="Enter email address"
                        required
                        className="w-full rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] py-2.5 pl-10 pr-4 text-xs text-[#1A1817] shadow-xs outline-none transition focus:border-[#1A1817]"
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end pt-4 border-t border-[#F0ECE1]">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Updating Profile...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Change Password Card */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#F0ECE1] px-6 py-4 bg-[#FAF8F5]">
                  <h2 className="font-serif text-lg font-normal text-[#1A1817]">Change Password</h2>
                  <p className="text-xs text-[#8C857B]">Update your account password securely after login</p>
                </div>

                <form onSubmit={onPassSubmit} className="p-6 space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#59534C]">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        name="old_password"
                        type={showOldPass ? 'text' : 'password'}
                        value={passForm.old_password}
                        onChange={onPassChange}
                        placeholder="Enter current password"
                        required
                        className="w-full rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] py-2.5 pl-4 pr-10 text-xs text-[#1A1817] shadow-xs outline-none transition focus:border-[#1A1817]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#1A1817] transition cursor-pointer"
                      >
                        {showOldPass ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.73-4.39 6.078-7.5 11.164-7.5 5.086 0 9.434 3.11 11.164 7.5-1.73 4.39-6.078 7.5-11.164 7.5-5.086 0-9.434-3.11-11.164-7.5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#59534C]">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        name="new_password"
                        type={showNewPass ? 'text' : 'password'}
                        value={passForm.new_password}
                        onChange={onPassChange}
                        placeholder="Enter new password"
                        required
                        className="w-full rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] py-2.5 pl-4 pr-10 text-xs text-[#1A1817] shadow-xs outline-none transition focus:border-[#1A1817]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#1A1817] transition cursor-pointer"
                      >
                        {showNewPass ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.73-4.39 6.078-7.5 11.164-7.5 5.086 0 9.434 3.11 11.164 7.5-1.73 4.39-6.078 7.5-11.164 7.5-5.086 0-9.434-3.11-11.164-7.5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#59534C]">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        name="confirm_password"
                        type={showConfirmPass ? 'text' : 'password'}
                        value={passForm.confirm_password}
                        onChange={onPassChange}
                        placeholder="Re-enter new password"
                        required
                        className="w-full rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] py-2.5 pl-4 pr-10 text-xs text-[#1A1817] shadow-xs outline-none transition focus:border-[#1A1817]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#1A1817] transition cursor-pointer"
                      >
                        {showConfirmPass ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.73-4.39 6.078-7.5 11.164-7.5 5.086 0 9.434 3.11 11.164 7.5-1.73 4.39-6.078 7.5-11.164 7.5-5.086 0-9.434-3.11-11.164-7.5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Submit Action */}
                  <div className="flex items-center justify-end pt-4 border-t border-[#F0ECE1]">
                    <button
                      type="submit"
                      disabled={changingPass}
                      className="rounded-lg bg-[#1A1817] hover:bg-[#38332E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {changingPass ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfileView;
