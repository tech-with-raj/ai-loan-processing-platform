import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
import { Card } from '../components/Card'

interface DisconnectedPageProps {
  title: string
  eyebrow: string
  description: string
}

export function DisconnectedPage({ title, eyebrow, description }: DisconnectedPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card>
        <StateMessage>{description}</StateMessage>
      </Card>
    </>
  )
}
