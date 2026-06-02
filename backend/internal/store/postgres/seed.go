package postgres

// デモクリニック（org_demo）の投入と文字化け修復 — 本番デモログイン用

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pluszero/dental-video-api/internal/auth"
	"github.com/pluszero/dental-video-api/internal/demo"
)

const demoEmail = "demo@sakura-dental.jp"
const demoPassword = "demo1234" // デモ環境向け既知パスワード（本番は別途ローテーション推奨）

// ensureDemoCredentials は org_demo とデモユーザーを常にログイン可能な状態に保つ。
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
	} else {
		var userID string
		err = db.Pool.QueryRow(ctx, `SELECT id FROM users WHERE LOWER(email)=$1`, demoEmail).Scan(&userID)
		if errors.Is(err, pgx.ErrNoRows) {
			if err := insertDemoUser(ctx, db, hash); err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			_, err = db.Pool.Exec(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, hash, userID)
			if err != nil {
				return err
			}
		}
	}
	return repairDemoTextEncoding(ctx, db)
}

// repairDemoTextEncoding は過去マイグレーションで文字化けした日本語ラベルを上書き修復する。
func repairDemoTextEncoding(ctx context.Context, db *DB) error {
	_, err := db.Pool.Exec(ctx, `
		UPDATE live_sessions SET title=$2, description=$3
		WHERE id=$1 AND org_id='org_demo'`,
		"live-1", "\u6b6f\u5185\u7642\u6cd5\u30e9\u30a4\u30d6", "\u958b\u7a9e\u30c7\u30e2")
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(ctx, `
		UPDATE case_discussions SET title=$2, summary=$3
		WHERE id=$1 AND org_id='org_demo'`,
		"case-1", "\u96e3\u629c\u6b6f\u75c7\u4f8b", "\u5206\u5272\u629c\u6b6f\u306e\u5224\u65ad")
	if err != nil {
		return err
	}
	return repairDemoCatalog(ctx, db)
}

func repairDemoCatalog(ctx context.Context, db *DB) error {
	for _, v := range demo.CatalogVideos() {
		if _, err := db.Pool.Exec(ctx, `
			INSERT INTO videos (id, org_id, instructor_id, title, description, category, procedure, skill_level,
				duration_sec, thumbnail_url, video_url, featured, published_at)
			VALUES ($1, 'org_demo', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
			ON CONFLICT (id) DO UPDATE SET
				instructor_id = EXCLUDED.instructor_id,
				title = EXCLUDED.title,
				description = EXCLUDED.description,
				category = EXCLUDED.category,
				procedure = EXCLUDED.procedure,
				skill_level = EXCLUDED.skill_level,
				duration_sec = EXCLUDED.duration_sec,
				thumbnail_url = EXCLUDED.thumbnail_url,
				video_url = EXCLUDED.video_url,
				featured = EXCLUDED.featured`,
			v.ID, v.InstructorID, v.Title, v.Description, v.Category, v.Procedure, v.SkillLevel,
			v.DurationSec, v.ThumbnailURL(), v.EmbedURL(), v.Featured,
		); err != nil {
			return err
		}
	}

	for _, p := range demo.LearningPaths() {
		if _, err := db.Pool.Exec(ctx, `
			INSERT INTO learning_paths (id, org_id, title, description, category, skill_level, estimated_minutes, enrolled_count, certificate_title)
			VALUES ($1, 'org_demo', $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				description = EXCLUDED.description,
				category = EXCLUDED.category,
				skill_level = EXCLUDED.skill_level,
				estimated_minutes = EXCLUDED.estimated_minutes,
				certificate_title = EXCLUDED.certificate_title`,
			p.ID, p.Title, p.Description, p.Category, p.SkillLevel, p.EstimatedMinutes, p.EnrolledCount, p.Certificate,
		); err != nil {
			return err
		}
		for i, vid := range p.VideoIDs {
			if _, err := db.Pool.Exec(ctx, `
				INSERT INTO path_videos (path_id, video_id, sort_order) VALUES ($1, $2, $3)
				ON CONFLICT (path_id, video_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
				p.ID, vid, i+1,
			); err != nil {
				return err
			}
		}
	}
	return nil
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
			"https://placehold.co/640x360/0d9488/fff?text=Endo", demo.VideoURL("v-1"), "inst-1", true},
		{"v-3", "SRP \u57fa\u672c\u624b\u6280", "SRP\u57fa\u790e", "PERIODONTICS", "SRP", "BEGINNER", 600,
			"https://placehold.co/640x360/059669/fff?text=SRP", demo.VideoURL("v-3"), "inst-2", true},
		{"v-6", "\u611f\u67d3\u5bfe\u7b56", "\u6ec1\u83cc\u30b5\u30a4\u30af\u30eb", "INFECTION_CONTROL", "\u6ec1\u83cc", "BEGINNER", 480,
			"https://placehold.co/640x360/475569/fff?text=Sterile", demo.VideoURL("v-6"), "inst-2", true},
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
		VALUES ($1, $2, $3, $4, 'ENDODONTICS', 'BEGINNER', 25, $5)`,
		"path-1", orgID, "\u6839\u7ba1\u57fa\u790e", "\u521d\u7d1a\u30b3\u30fc\u30b9", "\u6839\u7ba1\u4fee\u4e86")
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO path_videos (path_id, video_id, sort_order) VALUES ('path-1', 'v-1', 1)`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO live_sessions (id, org_id, host_user_id, title, description, scheduled_at, status, stream_url)
		VALUES ($1, $2, $3, $4, $5, $6, 'SCHEDULED', '')`,
		"live-1", orgID, userID, "\u6b6f\u5185\u7642\u6cd5\u30e9\u30a4\u30d6", "\u958b\u7a9e\u30c7\u30e2", now.Add(48*time.Hour))
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO case_discussions (id, org_id, author_user_id, title, summary, status)
		VALUES ($1, $2, $3, $4, $5, 'OPEN')`,
		"case-1", orgID, userID, "\u96e3\u629c\u6b6f\u75c7\u4f8b", "\u5206\u5272\u629c\u6b6f\u306e\u5224\u65ad")
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
