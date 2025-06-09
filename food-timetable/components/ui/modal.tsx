import React from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    // Overlay background
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal container */}
      <div
        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking inside modal
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}