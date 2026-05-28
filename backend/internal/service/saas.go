package service

import (
	"context"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) GetOrganization(ctx context.Context) (models.Organization, error) {
	if s.PG == nil {
		return models.Organization{}, tenant.ErrUnauthorized
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.Organization{}, err
	}
	o, err := s.PG.GetOrganization(ctx, oid)
	if err != nil {
		return o, err
	}
	o.MemberCount, _ = s.PG.MemberCount(ctx, oid)
	return o, nil
}

func (s *Service) UsageSummary(ctx context.Context) (models.UsageSummary, error) {
	if s.PG == nil {
		return models.UsageSummary{}, tenant.ErrUnauthorized
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.UsageSummary{}, err
	}
	return s.PG.UsageSummary(ctx, oid)
}

func (s *Service) ListTeamMembers(ctx context.Context) ([]models.TeamMember, []models.User, error) {
	if s.PG == nil {
		return nil, nil, tenant.ErrUnauthorized
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return nil, nil, err
	}
	return s.PG.ListTeamMembers(ctx, oid)
}

func (s *Service) UpdateOrganization(ctx context.Context, patch models.OrganizationPatch) (models.Organization, error) {
	if s.PG == nil {
		return models.Organization{}, tenant.ErrUnauthorized
	}
	oid, err := s.OrgID(ctx)
	if err != nil {
		return models.Organization{}, err
	}
	return s.PG.UpdateOrganization(ctx, oid, patch)
}
