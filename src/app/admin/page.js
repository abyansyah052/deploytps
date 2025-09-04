'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { FileText, Settings, Lock } from 'lucide-react';

export default function AdminPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const handleMasterAdminClick = () => {
    setShowPasswordModal(true);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'TPS123') {
      // Set authentication in sessionStorage with timestamp
      sessionStorage.setItem('masterAdminAuth', 'authenticated');
      sessionStorage.setItem('masterAdminAuthTime', new Date().getTime().toString());
      
      setShowPasswordModal(false);
      router.push('/admin/master');
    } else {
      setPasswordError('Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-lg text-gray-600">Pilih menu administrasi yang ingin Anda akses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SOP Admin Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <FileText className="h-12 w-12 text-white mb-4" />
              <h2 className="text-2xl font-bold text-white">Edit SOP & Pemberitahuan</h2>
              <p className="text-blue-100 mt-2">Kelola konten SOP dan pemberitahuan</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Edit dan kelola konten SOP serta pemberitahuan yang ditampilkan di dashboard menggunakan rich text editor.
              </p>
              <button
                onClick={() => router.push('/admin/sop')}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Akses Editor SOP
              </button>
            </div>
          </div>

          {/* Master Admin Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <Settings className="h-12 w-12 text-white mb-4" />
              <h2 className="text-2xl font-bold text-white">Master Admin</h2>
              <p className="text-purple-100 mt-2">Kelola dropdown & konfigurasi sistem</p>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Kelola semua dropdown dan konfigurasi sistem termasuk store room, unit of measure, machine number, dan pengaturan lainnya.
              </p>
              <button
                onClick={handleMasterAdminClick}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Lock className="h-5 w-5 mr-2" />
                Akses Master Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Master Admin Access Popup Overlay */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
             onClick={() => setShowPasswordModal(false)}>
          {/* Popup Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all scale-100 border border-gray-200"
               onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-center rounded-t-2xl">
              <Lock className="h-12 w-12 text-white mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Master Admin Access</h3>
              <p className="text-purple-100 mt-1 text-sm">Masukkan password untuk melanjutkan</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Masukkan password..."
                  autoComplete="new-password"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
