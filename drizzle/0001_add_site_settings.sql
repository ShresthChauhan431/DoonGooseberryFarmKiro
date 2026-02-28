-- Add site_settings table
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"type" varchar(50) DEFAULT 'text' NOT NULL,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);

-- Insert default settings
INSERT INTO "site_settings" ("key", "value", "type", "category") VALUES
('site_name', 'Doon Gooseberry Farm', 'text', 'general'),
('site_description', 'Farm-fresh gooseberry products from Uttarakhand', 'text', 'general'),
('contact_email', 'contact@doonfarm.com', 'text', 'general'),
('contact_phone', '+91-XXXXXXXXXX', 'text', 'general'),
('hero_images', '["/images/hero-bg.jpg"]', 'json', 'homepage'),
('hero_title', 'Farm-Fresh Gooseberry Products from the Himalayas', 'text', 'homepage'),
('hero_subtitle', 'Discover our range of 100% natural pickles, chutneys, jams, and more from Uttarakhand''s pristine valleys', 'text', 'homepage'),
('hero_button_text', 'Shop Now', 'text', 'homepage'),
('hero_button_link', '/shop', 'text', 'homepage')
ON CONFLICT (key) DO NOTHING;
