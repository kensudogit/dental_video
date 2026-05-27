package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port              string
	DatabaseURL       string
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
	db := strings.TrimSpace(os.Getenv("DATABASE_URL"))
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
	return Config{
		Port:              port,
		DatabaseURL:       db,
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
		EnableMemoryStore: db == "" || os.Getenv("USE_MEMORY_STORE") == "true",
	}
}

func (c Config) S3Enabled() bool {
	return c.S3Bucket != "" && c.S3AccessKey != "" && c.S3SecretKey != ""
}

func (c Config) OpenAIEnabled() bool {
	return c.OpenAIAPIKey != ""
}

func envOr(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}
