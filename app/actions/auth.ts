"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import { users, personalInfo } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { createSession, deleteSession } from "@/app/lib/session";
import { hashPassword, verifyPassword } from "@/app/lib/password";
import {
  RegisterFormSchema,
  RegisterFormState,
  LoginFormSchema,
  LoginFormState,
  PersonalInfoFormSchema,
  PersonalInfoFormState,
} from "@/app/lib/definitions";
import { verifySession } from "@/app/lib/dal";

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Validate form fields
  const validatedFields = RegisterFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = validatedFields.data;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      message: "An account with this email already exists.",
    };
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate UUID for user ID
  const userId = crypto.randomUUID();

  // Create user
  const result = await db
    .insert(users)
    .values({
      userId,
      email,
      passwordHash,
      firstName,
      lastName,
    })
    .returning({ id: users.id });

  const user = result[0];

  if (!user) {
    return {
      message: "An error occurred while creating your account.",
    };
  }

  // Create session
  await createSession({
    id: user.id,
    email,
    firstName,
    lastName,
  });

  redirect("/dashboard");
}

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // Find user
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    return {
      message: "Invalid email or password.",
    };
  }

  // Verify password
  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    return {
      message: "Invalid email or password.",
    };
  }

  // Create session
  await createSession({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export async function updatePersonalInfo(
  state: PersonalInfoFormState,
  formData: FormData
): Promise<PersonalInfoFormState> {
  const session = await verifySession();

  if (!session.isAuth) {
    return {
      message: "You must be logged in to update personal information.",
    };
  }

  // Validate form fields
  const validatedFields = PersonalInfoFormSchema.safeParse({
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") || undefined,
    lastName: formData.get("lastName"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    socialInsuranceNumber: formData.get("socialInsuranceNumber") || undefined,
    maritalStatus: formData.get("maritalStatus") || undefined,
    resProvince: formData.get("resProvince") || undefined,
    addressLine1: formData.get("addressLine1") || undefined,
    unitNo: formData.get("unitNo") || undefined,
    streetName: formData.get("streetName") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    postalCode: formData.get("postalCode") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    // Update user's first and last name
    await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .where(eq(users.id, session.userId));

    // Prepare mailing address
    const mailingAddress = {
      address_line_1: data.addressLine1 || "",
      unit_no: data.unitNo || "",
      street_name: data.streetName || "",
      city: data.city || "",
      province: data.province || "",
      postal_code: data.postalCode || "",
    };

    // Check if personal info exists
    const existingInfo = await db
      .select()
      .from(personalInfo)
      .where(eq(personalInfo.userId, session.userId))
      .limit(1);

    if (existingInfo.length > 0) {
      // Update existing personal info
      await db
        .update(personalInfo)
        .set({
          middleName: data.middleName || null,
          dateOfBirth: data.dateOfBirth || null,
          socialInsuranceNumber: data.socialInsuranceNumber || null,
          maritalStatus: data.maritalStatus || null,
          resProvince: data.resProvince || null,
          mailingAddress,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(personalInfo.userId, session.userId));
    } else {
      // Create new personal info
      await db.insert(personalInfo).values({
        userId: session.userId,
        middleName: data.middleName || null,
        dateOfBirth: data.dateOfBirth || null,
        socialInsuranceNumber: data.socialInsuranceNumber || null,
        maritalStatus: data.maritalStatus || null,
        resProvince: data.resProvince || null,
        mailingAddress,
        updatedAt: new Date().toISOString(),
      });
    }

    // Revalidate the personal info page to show updated data
    revalidatePath("/personal-info");

    return {
      success: true,
      message: "Personal information updated successfully.",
    };
  } catch (error) {
    console.error("Failed to update personal info:", error);
    return {
      message: "An error occurred while updating your information.",
    };
  }
}
