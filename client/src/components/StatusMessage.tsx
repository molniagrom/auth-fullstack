type StatusMessageProps = {
  tone: 'success' | 'error'
  message: string
}

export function StatusMessage(props: StatusMessageProps) {
  if (!props.message) {
    return null
  }

  return <p className={`status ${props.tone}`}>{props.message}</p>
}
