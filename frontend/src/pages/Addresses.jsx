import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import AddressForm from "../components/AddressForm";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressService";

function Addresses() {
  const { token, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token || authLoading) {
      return;
    }

    loadAddresses();
  }, [token, authLoading]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAddresses(token);

      setAddresses(response.addresses || []);
    } catch (loadError) {
      console.error("Load addresses error:", loadError);

      setError(
        loadError?.response?.data?.message ||
          "Failed to load your addresses."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (formData) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await addAddress(token, formData);

      setAddresses((previous) => {
        const updated = formData.isDefault
          ? previous.map((address) => ({
              ...address,
              isDefault: false,
            }))
          : [...previous];

        return [response.address, ...updated];
      });

      setShowForm(false);
      setEditingAddress(null);

      setSuccess("Address added successfully.");

      await loadAddresses();
    } catch (submitError) {
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateAddress(
        token,
        editingAddress._id,
        formData
      );

      setAddresses((previous) =>
        previous.map((address) =>
          address._id === editingAddress._id
            ? response.address
            : formData.isDefault
            ? {
                ...address,
                isDefault: false,
              }
            : address
        )
      );

      setShowForm(false);
      setEditingAddress(null);

      setSuccess("Address updated successfully.");

      await loadAddresses();
    } catch (submitError) {
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (address) => {
    const confirmed = window.confirm(
      `Delete the ${address.addressType || "selected"} address?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAddress(token, address._id);

      await loadAddresses();

      setSuccess("Address deleted successfully.");
    } catch (deleteError) {
      console.error("Delete address error:", deleteError);

      setError(
        deleteError?.response?.data?.message ||
          "Failed to delete address."
      );
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setError("");
      setSuccess("");

      await setDefaultAddress(token, addressId);

      setAddresses((previous) =>
        previous.map((address) => ({
          ...address,
          isDefault: address._id === addressId,
        }))
      );

      setSuccess("Default address updated.");
    } catch (defaultError) {
      console.error(
        "Set default address error:",
        defaultError
      );

      setError(
        defaultError?.response?.data?.message ||
          "Failed to update default address."
      );
    }
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (address) => {
    setEditingAddress(address);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingAddress(null);
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#050505] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="mt-4 h-9 w-64 rounded bg-white/10" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="h-64 rounded-3xl bg-white/[0.04]" />
              <div className="h-64 rounded-3xl bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#d4af37]">
              BAG HEE BAG
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              My Addresses
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage your saved delivery addresses for faster checkout.
            </p>
          </div>

          {!showForm && (
            <button
              onClick={openAddForm}
              className="w-full rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e1c45a] sm:w-auto"
            >
              + Add New Address
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <AddressForm
              address={editingAddress}
              onSubmit={
                editingAddress
                  ? handleUpdate
                  : handleAdd
              }
              onCancel={closeForm}
              submitting={saving}
            />
          </div>
        )}

        {/* Empty State */}
        {!showForm && addresses.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-2xl">
              ⌖
            </div>

            <h2 className="mt-5 text-xl font-medium">
              No saved addresses
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              Add your delivery address now and make your next BAG HEE BAG
              order quicker.
            </p>

            <button
              onClick={openAddForm}
              className="mt-6 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e1c45a]"
            >
              Add Your First Address
            </button>
          </div>
        )}

        {/* Address Cards */}
        {!showForm && addresses.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={() => openEditForm(address)}
                onDelete={() => handleDelete(address)}
                onSetDefault={() =>
                  handleSetDefault(address._id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-5 transition duration-300 sm:p-6 ${
        address.isDefault
          ? "border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 via-white/[0.035] to-transparent"
          : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/20"
      }`}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg">
            {address.addressType === "Work"
              ? "⌂"
              : address.addressType === "Other"
              ? "⌖"
              : "⌂"}
          </div>

          <div>
            <h2 className="font-medium text-white">
              {address.fullName}
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              {address.addressType || "Home"} Address
            </p>
          </div>
        </div>

        {address.isDefault && (
          <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#d4af37]">
            Default
          </span>
        )}
      </div>

      {/* Address */}
      <div className="mt-6 space-y-1 text-sm leading-6 text-neutral-400">
        <p>{address.house}</p>
        <p>{address.street}</p>

        {address.landmark && (
          <p>
            Landmark: {address.landmark}
          </p>
        )}

        <p>
          {address.city}, {address.state} -{" "}
          <span className="text-white">
            {address.pinCode}
          </span>
        </p>

        <p className="pt-2 text-neutral-500">
          Phone:{" "}
          <span className="text-neutral-300">
            {address.phone}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
        <button
          onClick={onEdit}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-neutral-300 transition hover:border-[#d4af37]/30 hover:text-white"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-neutral-400 transition hover:border-red-400/30 hover:text-red-300"
        >
          Delete
        </button>

        {!address.isDefault && (
          <button
            onClick={onSetDefault}
            className="ml-auto rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2 text-xs text-[#d4af37] transition hover:bg-[#d4af37]/10"
          >
            Make Default
          </button>
        )}
      </div>
    </article>
  );
}

export default Addresses;