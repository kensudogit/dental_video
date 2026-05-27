'use client'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

function graphqlHttpUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/graphql`
  }
  const base = process.env.API_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080'
  return `${base}/graphql`
}

let client: ApolloClient | null = null

export function getApolloClient(): ApolloClient {
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({ uri: graphqlHttpUri(), credentials: 'include' }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'cache-and-network' },
      },
    })
  }
  return client
}
