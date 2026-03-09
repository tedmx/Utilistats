// src/components/EditReadingModal.tsx
import { Modal } from './ui/Modal'
import { COUNTER_LABELS } from '../lib/constants'
import type { Reading, Property } from '../types'

interface EditReadingModalProps {
  isOpen: boolean
  onClose: () => void
  reading: Reading | null
  property: Property
  onSave: (data: Partial<Reading>) => Promise<void>
}

export function EditReadingModal({
  isOpen,
  onClose,
  reading,
  property,
  onSave,
}: EditReadingModalProps) {
  const inputStyles =
    'w-full px-4 py-2 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

  if (!reading) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Редактирование записи'>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const updated = Object.fromEntries(formData.entries())
          updated.id = reading.id
          await onSave(updated as Partial<Reading>)
        }}
        className='space-y-4'
      >
        <div>
          <label className='block text-xs font-bold text-slate-400 uppercase mb-1'>Дата</label>
          <input name='date' type='date' defaultValue={reading.date} className={inputStyles} />
        </div>

        {property.activeCounters.map((counter) => (
          <div key={counter}>
            <label className='block text-xs font-bold text-slate-400 uppercase mb-1'>
              {COUNTER_LABELS[counter]}
            </label>
            <input
              name={counter}
              type='number'
              step='0.01'
              defaultValue={reading[counter as keyof Reading] as number}
              className={inputStyles}
            />
          </div>
        ))}

        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors'
          >
            Сохранить
          </button>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-colors'
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  )
}
