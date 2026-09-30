import { useEffect, useState } from "react";

const initialForm = {
  fullName: "",
  phone: "",
  house: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  addressType: "Home",
  isDefault: false,
};

function AddressForm({
  address = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.fullName || "",
        phone: address.phone || "",
        house: address.house || "",
        street: address.street || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pinCode: address.pinCode || "",
        addressType: address.addressType || "Home",
        isDefault: Boolean(address.isDefault),
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [address]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setForm((previous) => ({
      ...previous,
      phone: value,
    }));
  };

  const handlePinChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setForm((previous) => ({
      ...previous,
      pinCode: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Something went wrong."
      );
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-7">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#d4af37]">
          BAG HEE BAG
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          {address ? "Edit Delivery Address" : "Add New Address"}
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          {address
            ? "Update your delivery details below."
            : "Add an address for a smooth checkout experience."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Personal Details
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* Address Details */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Delivery Details
          </p>

          <div className="space-y-4">
            <Input
              label="House / Flat / Building"
              name="house"
              value={form.house}
              onChange={handleChange}
              placeholder="House no., flat no., building name"
              required
            />

            <Input
              label="Street / Area"
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street, locality or area"
              required
            />

            <Input
              label="Landmark"
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
              placeholder="Nearby landmark (optional)"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
              />

              <Input
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>

            <Input
              label="PIN Code"
              name="pinCode"
              value={form.pinCode}
              onChange={handlePinChange}
              placeholder="6-digit PIN code"
              inputMode="numeric"
              maxLength={6}
              required
            />
          </div>
        </div>

        {/* Address Type */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Address Type
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {["Home", "Work", "Other"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    addressType: type,
                  }))
                }
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  form.addressType === type
                    ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37]"
                    : "border-white/10 bg-white/[0.025] text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Default */}
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="h-4 w-4 accent-[#d4af37]"
          />

          <div>
            <p className="text-sm font-medium text-white">
              Make this my default address
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              This address will be selected automatically during checkout.
            </p>
          </div>
        </label>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-neutral-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e1c45a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : address
              ? "Update Address"
              : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  inputMode,
  maxLength,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-neutral-400">
        {label}
        {required && <span className="ml-1 text-[#d4af37]">*</span>}
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20"
      />
    </label>
  );
}

export default AddressForm;