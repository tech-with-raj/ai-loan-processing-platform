import type { ProposedExtractedSection } from '../types'
import { EmptyState } from './FeedbackStates'
import { ExtractedField } from './ExtractedField'

interface ExtractionResultsProps {
  sections?: ProposedExtractedSection[]
}

export function ExtractionResults({ sections = [] }: ExtractionResultsProps) {
  if (sections.length === 0) {
    return (
      <EmptyState title="No extracted information available">
        Extracted fields will appear here after a backend extraction contract returns data.
      </EmptyState>
    )
  }

  return (
    <div className="extraction-results">
      {sections.map((section) => (
        <section className="extraction-section" key={section.title}>
          <h4>{section.title}</h4>
          {section.fields.length === 0
            ? <p className="placeholder-note">No fields returned for this section.</p>
            : <div className="extraction-fields">
              {section.fields.map((field) => <ExtractedField key={field.label} field={field} />)}
            </div>}
        </section>
      ))}
    </div>
  )
}
