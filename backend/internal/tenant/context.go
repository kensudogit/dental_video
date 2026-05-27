package tenant

import "context"

type ctxKey int

const principalKey ctxKey = 1

type Principal struct {
	UserID string
	OrgID  string
	Role   string
	Email  string
	Name   string
	AuthVia string // jwt | api_key
}

func WithPrincipal(ctx context.Context, p Principal) context.Context {
	return context.WithValue(ctx, principalKey, p)
}

func PrincipalFrom(ctx context.Context) (Principal, bool) {
	p, ok := ctx.Value(principalKey).(Principal)
	return p, ok
}

func MustOrgID(ctx context.Context) (string, error) {
	p, ok := PrincipalFrom(ctx)
	if !ok || p.OrgID == "" {
		return "", ErrUnauthorized
	}
	return p.OrgID, nil
}

func MustUserID(ctx context.Context) (string, error) {
	p, ok := PrincipalFrom(ctx)
	if !ok || p.UserID == "" {
		return "", ErrUnauthorized
	}
	return p.UserID, nil
}
