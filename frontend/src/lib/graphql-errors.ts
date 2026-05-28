type GraphQLErrorLike = {
  message: string
  graphQLErrors?: ReadonlyArray<{ message: string }>
  networkError?: Error | null
}

export function isAuthRequiredGraphQLError(error: GraphQLErrorLike | undefined): boolean {
  if (!error) return false
  const messages = [
    error.message,
    ...(error.graphQLErrors?.map((e) => e.message) ?? []),
  ].map((m) => m.toLowerCase())

  return messages.some(
    (m) =>
      m.includes('forbidden') ||
      m.includes('unauthorized') ||
      m.includes('sign in') ||
      m.includes('login'),
  )
}

export function isNetworkGraphQLError(error: GraphQLErrorLike | undefined): boolean {
  if (!error) return false
  if (error.networkError) return true
  const msg = error.message.toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('502') ||
    msg.includes('503')
  )
}
