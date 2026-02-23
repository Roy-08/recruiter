"use client";

import { useSession, signOut } from "next-auth/react";
import { Mail, User, LogOut, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userName = session?.user?.name || "Administrator";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || "/images/photo1770355371.jpg";
  
  const nameParts = userName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="h-screen flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-5xl">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Administrator Panel</h1>
              <p className="text-purple-100 text-sm mt-0.5">Account Settings</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">ADMIN</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-12 gap-5">
              
              {/* Profile Section */}
              <div className="col-span-4 flex flex-col items-center">
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-3 border-purple-500 shadow-xl object-cover mb-3"
                />
                <h2 className="text-xl font-bold text-white mb-1">{userName}</h2>
                <span className="text-purple-400 text-sm font-medium">Administrator</span>
              </div>

              {/* Details Section */}
              <div className="col-span-8 space-y-3">
                
                {/* First Name */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">First Name</span>
                  </div>
                  <p className="text-white text-xl font-semibold">{firstName}</p>
                </div>

                {/* Last Name */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Last Name</span>
                  </div>
                  <p className="text-white text-xl font-semibold">{lastName || "—"}</p>
                </div>

                {/* Email */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Email Address</span>
                  </div>
                  <p className="text-white text-lg font-medium break-all">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}