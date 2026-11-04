CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`subject_name` text DEFAULT '' NOT NULL,
	`material_id` text
);
--> statement-breakpoint
CREATE INDEX `activities_user_idx` ON `activities` (`user_id`);--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`material_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`box` integer DEFAULT 1 NOT NULL,
	`due_at` integer NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`last_reviewed_at` integer,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `flashcards_user_idx` ON `flashcards` (`user_id`);--> statement-breakpoint
CREATE INDEX `flashcards_material_idx` ON `flashcards` (`material_id`);--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`source_type` text NOT NULL,
	`source_text` text,
	`file_uri` text,
	`file_name` text,
	`mime_type` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`generator` text,
	`error_message` text,
	`summary` text,
	`key_concepts` text,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `materials_user_idx` ON `materials` (`user_id`);--> statement-breakpoint
CREATE INDEX `materials_subject_idx` ON `materials` (`subject_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`institution` text DEFAULT 'Universidad de La Guajira' NOT NULL,
	`career` text DEFAULT 'Ingeniería de Sistemas' NOT NULL,
	`semester` text DEFAULT '1er Semestre' NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`material_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`answers` text NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_idx` ON `quiz_attempts` (`user_id`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_subject_idx` ON `quiz_attempts` (`subject_id`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`material_id` text NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_index` integer NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quiz_questions_material_idx` ON `quiz_questions` (`material_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	`deleted_at` integer,
	`name` text NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '#6366F1' NOT NULL,
	`icon` text DEFAULT 'book-open-page-variant' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `subjects_user_idx` ON `subjects` (`user_id`);