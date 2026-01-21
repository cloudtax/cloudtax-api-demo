import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const personalInfo = sqliteTable("personal_info", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  middleName: text("middle_name"),
  dateOfBirth: text("date_of_birth"), // YYYY-MM-DD format
  socialInsuranceNumber: text("social_insurance_number"),
  maritalStatus: text("marital_status"), // 'married' | 'common-law' | 'widowed' | 'divorced' | 'separated' | 'single'
  resProvince: text("res_province"), // Province of residence: ON, BC, AB, etc.
  // Mailing address stored as JSON
  mailingAddress: text("mailing_address", { mode: "json" }).$type<{
    address_line_1: string;
    unit_no: string;
    street_name: string;
    city: string;
    province: string;
    postal_code: string;
  }>(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const taxReturns = sqliteTable("tax_returns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  externalReturnId: text("external_return_id").notNull().unique(),
  taxYear: integer("tax_year").notNull(),
  status: text("status").notNull(),
  lastEventType: text("last_event_type").notNull(),
  lastEventId: text("last_event_id").notNull(),
  lastEventAt: text("last_event_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PersonalInfo = typeof personalInfo.$inferSelect;
export type NewPersonalInfo = typeof personalInfo.$inferInsert;
export type TaxReturn = typeof taxReturns.$inferSelect;
export type NewTaxReturn = typeof taxReturns.$inferInsert;
