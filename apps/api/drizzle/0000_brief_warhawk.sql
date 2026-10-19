CREATE TYPE "public"."papel_filiacao" AS ENUM('PAI', 'MAE');--> statement-breakpoint
CREATE TABLE "filiacao" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "filiacao_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"filho_id" integer NOT NULL,
	"genitor_id" integer NOT NULL,
	"papel" "papel_filiacao" NOT NULL,
	CONSTRAINT "filiacao_filho_papel" UNIQUE("filho_id","papel"),
	CONSTRAINT "filiacao_distintos" CHECK ("filiacao"."filho_id" <> "filiacao"."genitor_id")
);
--> statement-breakpoint
CREATE TABLE "pessoa" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pessoa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nome" varchar(150) NOT NULL,
	"data_nascimento" date,
	"sexo" varchar(1),
	"foto" varchar(255),
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uniao" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "uniao_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pessoa_a_id" integer NOT NULL,
	"pessoa_b_id" integer NOT NULL,
	CONSTRAINT "uniao_par" UNIQUE("pessoa_a_id","pessoa_b_id"),
	CONSTRAINT "uniao_ordem" CHECK ("uniao"."pessoa_a_id" < "uniao"."pessoa_b_id")
);
--> statement-breakpoint
ALTER TABLE "filiacao" ADD CONSTRAINT "filiacao_filho_id_pessoa_id_fk" FOREIGN KEY ("filho_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filiacao" ADD CONSTRAINT "filiacao_genitor_id_pessoa_id_fk" FOREIGN KEY ("genitor_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uniao" ADD CONSTRAINT "uniao_pessoa_a_id_pessoa_id_fk" FOREIGN KEY ("pessoa_a_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uniao" ADD CONSTRAINT "uniao_pessoa_b_id_pessoa_id_fk" FOREIGN KEY ("pessoa_b_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;