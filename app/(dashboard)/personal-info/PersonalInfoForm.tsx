"use client";

import { useActionState, useEffect } from "react";
import { updatePersonalInfo } from "@/app/actions/auth";
import { PROVINCES, MARITAL_STATUSES } from "@/app/lib/definitions";

type UserData = {
  user: {
    firstName: string;
    lastName: string;
  };
  personalInfo: {
    middleName: string | null;
    dateOfBirth: string | null;
    socialInsuranceNumber: string | null;
    maritalStatus: string | null;
    resProvince: string | null;
    mailingAddress: {
      address_line_1: string;
      unit_no: string;
      street_name: string;
      city: string;
      province: string;
      postal_code: string;
    } | null;
  } | null;
};

export default function PersonalInfoForm({ userData }: { userData: UserData }) {
  const [state, action, pending] = useActionState(updatePersonalInfo, undefined);

  const user = userData.user;
  const info = userData.personalInfo;

  // Scroll to top when form is submitted successfully
  useEffect(() => {
    if (state?.message) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  // Create a key that includes user data to force form remount on data change
  const formKey = `${JSON.stringify(userData)}`;

  return (
    <form key={formKey} action={action} className="space-y-8">
      {state?.message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            state.success
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              defaultValue={user.firstName}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            {state?.errors?.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.firstName[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="middleName"
              className="block text-sm font-medium text-gray-700"
            >
              Middle Name
            </label>
            <input
              id="middleName"
              name="middleName"
              type="text"
              defaultValue={info?.middleName || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              defaultValue={user.lastName}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            {state?.errors?.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.lastName[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={info?.dateOfBirth || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            {state?.errors?.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.dateOfBirth[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="socialInsuranceNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Social Insurance Number
            </label>
            <input
              id="socialInsuranceNumber"
              name="socialInsuranceNumber"
              type="text"
              pattern="\d{9}"
              maxLength={9}
              placeholder="123456789"
              defaultValue={info?.socialInsuranceNumber || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            {state?.errors?.socialInsuranceNumber && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.socialInsuranceNumber[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="maritalStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              defaultValue={info?.maritalStatus || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            >
              <option value="">Select status</option>
              {MARITAL_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="resProvince"
              className="block text-sm font-medium text-gray-700"
            >
              Province of Residence (Dec 31)
            </label>
            <select
              id="resProvince"
              name="resProvince"
              defaultValue={info?.resProvince || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            >
              <option value="">Select province</option>
              {PROVINCES.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mailing Address */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Mailing Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="addressLine1"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 1
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              defaultValue={info?.mailingAddress?.address_line_1 || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="unitNo"
              className="block text-sm font-medium text-gray-700"
            >
              Unit Number
            </label>
            <input
              id="unitNo"
              name="unitNo"
              type="text"
              defaultValue={info?.mailingAddress?.unit_no || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="streetName"
              className="block text-sm font-medium text-gray-700"
            >
              Street Name
            </label>
            <input
              id="streetName"
              name="streetName"
              type="text"
              defaultValue={info?.mailingAddress?.street_name || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={info?.mailingAddress?.city || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700"
            >
              Province
            </label>
            <select
              id="province"
              name="province"
              defaultValue={info?.mailingAddress?.province || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            >
              <option value="">Select province</option>
              {PROVINCES.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="A1A 1A1"
              defaultValue={info?.mailingAddress?.postal_code || ""}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            {state?.errors?.postalCode && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.postalCode[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
