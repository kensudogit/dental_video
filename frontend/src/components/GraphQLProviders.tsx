'use client'

import { ApolloProvider } from '@apollo/client/react'
import { Provider as UrqlProvider } from 'urql'
import { getApolloClient } from '@/lib/apollo-client'
import { getUrqlClient } from '@/lib/urql-client'

export function GraphQLProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={getApolloClient()}>
      <UrqlProvider value={getUrqlClient()}>{children}</UrqlProvider>
    </ApolloProvider>
  )
}
