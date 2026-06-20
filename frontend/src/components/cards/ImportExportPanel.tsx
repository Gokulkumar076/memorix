import { useRef, useState } from 'react'
import { Download, Upload, FileUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { importExportApi } from '@/api/analytics'
import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ImportExportPanelProps {
  isOpen: boolean
  onClose: () => void
  deckId: number
  deckName: string
}

export function ImportExportPanel({ isOpen, onClose, deckId, deckName }: ImportExportPanelProps) {
  const csvInputRef = useRef<HTMLInputElement>(null)
  const ankiInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const queryClient = useQueryClient()

  const handleExportCsv = async () => {
    try {
      const { data } = await importExportApi.exportCsv(deckId)
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${deckName}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Deck exported as CSV')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleImportCsv = async (file: File) => {
    setIsImporting(true)
    try {
      const { data } = await importExportApi.importCsv(deckId, file)
      toast.success(`Imported ${data.imported} cards`)
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportAnki = async (file: File) => {
    setIsImporting(true)
    try {
      const { data } = await importExportApi.importAnki(deckId, file)
      toast.success(`Imported ${data.imported} cards from Anki`)
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import & export">
      <div className="space-y-6">
        <div>
          <p className="label-eyebrow mb-3">Export</p>
          <Button variant="secondary" onClick={handleExportCsv} className="w-full justify-start">
            <Download className="h-4 w-4" />
            Download as CSV
          </Button>
        </div>

        <div>
          <p className="label-eyebrow mb-3">Import</p>
          <div className="space-y-2.5">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImportCsv(e.target.files[0])}
            />
            <Button
              variant="secondary"
              onClick={() => csvInputRef.current?.click()}
              className="w-full justify-start"
              isLoading={isImporting}
            >
              <Upload className="h-4 w-4" />
              Import from CSV
            </Button>

            <input
              ref={ankiInputRef}
              type="file"
              accept=".apkg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImportAnki(e.target.files[0])}
            />
            <Button
              variant="secondary"
              onClick={() => ankiInputRef.current?.click()}
              className="w-full justify-start"
              isLoading={isImporting}
            >
              <FileUp className="h-4 w-4" />
              Import from Anki (.apkg)
            </Button>
          </div>
          <p className="text-xs text-ink-500 mt-3">
            CSV files need <code className="text-ink-300">front</code>, <code className="text-ink-300">back</code>, and optional <code className="text-ink-300">tags</code> columns.
          </p>
        </div>
      </div>
    </Modal>
  )
}
