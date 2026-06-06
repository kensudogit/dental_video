package service

import (
	"context"
	"strings"
	"time"

	"github.com/pluszero/dental-video-api/internal/models"
	"github.com/pluszero/dental-video-api/internal/openai"
	"github.com/pluszero/dental-video-api/internal/tenant"
)

func (s *Service) requireModule(ctx context.Context, code models.SaasModuleCode) (tenant.Principal, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return tenant.Principal{}, err
	}
	if s.PG == nil {
		return tenant.Principal{}, tenant.ErrForbidden
	}
	ok, err := s.PG.IsModuleEnabled(ctx, p.OrgID, code)
	if err != nil {
		return tenant.Principal{}, err
	}
	if !ok {
		return tenant.Principal{}, tenant.ErrModuleDisabled
	}
	return p, nil
}

func (s *Service) ListSaasModules(ctx context.Context) ([]models.SaasModule, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return nil, err
	}
	return s.PG.ListOrgModules(ctx, p.OrgID)
}

func (s *Service) SetSaasModuleEnabled(ctx context.Context, code models.SaasModuleCode, enabled bool) (models.SaasModule, error) {
	p, err := s.requireAuth(ctx)
	if err != nil {
		return models.SaasModule{}, err
	}
	if p.Role != string(models.RoleOwner) && p.Role != string(models.RoleAdmin) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	if !isValidModuleCode(code) {
		return models.SaasModule{}, tenant.ErrForbidden
	}
	return s.PG.SetOrgModuleEnabled(ctx, p.OrgID, code, enabled)
}

func isValidModuleCode(code models.SaasModuleCode) bool {
	switch code {
	case models.ModuleDX, models.ModuleCRM, models.ModuleAttendance, models.ModuleEContract, models.ModuleChatbot, models.ModuleDocRAG:
		return true
	default:
		return false
	}
}

func (s *Service) useRemoteSaaS() bool {
	return s.SaaSRemote != nil && s.Cfg.MicroservicesEnabled()
}

func (s *Service) ListDxInitiatives(ctx context.Context) ([]models.DxInitiative, error) {
	if _, err := s.requireModule(ctx, models.ModuleDX); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListDxInitiatives(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListDxInitiatives(ctx, p.OrgID)
}

func (s *Service) CreateDxInitiative(ctx context.Context, in models.DxInitiativeInput) (models.DxInitiative, error) {
	if _, err := s.requireModule(ctx, models.ModuleDX); err != nil {
		return models.DxInitiative{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateDxInitiative(ctx, in)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateDxInitiative(ctx, p.OrgID, in)
}

func (s *Service) ListCrmContacts(ctx context.Context) ([]models.CrmContact, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListCrmContacts(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListCrmContacts(ctx, p.OrgID)
}

func (s *Service) CreateCrmContact(ctx context.Context, in models.CrmContactInput) (models.CrmContact, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return models.CrmContact{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateCrmContact(ctx, in)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCrmContact(ctx, p.OrgID, in)
}

func (s *Service) CreateCrmInteraction(ctx context.Context, contactID, kind, summary string) (models.CrmInteraction, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return models.CrmInteraction{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateCrmInteraction(ctx, contactID, kind, summary)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateCrmInteraction(ctx, p.OrgID, contactID, kind, summary)
}

func (s *Service) ListCrmInteractions(ctx context.Context, contactID string) ([]models.CrmInteraction, error) {
	if _, err := s.requireModule(ctx, models.ModuleCRM); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListCrmInteractions(ctx, contactID)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListCrmInteractions(ctx, p.OrgID, contactID)
}

func (s *Service) ListAttendanceRecords(ctx context.Context, userID string) ([]models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListAttendanceRecords(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	if userID == "" {
		userID = p.UserID
	}
	return s.PG.ListAttendanceRecords(ctx, p.OrgID, userID, 40)
}

func (s *Service) ClockIn(ctx context.Context, note string) (models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.AttendanceRecord{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ClockIn(ctx, note)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	if open, has, err := s.PG.OpenAttendanceClock(ctx, p.OrgID, p.UserID); err != nil {
		return models.AttendanceRecord{}, err
	} else if has {
		return open, nil
	}
	return s.PG.ClockIn(ctx, p.OrgID, p.UserID, note)
}

func (s *Service) ClockOut(ctx context.Context) (models.AttendanceRecord, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.AttendanceRecord{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ClockOut(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	open, has, err := s.PG.OpenAttendanceClock(ctx, p.OrgID, p.UserID)
	if err != nil {
		return models.AttendanceRecord{}, err
	}
	if !has {
		return models.AttendanceRecord{}, tenant.ErrForbidden
	}
	return s.PG.ClockOut(ctx, p.OrgID, open.ID)
}

func (s *Service) ListLeaveRequests(ctx context.Context) ([]models.LeaveRequest, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListLeaveRequests(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListLeaveRequests(ctx, p.OrgID)
}

func (s *Service) CreateLeaveRequest(ctx context.Context, start, end time.Time, reason string) (models.LeaveRequest, error) {
	if _, err := s.requireModule(ctx, models.ModuleAttendance); err != nil {
		return models.LeaveRequest{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateLeaveRequest(ctx, start.Format("2006-01-02"), end.Format("2006-01-02"), reason)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateLeaveRequest(ctx, p.OrgID, p.UserID, start, end, reason)
}

func (s *Service) ApproveLeaveRequest(ctx context.Context, id string) (models.LeaveRequest, error) {
	p, err := s.requireModule(ctx, models.ModuleAttendance)
	if err != nil {
		return models.LeaveRequest{}, err
	}
	if p.Role != string(models.RoleOwner) && p.Role != string(models.RoleAdmin) {
		return models.LeaveRequest{}, tenant.ErrForbidden
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ApproveLeaveRequest(ctx, id)
	}
	return s.PG.UpdateLeaveStatus(ctx, p.OrgID, id, "APPROVED")
}

func (s *Service) ListContractTemplates(ctx context.Context) ([]models.ContractTemplate, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListContractTemplates(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListContractTemplates(ctx, p.OrgID)
}

func (s *Service) CreateContractTemplate(ctx context.Context, name, body string) (models.ContractTemplate, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.ContractTemplate{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateContractTemplate(ctx, name, body)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateContractTemplate(ctx, p.OrgID, name, body)
}

func (s *Service) ListContracts(ctx context.Context) ([]models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListContracts(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListContracts(ctx, p.OrgID)
}

func (s *Service) CreateContract(ctx context.Context, templateID, title, partyName, partyEmail, body string) (models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.Contract{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateContract(ctx, templateID, title, partyName, partyEmail, body)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateContract(ctx, p.OrgID, templateID, title, partyName, partyEmail, body)
}

func (s *Service) SignContract(ctx context.Context, id string) (models.Contract, error) {
	if _, err := s.requireModule(ctx, models.ModuleEContract); err != nil {
		return models.Contract{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SignContract(ctx, id)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.SignContract(ctx, p.OrgID, id)
}

func (s *Service) ListConsultThreadsModule(ctx context.Context) ([]models.ConsultationThread, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListConsultThreads(ctx)
	}
	return s.ListConsultThreads(ctx)
}

func (s *Service) GetConsultThreadModule(ctx context.Context, threadID string) (models.ConsultationThread, []models.ConsultationMessage, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return models.ConsultationThread{}, nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.GetConsultThread(ctx, threadID)
	}
	return s.GetConsultThread(ctx, threadID)
}

func (s *Service) SendConsultationModule(ctx context.Context, threadID, message string) (models.ConsultMessageReply, error) {
	if _, err := s.requireModule(ctx, models.ModuleChatbot); err != nil {
		return models.ConsultMessageReply{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SendConsultation(ctx, threadID, message)
	}
	userMsg, aiMsg, err := s.SendConsultation(ctx, threadID, message)
	if err != nil {
		return models.ConsultMessageReply{}, err
	}
	tid := threadID
	if tid == "" {
		tid = userMsg.ThreadID
	}
	return models.ConsultMessageReply{ThreadID: tid, UserMessage: userMsg, AssistantMessage: aiMsg}, nil
}

func (s *Service) ListRagDocuments(ctx context.Context) ([]models.RagDocument, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.ListRagDocuments(ctx)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.ListRagDocuments(ctx, p.OrgID)
}

func (s *Service) CreateRagDocument(ctx context.Context, in models.RagDocumentInput) (models.RagDocument, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return models.RagDocument{}, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.CreateRagDocument(ctx, in)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	return s.PG.CreateRagDocument(ctx, p.OrgID, in)
}

func (s *Service) SearchRagDocuments(ctx context.Context, query string, limit int) ([]models.RagSearchHit, error) {
	if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
		return nil, err
	}
	if s.useRemoteSaaS() {
		return s.SaaSRemote.SearchRagDocuments(ctx, query, limit)
	}
	p, _ := tenant.PrincipalFrom(ctx)
	hits, err := s.PG.SearchRagDocuments(ctx, p.OrgID, query, limit)
	if err != nil {
		return nil, err
	}
	if len(hits) > 0 || s.OpenAI == nil || strings.TrimSpace(query) == "" {
		return hits, nil
	}
	docs, _ := s.PG.ListRagDocuments(ctx, p.OrgID)
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
	answer, err := s.OpenAI.Chat(ctx, openai.DentalConsultSystem, nil,
		"以下の院内文書を参照し、質問に簡潔に答えてください。\n\n"+ctxBlock+"\n\n質問: "+query)
	if err != nil {
		return hits, nil
	}
	hits = append(hits, models.RagSearchHit{
		DocumentID: docs[0].ID,
		Title:      "AI 回答",
		Snippet:    answer,
		Score:      0.5,
	})
	return hits, nil
}

func (s *Service) RagAnswer(ctx context.Context, query string) (string, []models.RagSearchHit, error) {
	if s.useRemoteSaaS() {
		if _, err := s.requireModule(ctx, models.ModuleDocRAG); err != nil {
			return "", nil, err
		}
		return s.SaaSRemote.RagAnswer(ctx, query)
	}
	hits, err := s.SearchRagDocuments(ctx, query, 5)
	if err != nil {
		return "", nil, err
	}
	if len(hits) == 0 {
		return "関連する文書が見つかりませんでした。", hits, nil
	}
	if hits[0].Title == "AI 回答" {
		return hits[0].Snippet, hits, nil
	}
	if s.OpenAI == nil {
		return hits[0].Snippet, hits, nil
	}
	p, _ := tenant.PrincipalFrom(ctx)
	docs, _ := s.PG.ListRagDocuments(ctx, p.OrgID)
	ctxBlock := ""
	for _, h := range hits {
		for _, d := range docs {
			if d.ID == h.DocumentID {
				ctxBlock += d.Title + ":\n" + truncateDoc(d.Content, 600) + "\n\n"
			}
		}
	}
	answer, err := s.OpenAI.Chat(ctx, openai.DentalConsultSystem, nil,
		"参照文書に基づき質問に答えてください。根拠がない場合はその旨を述べてください。\n\n"+ctxBlock+"\n\n質問: "+query)
	return answer, hits, err
}

func truncateDoc(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
