import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { verifySession, getUserWithPersonalInfo } from "@/app/lib/dal";

type MaritalStatus =
  | "married"
  | "common-law"
  | "widowed"
  | "divorced"
  | "separated"
  | "single";

type TaxProvince =
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "SK"
  | "YT";

interface PersonalInfo {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  social_insurance_number?: number;
  marital_status?: MaritalStatus;
}

interface MailingAddress {
  address_line_1?: string;
  unit_no: string;
  street_name: string;
  city: string;
  province: string;
  postal_code: string;
}

interface Payload {
  user_id: string;
  user_email: string;
  tax_province?: TaxProvince;
  year?: number;
  personal_info?: PersonalInfo;
  mailing_address?: MailingAddress;
}

export async function POST() {
  try {
    // Verify user is authenticated
    const session = await verifySession();

    if (!session.isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data with personal info
    const userData = await getUserWithPersonalInfo();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { user, personalInfo } = userData;

    // Get environment variables
    const apiHost = process.env.API_HOST;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!apiHost || !clientId || !clientSecret) {
      console.error("Missing API configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Build personal_info object
    const personal_info: PersonalInfo = {
      first_name: user.firstName,
      last_name: user.lastName,
      middle_name: personalInfo?.middleName || undefined,
      date_of_birth: personalInfo?.dateOfBirth || undefined,
      social_insurance_number: personalInfo?.socialInsuranceNumber
        ? parseInt(personalInfo.socialInsuranceNumber, 10)
        : undefined,
      marital_status: personalInfo?.maritalStatus as MaritalStatus,
    };

    const addr = personalInfo?.mailingAddress;

    const mailing_address: MailingAddress | undefined =
      addr &&
      addr.unit_no &&
      addr.street_name &&
      addr.city &&
      addr.province &&
      addr.postal_code
        ? {
            address_line_1: addr.address_line_1 || undefined,
            unit_no: addr.unit_no,
            street_name: addr.street_name,
            city: addr.city,
            province: addr.province,
            postal_code: addr.postal_code,
          }
        : undefined;

    // Build the payload matching the API specification
    const payload: Payload = {
      user_id: user.userId,
      user_email: user.email,
      tax_province: (personalInfo?.resProvince as TaxProvince) || undefined,
      personal_info,
      mailing_address,
    };

    console.log(payload);

    const body = JSON.stringify(payload);

    // Create HMAC-SHA256 signature
    const signature = createHmac("sha256", clientSecret)
      .update(body)
      .digest("hex");

    // Build Authorization header
    const authorization = `HMAC-SHA256 clientId=${clientId}&signature=${signature}`;

    // Make the API call
    const url = `https://${apiHost}/api/user-login-url`;

    console.log(`Calling tax API: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tax API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: "Failed to get tax filing URL" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tax login URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
