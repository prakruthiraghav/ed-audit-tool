"use client";

import { signOut } from "next-auth/react";

interface SignOutPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignOutPopup({ isOpen, onClose }: SignOutPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-purple-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to sign out of your account?
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
