'use client'

import { useState } from 'react'

export function UserNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
      >
        <span className="text-sm font-medium">SC</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">username</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
          <div className="border-t border-gray-100">
            <div className="py-1">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
                <span className="float-right text-xs text-gray-400">⇧⌘P</span>
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Billing
                <span className="float-right text-xs text-gray-400">⌘B</span>
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
                <span className="float-right text-xs text-gray-400">⌘S</span>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Log out
              <span className="float-right text-xs text-gray-400">⇧⌘Q</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

