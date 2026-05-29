package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port              string
	DatabaseURL       string
	DatabaseSource    string
	JWTSecret         string
	TokenTTLHours     int
	S3Endpoint        string
	S3Region          string
	S3Bucket          string
	S3AccessKey       string
	S3SecretKey       string
	S3PublicBaseURL   string
	S3ForcePathStyle  bool
	OpenAIAPIKey      string
	OpenAIModel       string
	AllowedOrigins    []string
	AppPublicURL      string
	EnableMemoryStore bool
}

func Load() Config {
	db, source := resolveDatabaseURL()
	jwt := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if jwt == "" {
		jwt = "dev-only-change-in-production"
	}
	ttl := 72
	if v := os.Getenv("JWT_TTL_HOURS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			ttl = n
		}
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	origins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		origins = nil
		for _, p := range strings.Split(raw, ",") {
			if t := strings.TrimSpace(p); t != "" {
				origins = append(origins, t)
			}
		}
	}
	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}
	memoryExplicit := os.Getenv("USE_MEMORY_STORE") == "true"
	enableMemory := db == "" && (!IsRailway() || memoryExplicit)
	if memoryExplicit {
		enableMemory = true
	}
	return Config{
		Port:              port,
		DatabaseURL:       db,
		DatabaseSource:    source,
		JWTSecret:         jwt,
		TokenTTLHours:     ttl,
		S3Endpoint:        strings.TrimSpace(os.Getenv("S3_ENDPOINT")),
		S3Region:          envOr("S3_REGION", "auto"),
		S3Bucket:          strings.TrimSpace(os.Getenv("S3_BUCKET")),
		S3AccessKey:       strings.TrimSpace(os.Getenv("S3_ACCESS_KEY")),
		S3SecretKey:       strings.TrimSpace(os.Getenv("S3_SECRET_KEY")),
		S3PublicBaseURL:   strings.TrimRight(strings.TrimSpace(os.Getenv("S3_PUBLIC_BASE_URL")), "/"),
		S3ForcePathStyle:  os.Getenv("S3_FORCE_PATH_STYLE") == "true" || os.Getenv("S3_FORCE_PATH_STYLE") == "1",
		OpenAIAPIKey:      strings.TrimSpace(os.Getenv("OPENAI_API_KEY")),
		OpenAIModel:       model,
		AllowedOrigins:    origins,
		AppPublicURL:      strings.TrimRight(strings.TrimSpace(envOr("APP_PUBLIC_URL", "http://localhost:3000")), "/"),
		EnableMemoryStore: enableMemory,
	}
}

func (c Config) S3Enabled() bool {
	return c.S3Bucket != "" && c.S3AccessKey != "" && c.S3SecretKey != ""
}

func (c Config) OpenAIEnabled() bool {
	return c.OpenAIAPIKey != ""
}

func IsRailway() bool {
	return os.Getenv("RAILWAY_ENVIRONMENT") != "" ||
		os.Getenv("RAILWAY_PROJECT_ID") != "" ||
		os.Getenv("RAILWAY_SERVICE_ID") != ""
}

func envOr(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func envPresence(key string) string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return "empty"
	}
	if strings.Contains(raw, "${{") {
		return "unresolved"
	}
	return "set"
}

// SetupStatus describes SaaS env configuration (no secrets).
func SetupStatus(postgresConnected bool, dbSource string) map[string]any {
	jwt := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	out := map[string]any{
		"postgres":           postgresConnected,
		"databaseSource":     dbSource,
		"databaseUrl":        envPresence("DATABASE_URL"),
		"databasePrivateUrl": envPresence("DATABASE_PRIVATE_URL"),
		"pgHost":             envPresence("PGHOST"),
		"jwtSecret":          ternary(jwt != "", "set", "empty"),
		"openaiApiKey":       envPresence("OPENAI_API_KEY"),
		"railway":            IsRailway(),
	}
	if w := jwtSecretWarning(jwt); w != "" {
		out["jwtSecretWarning"] = w
	}
	if !postgresConnected && IsRailway() {
		out["hint"] = "dental_video service → Variables → + New Variable → Reference → Postgres → DATABASE_URL. JWT_SECRET = random string (not API key). Redeploy."
	}
	return out
}

func jwtSecretWarning(jwt string) string {
	if jwt == "" {
		return "JWT_SECRET is empty"
	}
	if strings.HasPrefix(jwt, "sk-ant") || strings.HasPrefix(jwt, "sk-proj") || strings.HasPrefix(jwt, "sk-") {
		return "JWT_SECRET looks like an API key. Use a random string here; put OpenAI/Anthropic keys in OPENAI_API_KEY."
	}
	if jwt == "dev-only-change-in-production" {
		return "JWT_SECRET is still the dev default. Set a long random string on Railway."
	}
	return ""
}

func ternary(cond bool, a, b string) string {
	if cond {
		return a
	}
	return b
}

func resolveDatabaseURL() (string, string) {
	keys := []string{
		"DATABASE_URL",
		"DATABASE_PRIVATE_URL",
		"POSTGRES_URL",
		"POSTGRES_PRIVATE_URL",
	}
	for _, key := range keys {
		raw := strings.TrimSpace(os.Getenv(key))
		if raw == "" || strings.Contains(raw, "${{") {
			continue
		}
		return normalizeDatabaseURL(raw), key
	}
	if built, source, ok := databaseURLFromComponents(); ok {
		return normalizeDatabaseURL(built), source
	}
	return "", ""
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if v := strings.TrimSpace(os.Getenv(key)); v != "" && !strings.Contains(v, "${{") {
			return v
		}
	}
	return ""
}

func databaseURLFromComponents() (string, string, bool) {
	host := firstEnv("PGHOST", "POSTGRES_HOST")
	user := firstEnv("PGUSER", "POSTGRES_USER")
	password := firstEnv("PGPASSWORD", "POSTGRES_PASSWORD")
	dbName := firstEnv("PGDATABASE", "POSTGRES_DB", "POSTGRES_DATABASE")
	port := firstEnv("PGPORT", "POSTGRES_PORT")
	if port == "" {
		port = "5432"
	}
	if host == "" || user == "" {
		return "", "", false
	}
	if dbName == "" {
		dbName = "railway"
	}
	u := &url.URL{
		Scheme: "postgresql",
		Host:   fmt.Sprintf("%s:%s", host, port),
		Path:   "/" + dbName,
	}
	if password != "" {
		u.User = url.UserPassword(user, password)
	} else {
		u.User = url.User(user)
	}
	return u.String(), "PGHOST", true
}

// normalizeDatabaseURL appends sslmode=require on Railway when the URL omits it.
func normalizeDatabaseURL(raw string) string {
	if raw == "" {
		return ""
	}
	if strings.Contains(raw, "sslmode=") {
		return raw
	}
	if !IsRailway() && !strings.Contains(strings.ToLower(raw), "railway") {
		return raw
	}
	if strings.Contains(raw, "?") {
		return raw + "&sslmode=require"
	}
	return raw + "?sslmode=require"
}

// RailwayDatabaseRequiredError is returned when Postgres is missing on Railway.
func RailwayDatabaseRequiredError() error {
	return fmt.Errorf(
		"DATABASE_URL is required on Railway: open the app service (not Postgres) → Variables → New Variable → Reference → Postgres DATABASE_URL, set JWT_SECRET, then Redeploy",
	)
}
