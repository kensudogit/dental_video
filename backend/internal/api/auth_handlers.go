package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/pluszero/dental-video-api/internal/service"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
)

type AuthHandler struct {
	svc *service.Service
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	payload, err := h.svc.Login(r.Context(), body.Email, body.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	setTokenCookie(w, r, payload.Token)
	writeJSON(w, http.StatusOK, map[string]any{"token": payload.Token, "session": payload.Session})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ClinicName string `json:"clinicName"`
		Slug       string `json:"slug"`
		OwnerName  string `json:"ownerName"`
		Email      string `json:"email"`
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	payload, err := h.svc.RegisterClinic(r.Context(), postgres.RegisterInput{
		ClinicName: body.ClinicName, Slug: body.Slug, OwnerName: body.OwnerName,
		Email: body.Email, Password: body.Password,
	})
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	setTokenCookie(w, r, payload.Token)
	writeJSON(w, http.StatusOK, map[string]any{"token": payload.Token, "session": payload.Session})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	clearTokenCookie(w, r)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func cookieSecure(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	return r.Header.Get("X-Forwarded-Proto") == "https"
}

func setTokenCookie(w http.ResponseWriter, r *http.Request, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "dv_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((72 * time.Hour).Seconds()),
	})
}

func clearTokenCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "dv_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]any{"error": msg})
}
