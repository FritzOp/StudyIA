ALTER TABLE `materials` ADD `guide` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `extra_careers` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `mix_careers` integer DEFAULT false NOT NULL;