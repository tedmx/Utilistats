// src/components/DeleteConfirmModal.tsx
import { Modal } from './ui/Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Удалить запись?'>
      <div className='space-y-6'>
        <p className='text-slate-500 dark:text-slate-400'>
          Это действие нельзя будет отменить. Показания за эту дату будут безвозвратно удалены.
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onConfirm}
            className='flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors'
          >
            Да, удалить
          </button>
          <button
            onClick={onClose}
            className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-colors'
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  )
}
