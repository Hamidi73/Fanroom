"use client";

// "Apply to host" section. Saves applications to localStorage for now — swap
// `persistApplication` for a real API call (e.g. POST /api/applications) later
// and nothing else here needs to change.

import { useState, type ChangeEvent, type FormEvent } from "react";

type FormState = {
  name: string;
  email: string;
  country: string;
  team: string;
  language: string;
  social: string;
  entertainment: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  country: "",
  team: "",
  language: "",
  social: "",
  entertainment: "",
};

// Text fields rendered as a list so they're easy to add to / reorder.
const TEXT_FIELDS: Array<{ key: keyof FormState; label: string; type: string; required: boolean }> = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "country", label: "Country", type: "text", required: true },
  { key: "team", label: "Team supported", type: "text", required: true },
  { key: "language", label: "Main language", type: "text", required: true },
  { key: "social", label: "Social link", type: "text", required: false },
];

function persistApplication(data: FormState) {
  const application = { ...data, createdAt: new Date().toISOString() };
  const stored = localStorage.getItem("streamerApplications");
  const parsed = stored ? JSON.parse(stored) : [];
  const apps = Array.isArray(parsed) ? parsed : [];
  localStorage.setItem("streamerApplications", JSON.stringify([...apps, application]));
}

const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-line bg-[#07070d] px-3.5 py-2.5 text-sm text-white outline-none";

export function ApplyForm({ heading }: { heading: string }) {
  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persistApplication(formData);
    setSubmitted(true);
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-7">
      <div className="grid items-start gap-6 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Become a host</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl">{heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Represent your nation. Host the room. Bring the energy. (Applications save
            locally for now.)
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-5">
          {submitted ? (
            <div className="p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-accent-soft">
                Application received
              </p>
              <h3 className="display mt-2.5 text-[22px]">Thanks for applying!</h3>
              <p className="mt-2 text-[13px] text-muted">
                We&apos;ll reach out as we build the platform.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {TEXT_FIELDS.map((field) => (
                <label key={field.key} className="text-[13px] text-muted">
                  <span className="text-white">{field.label}</span>
                  <input
                    name={field.key}
                    type={field.type}
                    value={formData[field.key]}
                    onChange={handleChange}
                    required={field.required}
                    className={inputClass}
                  />
                </label>
              ))}
              <label className="text-[13px] text-muted">
                <span className="text-white">Why would your room be entertaining?</span>
                <textarea
                  name="entertainment"
                  value={formData.entertainment}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-accent py-3 text-[15px] font-bold text-white"
              >
                Submit application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
