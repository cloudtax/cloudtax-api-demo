import { redirect } from "next/navigation";
import { getUserWithPersonalInfo } from "@/app/lib/dal";
import PersonalInfoForm from "./PersonalInfoForm";

export default async function PersonalInfoPage() {
  const userData = await getUserWithPersonalInfo();

  if (!userData) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-600 mt-1">
          Update your personal details for tax filing
        </p>
      </div>

      <PersonalInfoForm userData={userData} />
    </div>
  );
}

