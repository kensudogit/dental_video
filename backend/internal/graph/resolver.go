package graph

import "github.com/pluszero/dental-video-api/internal/service"

// Resolver is the gqlgen root resolver.
type Resolver struct {
	svc     *service.Service
	loaders *Loaders
}

func NewResolver(svc *service.Service) *Resolver {
	return &Resolver{svc: svc, loaders: NewLoaders(svc)}
}
