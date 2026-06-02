package tenant

import "errors"

// GraphQL/REST でクライアントに返す認可エラー。
var (
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
)
