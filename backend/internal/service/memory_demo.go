package service

import (
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/store/postgres"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

const (
	memoryDemoEmail    = "demo@sakura-dental.jp"
	memoryDemoPassword = "demo1234"
)

func memoryDemoSession() models.Session {
	return models.Session{
		User: models.User{
			ID:    demoUserID,
			Email: memoryDemoEmail,
			Name:  "\u7530\u4e2d \u5065\u4e00",
		},
		Organization: models.Organization{
			ID:                 demoOrgID,
			Name:               "\u3055\u304f\u3089\u6b6f\u79d1\u30af\u30ea\u30cb\u30c3\u30af",
			Slug:               "sakura-dental-demo",
			PlanTier:           models.PlanPro,
			SubscriptionStatus: models.SubActive,
			SeatCount:          10,
			Timezone:           "Asia/Tokyo",
			MemberCount:        1,
		},
		Role: models.RoleOwner,
	}
}

func (s *Service) memoryDemoLogin(email, password string) (models.AuthPayload, error) {
	if s.Memory == nil {
		return models.AuthPayload{}, postgres.ErrInvalidCredentials
	}
	if !strings.EqualFold(strings.TrimSpace(email), memoryDemoEmail) || password != memoryDemoPassword {
		return models.AuthPayload{}, postgres.ErrInvalidCredentials
	}
	sess := memoryDemoSession()
	token, err := auth.IssueToken(
		s.Cfg.JWTSecret,
		time.Duration(s.Cfg.TokenTTLHours)*time.Hour,
		sess.User.ID,
		sess.Organization.ID,
		string(sess.Role),
		sess.User.Email,
		sess.User.Name,
	)
	if err != nil {
		return models.AuthPayload{}, err
	}
	return models.AuthPayload{Token: token, Session: sess}, nil
}

func defaultSaasModuleCatalog() []models.SaasModule {
	return []models.SaasModule{
		{Code: models.ModuleDX, Name: "DX\u63a8\u9032\u652f\u63da", Description: "\u30c7\u30b8\u30bf\u30eb\u5316\u30ed\u30fc\u30c9\u30de\u30c3\u30d7\u30fb\u30bf\u30b9\u30af\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleCRM, Name: "\u9867\u5ba2\u7ba1\u7406", Description: "\u60a3\u8005\u30fb\u53d6\u5f15\u5148\u306e\u63a5\u89e6\u5c65\u6b74\u7ba1\u7406", Enabled: true},
		{Code: models.ModuleAttendance, Name: "\u52e4\u6020\u7ba1\u7406", Description: "\u51fa\u9000\u52e4\u30fb\u4f11\u6687\u7533\u8acb", Enabled: true},
		{Code: models.ModuleEContract, Name: "\u96fb\u5b50\u5951\u7d04", Description: "\u5951\u7d04\u66f8\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u30fb\u7f72\u540d\u30d5\u30ed\u30fc", Enabled: true},
		{Code: models.ModuleChatbot, Name: "AI\u30c1\u30e3\u30c3\u30c8\u30dc\u30c3\u30c8", Description: "\u6b6f\u79d1\u81e8\u5e8a\u30fb\u904b\u55b6\u76f8\u8ac7\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8", Enabled: true},
		{Code: models.ModuleDocRAG, Name: "\u6587\u66f8\u691c\u7d22RAG", Description: "\u9662\u5185\u6587\u66f8\u306e\u691c\u7d22\u30fbAI\u56de\u7b54", Enabled: true},
	}
}

func (s *Service) initMemoryModules() {
	s.memoryModuleEnabled = make(map[models.SaasModuleCode]bool, len(defaultSaasModuleCatalog()))
	for _, m := range defaultSaasModuleCatalog() {
		s.memoryModuleEnabled[m.Code] = m.Enabled
	}
}

func (s *Service) memoryMode() bool {
	return s.Memory != nil && s.PG == nil
}

func (s *Service) memoryListSaasModules() []models.SaasModule {
	out := defaultSaasModuleCatalog()
	for i := range out {
		out[i].Enabled = s.memoryModuleEnabled[out[i].Code]
	}
	return out
}

func (s *Service) memoryIsModuleEnabled(code models.SaasModuleCode) bool {
	if s.memoryModuleEnabled == nil {
		for _, m := range defaultSaasModuleCatalog() {
			if m.Code == code {
				return m.Enabled
			}
		}
		return false
	}
	enabled, ok := s.memoryModuleEnabled[code]
	return ok && enabled
}

func (s *Service) memorySetSaasModuleEnabled(code models.SaasModuleCode, enabled bool) (models.SaasModule, error) {
	if !isValidModuleCode(code) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	s.memoryModuleEnabled[code] = enabled
	for _, m := range defaultSaasModuleCatalog() {
		if m.Code == code {
			m.Enabled = enabled
			return m, nil
		}
	}
	return models.SaasModule{}, tenant.ErrForbidden
}
