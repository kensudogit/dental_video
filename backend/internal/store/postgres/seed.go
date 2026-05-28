package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/auth"
)

const demoEmail = "demo@sakura-dental.jp"
const demoPassword = "demo1234"

func ensureDemoCredentials(ctx context.Context, db *DB) error {
	hash, err := auth.HashPassword(demoPassword)
	if err != nil {
		return err
	}

	var orgDemo bool
	if err := db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM organizations WHERE id='org_demo')`).Scan(&orgDemo); err != nil {
		return err
	}
	if !orgDemo {
		if err := insertDemoOrg(ctx, db, hash); err != nil {
			return err
		}
		return nil
	}

	var userID string
	err = db.Pool.QueryRow(ctx, `SELECT id FROM users WHERE LOWER(email)=$1`, demoEmail).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return insertDemoUser(ctx, db, hash)
	}
	if err != nil {
		return err
	}

	_, err = db.Pool.Exec(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, hash, userID)
	return err
}

func insertDemoOrg(ctx context.Context, db *DB, hash string) error {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	orgID := "org_demo"
	userID := "user_demo"
	slug := "sakura-dental"
	var slugTaken bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM organizations WHERE slug=$1 AND id<>$2)`, slug, orgID).Scan(&slugTaken); err != nil {
		return err
	}
	if slugTaken {
		slug = "sakura-dental-demo"
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, seat_count, timezone)
		VALUES ($1, $2, $3, 'PRO', 'ACTIVE', 10, 'Asia/Tokyo')
		ON CONFLICT (id) DO NOTHING`,
		orgID, "\u6c37\u82b1\u7c38\u6b6f\u79d1\u30af\u30ea\u30cb\u30c3\u30af", slug)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
		userID, demoEmail, "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')
		ON CONFLICT (org_id, user_id) DO NOTHING`,
		"tm_demo", orgID, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO usage_counters (org_id) VALUES ($1) ON CONFLICT (org_id) DO NOTHING`, orgID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func insertDemoUser(ctx context.Context, db *DB, hash string) error {
	userID := "user_demo"
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
		userID, demoEmail, "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, 'org_demo', $2, 'OWNER')
		ON CONFLICT (org_id, user_id) DO NOTHING`,
		"tm_demo", userID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func seedDemo(ctx context.Context, db *DB) error {
	now := time.Now()
	orgID := "org_demo"
	userID := "user_demo"
	hash, err := auth.HashPassword(demoPassword)
	if err != nil {
		return err
	}

	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO organizations (id, name, slug, plan_tier, subscription_status, seat_count, timezone)
		VALUES ($1, $2, $3, 'PRO', 'ACTIVE', 10, 'Asia/Tokyo')`,
		orgID, "\u6c37\u82b1\u7c38\u6b6f\u79d1\u30af\u30ea\u30cb\u30c3\u30af", "sakura-dental")
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)`,
		userID, "demo@sakura-dental.jp", "\u7530\u4e2d \u5065\u4e00", hash)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO team_members (id, org_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')`,
		"tm_demo", orgID, userID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO usage_counters (org_id) VALUES ($1)`, orgID)
	if err != nil {
		return err
	}

	inst := []struct{ id, name, title, spec, bio string }{
		{"inst-1", "\u7530\u4e2d \u5065\u4e00", "\u6b6f\u79d1\u533b\u5e2b", "\u6b6f\u5185\u7642\u6cd5", "\u5927\u5b66\u75c5\u9662\u6b6f\u5185\u79d1"},
		{"inst-2", "\u4f50\u85e4 \u7f8e\u54b2", "\u6b6f\u79d1\u885b\u751f\u58eb", "\u6b6f\u5468\u6cbb\u7642", "SRP\u6307\u5c0e"},
		{"inst-3", "\u9234\u6728 \u5927\u8f14", "\u6b6f\u79d1\u533b\u5e2b", "\u53e3\u8154\u5916\u79d1", "\u30a4\u30f3\u30d7\u30e9\u30f3\u30c8"},
	}
	for _, i := range inst {
		_, err = tx.Exec(ctx, `
			INSERT INTO instructors (id, org_id, name, title, specialty, bio, avatar_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			i.id, orgID, i.name, i.title, i.spec, i.bio, "/avatars/"+i.id+".svg")
		if err != nil {
			return err
		}
	}

	type vid struct {
		id, title, desc, cat, proc, level string
		dur                               int
		thumb, url, instID                string
		featured                          bool
	}
	videos := []vid{
		{"v-1", "\u6839\u7ba1\u6cbb\u7642 Step1", "\u958b\u7a9e\u3068\u30a2\u30af\u30bb\u30b9", "ENDODONTICS", "\u6839\u7ba1\u6cbb\u7642", "BEGINNER", 720,
			"https://placehold.co/640x360/0d9488/fff?text=Endo", "https://www.youtube.com/embed/dQw4w9WgXcQ", "inst-1", true},
		{"v-3", "SRP \u57fa\u672c\u624b\u6280", "SRP\u57fa\u790e", "PERIODONTICS", "SRP", "BEGINNER", 600,
			"https://placehold.co/640x360/059669/fff?text=SRP", "https://www.youtube.com/embed/dQw4w9WgXcQ", "inst-2", true},
		{"v-6", "\u611f\u67d3\u5bfe\u7b56", "\u6ec1\u83cc\u30b5\u30a4\u30af\u30eb", "INFECTION_CONTROL", "\u6ec1\u83cc", "BEGINNER", 480,
			"https://placehold.co/640x360/475569/fff?text=Sterile", "https://www.youtube.com/embed/dQw4w9WgXcQ", "inst-2", true},
	}
	for _, v := range videos {
		_, err = tx.Exec(ctx, `
			INSERT INTO videos (id, org_id, instructor_id, title, description, category, procedure, skill_level,
				duration_sec, thumbnail_url, video_url, featured, published_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
			v.id, orgID, v.instID, v.title, v.desc, v.cat, v.proc, v.level, v.dur, v.thumb, v.url, v.featured, now)
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO learning_paths (id, org_id, title, description, category, skill_level, estimated_minutes, certificate_title)
		VALUES ('path-1', $1, '\u6839\u7ba1\u57fa\u790e', '\u521d\u7d1a\u30b3\u30fc\u30b9', 'ENDODONTICS', 'BEGINNER', 25, '\u6839\u7ba1\u4fee\u4e86')`, orgID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO path_videos (path_id, video_id, sort_order) VALUES ('path-1', 'v-1', 1)`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO live_sessions (id, org_id, host_user_id, title, description, scheduled_at, status, stream_url)
		VALUES ('live-1', $1, $2, '\u6b6f\u5185\u7642\u6cd5\u30e9\u30a4\u30d6', '\u958b\u7a9e\u30c7\u30e2', $3, 'SCHEDULED', '')`,
		orgID, userID, now.Add(48*time.Hour))
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO case_discussions (id, org_id, author_user_id, title, summary, status)
		VALUES ('case-1', $1, $2, '\u96e3\u629c\u6b6f\u75c7\u4f8b', '\u5206\u5272\u629c\u6b6f\u306e\u5224\u65ad', 'OPEN')`,
		orgID, userID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
