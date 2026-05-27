package service

import (
	"context"
	"time"

	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) OrgID(ctx context.Context) (string, error) {
	if p, ok := tenant.PrincipalFrom(ctx); ok && p.OrgID != "" {
		return p.OrgID, nil
	}
	if s.Memory != nil {
		return "org_memory", nil
	}
	return "", tenant.ErrUnauthorized
}

func (s *Service) UserID(ctx context.Context) (string, error) {
	if p, ok := tenant.PrincipalFrom(ctx); ok && p.UserID != "" {
		return p.UserID, nil
	}
	if s.Memory != nil {
		return "learner-demo", nil
	}
	return "", tenant.ErrUnauthorized
}

func (s *Service) APIKeyLookup(prefix, secret string) (tenant.Principal, bool) {
	if s.PG == nil {
		return tenant.Principal{}, false
	}
	uid, oid, role, email, name, ok := s.PG.LookupAPIKey(context.Background(), prefix, secret)
	if !ok {
		return tenant.Principal{}, false
	}
	return tenant.Principal{UserID: uid, OrgID: oid, Role: role, Email: email, Name: name, AuthVia: "api_key"}, true
}

func (s *Service) Login(ctx context.Context, email, password string) (models.AuthPayload, error) {
	if s.PG == nil {
		return models.AuthPayload{}, tenant.ErrUnauthorized
	}
	u, org, role, err := s.PG.Login(ctx, email, password)
	if err != nil {
		return models.AuthPayload{}, err
	}
	token, err := auth.IssueToken(s.Cfg.JWTSecret, time.Duration(s.Cfg.TokenTTLHours)*time.Hour, u.ID, org.ID, string(role), u.Email, u.Name)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: models.Session{User: u, Organization: org, Role: role}}, nil
}

func (s *Service) RegisterClinic(ctx context.Context, in postgres.RegisterInput) (models.AuthPayload, error) {
	if s.PG == nil {
		return models.AuthPayload{}, tenant.ErrUnauthorized
	}
	u, org, err := s.PG.RegisterClinic(ctx, in)
	if err != nil {
		return models.AuthPayload{}, err
	}
	token, err := auth.IssueToken(s.Cfg.JWTSecret, time.Duration(s.Cfg.TokenTTLHours)*time.Hour, u.ID, org.ID, string(models.RoleOwner), u.Email, u.Name)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: models.Session{User: u, Organization: org, Role: models.RoleOwner}}, nil
}

func (s *Service) CurrentSession(ctx context.Context) (*models.Session, error) {
	if s.PG == nil {
		return nil, nil
	}
	uid, err := s.UserID(ctx)
	if err != nil {
		return nil, nil
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return nil, nil
	}
	sess, err := s.PG.SessionByUser(ctx, uid, oid)
	if err != nil {
		return nil, err
	}
	if mc, err := s.PG.MemberCount(ctx, oid); err == nil {
		sess.Organization.MemberCount = mc
	}
	return &sess, nil
}
