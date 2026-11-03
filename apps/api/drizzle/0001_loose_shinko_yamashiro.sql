CREATE TYPE "public"."papel_usuario" AS ENUM('ADMIN', 'MEMBRO');--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usuario_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pessoa_id" integer NOT NULL,
	"login" varchar(80) NOT NULL,
	"senha_hash" varchar(255) NOT NULL,
	"papel" "papel_usuario" DEFAULT 'MEMBRO' NOT NULL,
	"trocar_senha" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_pessoa_id_unique" UNIQUE("pessoa_id"),
	CONSTRAINT "usuario_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;