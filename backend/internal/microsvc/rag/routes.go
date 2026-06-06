package rag

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/pluszero/dental-video-api/internal/microsvc/base"
	"github.com/pluszero/dental-video-api/internal/microsvc/runtime"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

func Register(d *runtime.Deps) {
	h := &handler{db: d.DB, ai: d.OpenAI}
	d.Router.Get("/documents", h.listDocs)
	d.Router.Post("/documents", h.createDoc)
	d.Router.Get("/search", h.search)
	d.Router.Post("/answer", h.answer)
}

type handler struct {
	db *postgres.DB
	ai *openai.Client
}

func (h *handler) listDocs(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	list, err := h.db.ListRagDocuments(r.Context(), p.OrgID)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"documents": list})
}

func (h *handler) createDoc(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body models.RagDocumentInput
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	item, err := h.db.CreateRagDocument(r.Context(), p.OrgID, body)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusCreated, item)
}

func (h *handler) search(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	q := r.URL.Query().Get("q")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	hits, err := h.searchDocs(r.Context(), p.OrgID, q, limit)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"hits": hits})
}

func (h *handler) answer(w http.ResponseWriter, r *http.Request) {
	p, err := base.RequireAuth(r.Context())
	if base.WriteSvcErr(w, err) {
		return
	}
	var body struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		base.WriteError(w, http.StatusBadRequest, "invalid json")
		return
	}
	ans, hits, err := h.ragAnswer(r.Context(), p.OrgID, body.Query)
	if base.WriteSvcErr(w, err) {
		return
	}
	base.WriteJSON(w, http.StatusOK, map[string]any{"answer": ans, "sources": hits})
}

func (h *handler) searchDocs(ctx context.Context, orgID, query string, limit int) ([]models.RagSearchHit, error) {
	hits, err := h.db.SearchRagDocuments(ctx, orgID, query, limit)
	if err != nil {
		return nil, err
	}
	if len(hits) > 0 || h.ai == nil || strings.TrimSpace(query) == "" {
		return hits, nil
	}
	docs, _ := h.db.ListRagDocuments(ctx, orgID)
	if len(docs) == 0 {
		return hits, nil
	}
	ctxBlock := ""
	for i, d := range docs {
		if i >= 3 {
			break
		}
		ctxBlock += d.Title + ":\n" + truncateDoc(d.Content, 800) + "\n\n"
	}
	answer, err := h.ai.Chat(ctx, openai.DentalConsultSystem, nil,
		"以下の院内文書を参照し、質問に簡潔に答えてください。\n\n"+ctxBlock+"\n\n質問: "+query)
	if err != nil {
		return hits, nil
	}
	hits = append(hits, models.RagSearchHit{
		DocumentID: docs[0].ID, Title: "AI 回答", Snippet: answer, Score: 0.5,
	})
	return hits, nil
}

func (h *handler) ragAnswer(ctx context.Context, orgID, query string) (string, []models.RagSearchHit, error) {
	hits, err := h.searchDocs(ctx, orgID, query, 5)
	if err != nil {
		return "", nil, err
	}
	if len(hits) == 0 {
		return "関連する文書が見つかりませんでした。", hits, nil
	}
	if hits[0].Title == "AI 回答" {
		return hits[0].Snippet, hits, nil
	}
	if h.ai == nil {
		return hits[0].Snippet, hits, nil
	}
	docs, _ := h.db.ListRagDocuments(ctx, orgID)
	ctxBlock := ""
	for _, hit := range hits {
		for _, d := range docs {
			if d.ID == hit.DocumentID {
				ctxBlock += d.Title + ":\n" + truncateDoc(d.Content, 600) + "\n\n"
			}
		}
	}
	answer, err := h.ai.Chat(ctx, openai.DentalConsultSystem, nil,
		"参照文書に基づき質問に答えてください。根拠がない場合はその旨を述べてください。\n\n"+ctxBlock+"\n\n質問: "+query)
	return answer, hits, err
}

func truncateDoc(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
