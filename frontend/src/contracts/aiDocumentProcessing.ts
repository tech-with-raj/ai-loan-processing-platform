export interface ProposedExtractedField {
  label: string
  value: string | number | null
  confidence?: number
  source?: string
  validationStatus?: 'VALID' | 'INVALID' | 'MISSING' | 'REQUIRES_HUMAN_REVIEW'
  humanVerificationStatus?: 'UNVERIFIED' | 'CONFIRMED' | 'REJECTED'
}

export interface ProposedExtractedSection {
  title: 'Customer Information' | 'Identity Information' | 'Financial Information'
  fields: ProposedExtractedField[]
}

export interface ProposedValidationFinding {
  finding_id: string
  origin: 'AI_EXTRACTION' | 'RULE_BASED_VALIDATION' | 'HUMAN_VERIFICATION'
  category: 'VALID' | 'INVALID' | 'MISSING' | 'INCONSISTENT' | 'EXPIRED' | 'REQUIRES_HUMAN_REVIEW'
  message: string
  field?: string
}

export interface ProposedProcessingEvent {
  event_id: string
  type: 'DOCUMENT_UPLOADED' | 'PROCESSING_STARTED' | 'EXTRACTION_COMPLETED' | 'VALIDATION_COMPLETED' | 'HUMAN_REVIEW_REQUESTED' | 'HUMAN_VERIFICATION_COMPLETED'
  occurred_at: string
  description?: string
}

export interface ProposedDocumentProcessing {
  document_id: string
  processing_status: 'NOT_STARTED' | 'PROCESSING' | 'PROCESSED' | 'VALIDATION_REQUIRED' | 'FAILED' | null
  processing_stage?: string | null
  last_processed_at?: string | null
  extraction_available: boolean
  validation_status?: 'NOT_STARTED' | 'VALID' | 'INVALID' | 'MISSING_INFORMATION' | 'REQUIRES_HUMAN_REVIEW' | null
  human_review_required: boolean
  extracted_sections?: ProposedExtractedSection[]
  findings?: ProposedValidationFinding[]
  history?: ProposedProcessingEvent[]
}
