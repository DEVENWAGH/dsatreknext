-- Convert existing text description to jsonb format compatible with rich text editor
ALTER TABLE "problems" ALTER COLUMN "description" SET DATA TYPE jsonb USING
  CASE
    WHEN "description" IS NULL THEN NULL
    ELSE jsonb_build_array(
      jsonb_build_object(
        'type', 'p',
        'children', jsonb_build_array(
          jsonb_build_object(
            'text', "description"
          )
        )
      )
    )
  END;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "editorial" jsonb;--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "examples";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "constraints";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "image_key";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "is_active";