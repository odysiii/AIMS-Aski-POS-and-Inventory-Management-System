import React, { useState } from 'react';
import { User, Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/adminDashboard');
  };

  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Left Title Header */}
      <div className="pt-3 pl-4 sm:pl-6 text-gray-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        AIMS - IM - LOG IN
      </div>

      {/* Main Container with Background Grid */}
      <div className="relative flex-1 m-2 sm:m-4 md:m-6 mt-1 rounded-2xl overflow-hidden flex items-center justify-center">
        
        {/* Four Quadrants Background Grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-[#7F7F7F]" />
          <div className="bg-[#E0E0E0]" />
          <div className="bg-[#D8D8D8]" />
          <div className="bg-[#B5B5B5]" />
        </div>

        {/* Floating Centered Login Card */}
        <div className="relative z-10 w-full max-w-[90%] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 pt-10 sm:pt-12 text-center mx-auto my-auto">
          
          {/* Overlapping Avatar Circle */}
          <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[#A8A8A8] to-[#606060] p-1 shadow-lg border-4 border-white flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#9E9E9E] flex items-center justify-center shadow-inner">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
            </div>
          </div>

          {/* Form Title */}
          <h2 className="text-xs sm:text-sm md:text-base font-black text-black tracking-wide uppercase mt-2 mb-4 sm:mb-6">
            INVENTORY MANAGEMENT SYSTEM
          </h2>

          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4 text-left">
            {/* Username Input */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-gray-700 mb-1">
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-500">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-[#EAEAEA] text-gray-800 text-xs font-medium pl-8 sm:pl-9 pr-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-400 border border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-500">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#EAEAEA] text-gray-800 text-xs font-medium pl-8 sm:pl-9 pr-8 sm:pr-9 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-400 border border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            {/* Log In Button */}
            <div className="pt-2 sm:pt-3">
              <button
                type="submit"
                className="w-full py-2 sm:py-2.5 bg-[#B0B0B0] hover:bg-[#9E9E9E] text-black font-extrabold text-xs rounded-lg shadow-sm transition-colors cursor-pointer active:scale-[0.99]"
              >
                Log In
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}