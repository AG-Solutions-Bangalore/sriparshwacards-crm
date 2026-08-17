import Sidebar from '../dashboard/Sidebar';

function ProfileView({
  profile,
  form,
  loading,
  saving,
  onChange,
  onSubmit,
  onLogout,
}) {
  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 p-8">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              User Profile
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Manage your personal account settings and contact details
            </p>
          </div>

          {/* Admin badge + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-amber-400 bg-amber-50/60 px-3 py-2 shadow-sm text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3d3a3] text-xs font-bold text-stone-800">
                {profile?.name
                  ? profile.name.slice(0, 2).toUpperCase()
                  : 'AD'}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {profile?.name || profile?.username || 'Admin User'}
                </p>
                <p className="text-xs text-stone-500">
                  {profile?.role || 'Manager'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <svg className="h-8 w-8 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-medium">Loading profile details...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Card: Summary Avatar & Quick Info */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#e3d3a3] text-2xl font-bold text-stone-800 shadow-inner">
                  {profile?.name
                    ? profile.name.slice(0, 2).toUpperCase()
                    : 'AD'}
                </div>
                <h2 className="text-xl font-bold text-stone-900">
                  {profile?.name || profile?.username || 'Admin User'}
                </h2>
                <p className="text-sm font-medium text-stone-500">
                  {profile?.role || 'Administrator'}
                </p>

                <div className="mt-6 w-full border-t border-stone-100 pt-6 text-left space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Username</span>
                    <p className="mt-0.5 text-sm font-medium text-stone-800">{profile?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Current Mobile</span>
                    <p className="mt-0.5 text-sm font-medium text-stone-800">{profile?.mobile || profile?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Current Email</span>
                    <p className="mt-0.5 text-sm font-medium text-stone-800">{profile?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Profile Form */}
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-6 py-4">
                <h2 className="text-base font-semibold text-stone-800">Edit Profile Information</h2>
              </div>

              <form onSubmit={onSubmit} className="p-6 space-y-6">
                {/* Mobile Input */}
                <div>
                  <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-stone-700">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
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
                      className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition
                                 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
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
                      className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 shadow-sm outline-none transition
                                 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end pt-4 border-t border-stone-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfileView;
