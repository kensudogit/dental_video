package postgres

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pluszero/dental-video-api/migrations"
)

type DB struct {
	Pool *pgxpool.Pool
}

func Connect(databaseURL string) (*DB, error) {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return nil, err
	}
	return &DB{Pool: pool}, nil
}

func (db *DB) Close() {
	db.Pool.Close()
}

func (db *DB) Migrate() error {
	entries, err := fs.ReadDir(migrations.FS, ".")
	if err != nil {
		return db.migrateFromDisk()
	}
	var ran bool
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql") {
			continue
		}
		b, err := migrations.FS.ReadFile(e.Name())
		if err != nil {
			return err
		}
		if _, err := db.Pool.Exec(context.Background(), string(b)); err != nil {
			return fmt.Errorf("migration %s: %w", e.Name(), err)
		}
		ran = true
	}
	if ran {
		return nil
	}
	return db.migrateFromDisk()
}

func (db *DB) migrateFromDisk() error {
	paths := []string{"migrations/001_init.sql", "backend/migrations/001_init.sql"}
	for _, p := range paths {
		b, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		if _, err := db.Pool.Exec(context.Background(), string(b)); err != nil {
			return err
		}
		return nil
	}
	return fmt.Errorf("migrations not found")
}

func (db *DB) SeedIfEmpty(ctx context.Context) error {
	var n int
	if err := db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM organizations`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	return seedDemo(ctx, db)
}
