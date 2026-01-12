# CloudTax Demo Application

This is a [Next.js](https://nextjs.org) application integrated with CloudTax API for Canadian tax filing.

## Setup

Follow these steps to set up the application:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Initialize Database

Run the database migration to set up your database schema:

```bash
pnpm db:push
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Update the following variables in your `.env` file:

```env
API_HOST=your-cloudtax-domain.ca
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
```

See the [Getting API Credentials](#getting-api-credentials) section below for instructions on obtaining your `CLIENT_ID` and `CLIENT_SECRET`.

### 4. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## CloudTax API Integration

### Tax Login URL API

The `/api/tax-login-url` endpoint generates a secure login URL for users to access their tax filing portal. This endpoint handles authentication and data pre-filling for a seamless user experience.

#### Endpoint Details

- **Method**: `POST`
- **Path**: `/api/tax-login-url`
- **Authentication**: HMAC-SHA256 signature using `CLIENT_ID` and `CLIENT_SECRET`

#### Request Flow

1. Verifies user session authentication
2. Retrieves user data and personal information from the database
3. Constructs a payload with user details
4. Creates an HMAC-SHA256 signature for secure authentication
5. Sends a POST request to CloudTax API
6. Returns the generated login URL to the client

#### TypeScript Types

```typescript
type MaritalStatus =
  | "married"
  | "common-law"
  | "widowed"
  | "divorced"
  | "separated"
  | "single";

type TaxProvince =
  | "AB" // Alberta
  | "BC" // British Columbia
  | "MB" // Manitoba
  | "NB" // New Brunswick
  | "NL" // Newfoundland and Labrador
  | "NS" // Nova Scotia
  | "NT" // Northwest Territories
  | "NU" // Nunavut
  | "ON" // Ontario
  | "PE" // Prince Edward Island
  | "SK" // Saskatchewan
  | "YT"; // Yukon

interface PersonalInfo {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string; // Format: YYYY-MM-DD
  social_insurance_number?: number;
  marital_status?: MaritalStatus;
}

interface MailingAddress {
  address_line_1?: string; // Care of (c/o) line
  unit_no: string;
  street_name: string;
  city: string;
  province: string;
  postal_code: string; // Format: A1A1A1 (no spaces)
}

interface Payload {
  user_id: string;
  user_email: string;
  tax_province?: TaxProvince;
  year?: number;
  personal_info?: PersonalInfo;
  mailing_address?: MailingAddress;
}
```

#### CloudTax API Request Format

The endpoint makes the following request to CloudTax:

```typescript
POST https://${API_HOST}/api/user-login-url

Headers:
  Content-Type: application/json
  Authorization: HMAC-SHA256 clientId=${CLIENT_ID}&signature=${SIGNATURE}

Body:
{
  "user_id": "unique-user-id",
  "user_email": "user@example.com",
  "tax_province": "ON",
  "year": 2025,
  "personal_info": {
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "date_of_birth": "1980-05-15",
    "social_insurance_number": 123456789,
    "marital_status": "married"
  },
  "mailing_address": {
    "address_line_1": "Apt 5",
    "unit_no": "5",
    "street_name": "123 Main Street",
    "city": "Toronto",
    "province": "ON",
    "postal_code": "M5H2N2"
  }
}
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "login_url": "https://tax.yourbank.ca/2025/auth/login?token=<JSON_WEB_TOKEN>"
}
```

**Error Responses:**

- `401 Unauthorized`: User is not authenticated
- `404 Not Found`: User not found in database
- `500 Internal Server Error`: Server configuration error or CloudTax API error

#### HMAC-SHA256 Signature

The signature is calculated as follows:

```typescript
const signature = createHmac("sha256", CLIENT_SECRET)
  .update(JSON.stringify(payload))
  .digest("hex");

const authorization = `HMAC-SHA256 clientId=${CLIENT_ID}&signature=${signature}`;
```

---

### Legacy Authentication with Basic Auth

CloudTax API also supports legacy **Basic Authentication** for backward compatibility.

#### Basic Authentication Format

1. Concatenate your API Key and API Secret with a colon: `apikey:apisecret`
2. Base64 encode the concatenated string: `YXBpa2V5OmFwaXNlY3JldAo=`
3. Prefix with "Basic " and use in the Authorization header:

```
Authorization: Basic YXBpa2V5OmFwaXNlY3JldAo=
```

#### Example Request with Basic Auth

```bash
POST /api/user-login-url
Host: cloudtax.ca
Authorization: Basic <BASE64(API_KEY:API_SECRET)>
Content-Type: application/json

{
  "user_id": "maryanne@yahoo.ca",
  "user_email": "maryanne@yahoo.ca",
  "tax_province": "ON",
  "personal_info": {
    "first_name": "Mary",
    "middle_name": null,
    "last_name": "Anne",
    "date_of_birth": "1964-04-24",
    "social_insurance_number": "870000007",
    "marital_status": "married"
  },
  "mailing_address": {
    "address_line_1": "RR 5",
    "unit_no": null,
    "street_name": null,
    "city": "Almonte",
    "province": "ON",
    "postal_code": "K0A1A0"
  }
}
```

**Response:**

```json
{
  "login_url": "https://tax.yourbank.ca/2025/auth/login?token=<JSON_WEB_TOKEN>"
}
```

> **Note**: The current implementation uses HMAC-SHA256 authentication for enhanced security. Basic Auth is supported by CloudTax for legacy integrations.

For more details, see the [CloudTax API Documentation](https://cloudtax.readme.io/reference/api).

---

## Getting API Credentials

To obtain your `CLIENT_ID` and `CLIENT_SECRET`:

1. Log in to your CloudTax Partner Portal
2. Navigate to **Settings** → **Integration**
3. You will see your API credentials displayed on this page

![API Credentials Screenshot](docs/images/api-credentials-placeholder.png)
*Screenshot placeholder: The Integration settings page showing CLIENT_ID and CLIENT_SECRET*

> **Important**: Keep your `CLIENT_SECRET` secure and never commit it to version control. Always use environment variables.

---

## Customizing Logout Behavior

You can customize the logout experience for your users through the CloudTax Partner Portal.

### Prerequisites

- Your integration mode must be set to **"Using API"** in the Settings → Integration page. If not set to API mode, the redirect URL will not work and users will be redirected to the built-in CloudTax login page instead.

### Configuration Steps

1. Log in to your CloudTax Partner Portal
2. Navigate to **Settings** → **Customize Portal**
3. Scroll to the bottom of the page
4. Configure the following options:
   - **Logout Text**: Customize the text displayed on the logout button
   - **Logout Redirect URL**: Set the URL where users will be redirected after logging out

![Logout Configuration Screenshot](docs/images/logout-settings-placeholder.png)
*Screenshot placeholder: The Customize Portal settings page showing logout configuration options at the bottom*

### Example Configuration

- **Logout Text**: "Return to My Bank"
- **Logout Redirect URL**: `https://yourdomain.com/dashboard`

When users complete their tax filing or click logout, they will see your custom logout text and be redirected to your specified URL.

---

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [CloudTax API Documentation](https://cloudtax.readme.io/reference/api) - CloudTax API reference
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM used in this project

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
