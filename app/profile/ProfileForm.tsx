'use client';

import { useState } from 'react';
import { updateProfile } from '../lib/auth-actions';
import Link from 'next/link';

export default function ProfileForm({ user }: { user: any }) {
  const [preview, setPreview] = useState(user.logoUrl || null);
  const [logoString, setLogoString] = useState(user.logoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // 1MB Limit
        alert("File is too big! Please use an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setLogoString(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    formData.set('logoUrl', logoString); // Attach the logo string
    await updateProfile(formData);
    setIsSaving(false);
    alert("Profile Updated! ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <form action={handleSubmit} className="space-y-6">
          
          {/* LOGO SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📸 Agency Logo</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                {preview ? (
                  <img src={preview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 transition-all cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">Recommended: Square image, max 1MB.</p>
              </div>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">👤 Personal Details</h2>
            <div className="grid gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Full Name</label>
                <input name="name" type="text" defaultValue={user.name || ''} className="w-full p-3 bg-white text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email (Locked)</label>
                <input type="text" value={user.email} disabled className="w-full p-3 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 font-medium cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Phone / WhatsApp</label>
                <input name="phone" type="text" defaultValue={user.phone || ''} className="w-full p-3 bg-white text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none font-medium" />
              </div>
            </div>
          </div>

          {/* AGENCY INFO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🏢 Agency Details</h2>
            <div className="grid gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Agency Name</label>
                <input name="agencyName" type="text" defaultValue={user.agencyName || ''} className="w-full p-3 bg-white text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">Office Address</label>
                <textarea name="agencyAddress" rows={3} defaultValue={user.agencyAddress || ''} className="w-full p-3 bg-white text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none font-medium resize-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95 text-lg flex justify-center items-center gap-2 disabled:opacity-50">
            {isSaving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}