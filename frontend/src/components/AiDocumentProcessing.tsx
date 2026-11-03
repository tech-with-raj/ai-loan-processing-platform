import type { ProposedDocumentProcessing } from '../types'
import { Card } from './Card'
import { DocumentProcessingOverview } from './DocumentProcessingOverview'
import { ExtractionResults } from './ExtractionResults'
import { ValidationFindings } from './ValidationFindings'
import { HumanVerificationPanel } from './HumanVerificationPanel'
import { ProcessingTimeline } from './ProcessingTimeline'

interface AiDocumentProcessingProps {
  processing?: ProposedDocumentProcessing | null
  loading?: boolean
  error?: string
}

export function AiDocumentProcessing({ processing, loading = false, error }: AiDocumentProcessingProps) {
  const fields = processing?.extracted_sections?.flatMap((section) => section.fields) ?? []

  return (
    <div className="ai-document-processing">
      <Card title={<h3>AI Processing Overview</h3>}>
        <DocumentProcessingOverview processing={processing} loading={loading} error={error} />
      </Card>
      <Card title={<h3>Extracted Information</h3>}>
        <ExtractionResults sections={processing?.extracted_sections} />
      </Card>
      <Card title={<h3>Validation Findings</h3>}>
        <ValidationFindings findings={processing?.findings} />
      </Card>
      <Card title={<h3>Human Verification</h3>}>
        <HumanVerificationPanel fields={fields} />
      </Card>
      <Card title={<h3>Processing History</h3>}>
        <ProcessingTimeline events={processing?.history} />
      </Card>
    </div>
  )
}
