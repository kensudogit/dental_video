package api

import (
	"encoding/json"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/service"
)

type Handler struct {
	svc *service.Service
}

func NewHandler(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, models.HealthResponse{
		OK: true, Service: "dental-video-api", Version: "2.0.0-saas",
	})
}

func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": "dental-video-api",
		"message": "Dental video learning SaaS API. GraphQL at /graphql",
		"links": map[string]string{
			"health": "/health", "graphql": "/graphql", "authLogin": "/auth/login",
		},
	})
}

func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": "dental-video-api",
		"ok":      true,
		"postgres": h.svc.UsePostgres(),
		"s3":      h.svc.S3 != nil,
		"openai":  h.svc.OpenAI != nil,
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
