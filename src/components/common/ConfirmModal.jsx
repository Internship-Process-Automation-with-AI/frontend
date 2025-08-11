import React from 'react'

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null

  const stylesByVariant = {
    danger: {
      iconBg: 'bg-red-100',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.21 19h13.58A2 2 0 0020.7 16.3L13.7 4.3a2 2 0 00-3.4 0l-7 12a2 2 0 001.74 2.7z" />
        </svg>
      ),
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    primary: {
      iconBg: 'bg-blue-100',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
        </svg>
      ),
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  const styles = stylesByVariant[variant] || stylesByVariant.primary

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}">
            {styles.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 text-center">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 ${styles.confirmBtn}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal 