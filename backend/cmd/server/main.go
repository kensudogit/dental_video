package main

import (
	"log"
	"net/http"

	"github.com/pluszero/dental-video-api/internal/api"
	"github.com/pluszero/dental-video-api/internal/config"
	"github.com/pluszero/dental-video-api/internal/service"
)

func main() {
	cfg := config.Load()
	svc, err := service.New(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer svc.Close()

	r := api.NewRouter(svc)
	addr := ":" + cfg.Port
	log.Printf("[dental-video-api] postgres=%v s3=%v openai=%v listening %s",
		svc.UsePostgres(), cfg.S3Enabled(), cfg.OpenAIEnabled(), addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
