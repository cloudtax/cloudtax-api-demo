import { z } from "zod";

// Register form schema
export const RegisterFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .trim(),
});

// Login form schema
export const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Personal info form schema
export const PersonalInfoFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .trim(),
  middleName: z.string().trim().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").trim(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
  socialInsuranceNumber: z
    .string()
    .regex(/^\d{9}$/, "SIN must be exactly 9 digits")
    .optional()
    .or(z.literal("")),
  maritalStatus: z
    .enum([
      "single",
      "married",
      "common-law",
      "divorced",
      "separated",
      "widowed",
    ])
    .optional(),
  resProvince: z
    .enum(["ON", "BC", "AB", "SK", "MB", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU"])
    .optional(),
  // Mailing address
  addressLine1: z.string().trim().optional(),
  unitNo: z.string().trim().optional(),
  streetName: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z
    .enum(["ON", "BC", "AB", "SK", "MB", "QC", "NB", "NS", "PE", "NL", "YT", "NT", "NU"])
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, "Invalid postal code format")
    .optional()
    .or(z.literal("")),
});

// Form state types
export type RegisterFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type PersonalInfoFormState =
  | {
      errors?: {
        firstName?: string[];
        middleName?: string[];
        lastName?: string[];
        dateOfBirth?: string[];
        socialInsuranceNumber?: string[];
        maritalStatus?: string[];
        resProvince?: string[];
        addressLine1?: string[];
        unitNo?: string[];
        streetName?: string[];
        city?: string[];
        province?: string[];
        postalCode?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// Canadian provinces
export const PROVINCES = [
  { value: "ON", label: "Ontario" },
  { value: "BC", label: "British Columbia" },
  { value: "AB", label: "Alberta" },
  { value: "SK", label: "Saskatchewan" },
  { value: "MB", label: "Manitoba" },
  { value: "QC", label: "Quebec" },
  { value: "NB", label: "New Brunswick" },
  { value: "NS", label: "Nova Scotia" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "YT", label: "Yukon" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
] as const;

// Marital status options
export const MARITAL_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "common-law", label: "Common-law" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "widowed", label: "Widowed" },
] as const;
