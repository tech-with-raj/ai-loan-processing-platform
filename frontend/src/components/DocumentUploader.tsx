import { useRef, useState } from 'react'
import { validateDocumentFile } from '../utils/documentValidation'
import { Alert } from './Alert'
import { Button } from './Button'

interface DocumentUploadItem {
  file: File
  status: 'ready' | 'uploading' | 'success' | 'failed'
  error?: string
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`
}

export interface DocumentUploaderProps {
  applicationId: string
  upload?: (applicationId: string, file: File) => Promise<unknown>
}

export function DocumentUploader({ applicationId, upload }: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const submittingKeysRef = useRef(new Set<string>())
  const [items, setItems] = useState<DocumentUploadItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')

  const addFiles = (files: File[]) => {
    const next = [...items]
    for (const file of files) {
      const validationError = validateDocumentFile(file)
      if (validationError) {
        setNotice(`${file.name}: ${validationError}`)
        continue
      }
      if (next.some((item) => fileKey(item.file) === fileKey(file))) {
        setNotice(`${file.name} has already been selected.`)
        continue
      }
      next.push({ file, status: 'ready' })
    }
    setItems(next)
  }

  const submit = async (item: DocumentUploadItem) => {
    if (!upload) {
      setNotice('Document upload is pending backend integration. No file was submitted.')
      return
    }
    if (item.status === 'uploading') return
    const key = fileKey(item.file)
    if (submittingKeysRef.current.has(key)) return
    submittingKeysRef.current.add(key)

    setItems((current) => current.map((entry) => fileKey(entry.file) === key ? { ...entry, status: 'uploading', error: undefined } : entry))
    try {
      await upload(applicationId, item.file)
      setItems((current) => current.map((entry) => fileKey(entry.file) === key ? { ...entry, status: 'success' } : entry))
      setNotice(`${item.file.name} uploaded successfully.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload the document.'
      setItems((current) => current.map((entry) => fileKey(entry.file) === key ? { ...entry, status: 'failed', error: message } : entry))
      setNotice(`${item.file.name}: ${message}`)
    } finally {
      submittingKeysRef.current.delete(key)
    }
  }

  const remove = (item: DocumentUploadItem) => {
    setItems((current) => current.filter((entry) => entry !== item))
  }

  return (
    <div className="document-uploader">
      <div
        className={`document-dropzone${dragging ? ' document-dropzone-active' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(Array.from(event.dataTransfer.files))
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple
          aria-label="Choose documents"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
        <strong>Upload documents</strong>
        <span>PDF, JPEG, or PNG · Maximum 5 MB each</span>
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={!applicationId}>
          Choose files
        </Button>
      </div>

      {notice ? <Alert tone={notice.includes('successfully') ? 'success' : 'info'}>{notice}</Alert> : null}

      {items.length > 0 ? (
        <div className="document-upload-items" aria-label="Selected documents">
          {items.map((item) => (
            <div className="document-upload-item" key={fileKey(item.file)}>
              <div>
                <strong>{item.file.name}</strong>
                <span>{item.file.type || 'Unknown content type'} · {Math.max(1, Math.ceil(item.file.size / 1024))} KB</span>
                {item.status === 'uploading' ? <span className="document-upload-progress">Uploading...</span> : null}
                {item.error ? <span className="form-error">{item.error}</span> : null}
              </div>
              <div className="document-card-actions">
                {item.status === 'failed' ? (
                  <Button variant="secondary" onClick={() => void submit(item)}>Retry</Button>
                ) : item.status === 'ready' ? (
                  <Button onClick={() => void submit(item)}>Upload</Button>
                ) : null}
                {item.status !== 'uploading' ? <Button variant="ghost" onClick={() => remove(item)}>Remove</Button> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
