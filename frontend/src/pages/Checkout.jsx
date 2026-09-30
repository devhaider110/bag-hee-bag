import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  getAddresses,
} from "../services/addressService";

import {
  prepareCheckout,
  createRazorpayOrder,
  placeCODOrder,
  verifyRazorpayPayment,
} from "../services/checkoutService";

import CheckoutSummary from "../components/CheckoutSummary";
import PaymentMethod from "../components/PaymentMethod";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const Checkout = () => {
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const {
    token,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [addresses, setAddresses] =
    useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState("");

  const [checkout, setCheckout] =
    useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !token
    ) {
      return;
    }

    const loadAddresses = async () => {
      try {
        setLoading(true);

        const response =
          await getAddresses(token);

        const list =
          response?.addresses || [];

        setAddresses(list);

        const defaultAddress =
          list.find(
            (address) =>
              address.isDefault
          );

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress._id
          );
        } else if (list.length > 0) {
          setSelectedAddressId(
            list[0]._id
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load addresses."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [
    authLoading,
    isAuthenticated,
    token,
  ]);

  const loadCheckout = async (
    code = appliedCoupon
  ) => {
    if (!selectedAddressId) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");
      setProcessing(true);

      const response =
        await prepareCheckout(
          token,
          selectedAddressId,
          code
        );

      setCheckout(
        response.checkout
      );

      setAppliedCoupon(
        response.checkout?.couponCode ||
          ""
      );
    } catch (err) {
      console.error(err);

      setCheckout(null);

      setError(
        err.response?.data?.message ||
          "Unable to prepare checkout."
      );
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (
      selectedAddressId &&
      token
    ) {
      loadCheckout();
    }
  }, [selectedAddressId]);

  const handleApplyCoupon = async () => {
    const code =
      couponCode.trim().toUpperCase();

    if (!code) {
      setError(
        "Please enter a coupon code."
      );
      return;
    }

    await loadCheckout(code);
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setAppliedCoupon("");

    await loadCheckout("");
  };

  const handleCOD = async () => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response =
        await placeCODOrder(
          token,
          selectedAddressId,
          appliedCoupon
        );

      setSuccess(
        "Your order has been placed successfully."
      );

      const orderId =
        response?.order?._id;

      setTimeout(() => {
        navigate(
          `/order-success/${orderId}`
        );
      }, 800);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to place order."
      );
    } finally {
      setProcessing(false);
    }
  };

  const openRazorpay = async () => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      const response =
        await createRazorpayOrder(
          token,
          selectedAddressId,
          appliedCoupon
        );

      const {
        razorpayOrder,
        razorpayKey,
        checkout: latestCheckout,
      } = response;

      if (
        !razorpayOrder ||
        !razorpayKey
      ) {
        throw new Error(
          "Payment gateway could not be initialized."
        );
      }

      setCheckout(
        latestCheckout
      );

      if (
        !window.Razorpay
      ) {
        throw new Error(
          "Razorpay payment gateway is not loaded."
        );
      }

      const options = {
        key: razorpayKey,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name: "BAG HEE BAG",

        description:
          "BHB Bag Store Purchase",

        order_id:
          razorpayOrder.id,

        prefill: {},

        theme: {
          color: "#D4AF37",
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);

            setError(
              "Payment was cancelled. You can try again."
            );
          },
        },

        handler:
          async function (
            paymentResponse
          ) {
            try {
              const verification =
                await verifyRazorpayPayment(
                  token,
                  {
                    addressId:
                      selectedAddressId,

                    couponCode:
                      appliedCoupon,

                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,
                  }
                );

              setSuccess(
                "Payment successful. Your order has been placed."
              );

              const orderId =
                verification?.order?._id;

              setTimeout(() => {
                navigate(
                  `/order-success/${orderId}`
                );
              }, 800);
            } catch (err) {
              console.error(err);

              setError(
                err.response?.data?.message ||
                  "Payment verification failed."
              );
            } finally {
              setProcessing(false);
            }
          },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response
          );

          setProcessing(false);

          setError(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment."
      );

      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (!checkout) {
      setError(
        "Please wait while checkout is prepared."
      );
      return;
    }

    if (paymentMethod === "COD") {
      await handleCOD();
      return;
    }

    await openRazorpay();
  };

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading checkout...
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-400">
            BAG HEE BAG
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-neutral-500">
            Complete your order securely.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/40 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-900 bg-emerald-950/40 px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          <div className="space-y-6">

            {/* ADDRESS */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Delivery Address
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/addresses")
                  }
                  className="text-sm font-medium text-amber-400 hover:text-amber-300"
                >
                  Manage Addresses
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-700 p-6 text-center">
                  <p className="text-neutral-400">
                    No delivery address found.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/addresses")
                    }
                    className="mt-4 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map(
                    (address) => (
                      <button
                        type="button"
                        key={address._id}
                        onClick={() =>
                          setSelectedAddressId(
                            address._id
                          )
                        }
                        className={`rounded-2xl border p-5 text-left transition ${
                          selectedAddressId ===
                          address._id
                            ? "border-amber-400 bg-amber-400/10"
                            : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {address.fullName}
                            </p>

                            <p className="mt-1 text-sm text-neutral-400">
                              {address.addressType}
                            </p>
                          </div>

                          {address.isDefault && (
                            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-400">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-neutral-400">
                          {address.house},{" "}
                          {address.street}
                          <br />

                          {address.landmark && (
                            <>
                              {address.landmark}
                              <br />
                            </>
                          )}

                          {address.city},{" "}
                          {address.state} -{" "}
                          {address.pinCode}
                        </p>

                        <p className="mt-3 text-sm text-neutral-300">
                          +91 {address.phone}
                        </p>
                      </button>
                    )
                  )}
                </div>
              )}
            </section>

            {/* PRODUCTS */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="mb-5 text-xl font-semibold">
                Order Items
              </h2>

              {!checkout?.orderItems?.length ? (
                <p className="text-neutral-500">
                  Preparing your order...
                </p>
              ) : (
                <div className="space-y-5">
                  {checkout.orderItems.map(
                    (item) => (
                      <div
                        key={`${item.product}-${item.variantId || "default"}`}
                        className="flex gap-4 border-b border-neutral-800 pb-5 last:border-0 last:pb-0"
                      >
                        <img
                          src={
                            item.productImage ||
                            "https://via.placeholder.com/120"
                          }
                          alt={
                            item.productName
                          }
                          className="h-24 w-24 rounded-2xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">
                            {item.productName}
                          </h3>

                          {item.variantName && (
                            <p className="mt-1 text-sm text-neutral-500">
                              {item.variantName}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-neutral-500">
                            Qty:{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-amber-400">
                            {formatPrice(
                              item.total
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* COUPON */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <h2 className="mb-5 text-xl font-semibold">
                Coupon / Offer
              </h2>

              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4">
                  <div>
                    <p className="font-semibold text-emerald-400">
                      {appliedCoupon}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      Coupon applied successfully
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemoveCoupon
                    }
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={couponCode}
                    onChange={(event) =>
                      setCouponCode(
                        event.target.value
                      )
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-amber-400"
                  />

                  <button
                    type="button"
                    onClick={
                      handleApplyCoupon
                    }
                    disabled={processing}
                    className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
            </section>

            {/* PAYMENT */}
            <PaymentMethod
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <CheckoutSummary
              checkout={checkout}
            />

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                processing ||
                !checkout ||
                !selectedAddressId
              }
              className="mt-5 w-full rounded-2xl bg-amber-400 px-6 py-4 text-base font-bold text-black shadow-xl shadow-amber-400/10 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Processing..."
                : paymentMethod ===
                  "COD"
                ? `Place Order • ${formatPrice(
                    checkout?.totalAmount
                  )}`
                : `Pay Securely • ${formatPrice(
                    checkout?.totalAmount
                  )}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-neutral-600">
              Your payment and order details are securely processed.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;