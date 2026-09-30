// import React, { useMemo, useState } from "react";
// import { useCart } from "../context/CartContext";
// import CouponBox from "../components/CouponBox";

// const Cart = () => {
//   const {
//     cart,
//     cartCount,
//     cartSubtotal,
//     updateQuantity,
//     removeItem,
//     clearCart,
//     loading,
//   } = useCart();

//   // ✅ CartContext me cart = { items: [] } hota hai
//   const cartItems = Array.isArray(cart?.items) ? cart.items : [];

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const navigate = (path) => {
//     window.history.pushState({}, "", path);
//     window.dispatchEvent(new PopStateEvent("popstate"));
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const getProduct = (item) => item?.product || {};
//   const getVariant = (item) => item?.variant || null;

//   const getProductName = (item) => {
//     const product = getProduct(item);
//     const variant = getVariant(item);
//     return product?.name || variant?.name || "BHB Product";
//   };

//   const getProductImage = (item) => {
//     const product = getProduct(item);
//     const variant = getVariant(item);

//     if (variant?.images?.length) {
//       const image = variant.images.find((img) => img?.url);
//       if (image?.url) return image.url;
//     }

//     if (product?.images?.length) {
//       const primary = product.images.find((img) => img?.isPrimary);
//       if (primary?.url) return primary.url;

//       const first = product.images.find((img) => img?.url);
//       if (first?.url) return first.url;
//     }

//     return product?.image || "";
//   };

//   const getItemPrice = (item) => {
//     const product = getProduct(item);
//     const variant = getVariant(item);

//     return (
//       Number(
//         variant?.discountPrice ??
//           variant?.price ??
//           product?.discountPrice ??
//           product?.price ??
//           0
//       ) || 0
//     );
//   };

//   const getOriginalPrice = (item) => {
//     const product = getProduct(item);
//     const variant = getVariant(item);
//     return Number(variant?.price ?? product?.price ?? 0) || 0;
//   };

//   const getItemQuantity = (item) => Number(item?.quantity) || 1;

//   const getItemSubtotal = (item) =>
//     getItemPrice(item) * getItemQuantity(item);

//   const formatPrice = (value) =>
//     `₹${Number(value || 0).toLocaleString("en-IN")}`;

//   const couponDiscount = Number(appliedCoupon?.discount || 0);

//   const finalTotal = Math.max(
//     0,
//     Number(cartSubtotal || 0) - couponDiscount
//   );

//   // ✅ cartItems use karo, cart nahi
//   const totalSavings = useMemo(
//     () =>
//       cartItems.reduce((total, item) => {
//         const saving = Math.max(
//           0,
//           getOriginalPrice(item) - getItemPrice(item)
//         );
//         return total + saving * getItemQuantity(item);
//       }, 0),
//     [cartItems]
//   );

//   const handleQuantityChange = async (item, quantity) => {
//     if (quantity < 1) return;

//     try {
//       setActionLoading(true);
//       await updateQuantity(item._id, quantity);
//     } catch (error) {
//       console.error("Quantity update failed:", error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleRemove = async (itemId) => {
//     try {
//       setActionLoading(true);
//       await removeItem(itemId);
//     } catch (error) {
//       console.error("Remove cart item failed:", error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleClearCart = async () => {
//     if (
//       !window.confirm(
//         "Are you sure you want to remove all items from your cart?"
//       )
//     ) {
//       return;
//     }

//     try {
//       setActionLoading(true);
//       await clearCart();
//       setAppliedCoupon(null);
//     } catch (error) {
//       console.error("Clear cart failed:", error);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#080808] px-4 py-16 text-white">
//         <div className="flex min-h-[60vh] items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
//             <p className="text-sm text-white/50">
//               Loading your cart...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ cartItems.length check karo
//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#080808] px-4 py-12 text-white sm:px-6 lg:px-8">
//         <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center">
//           <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
//             <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
//               <svg
//                 className="h-10 w-10 text-amber-400"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M2.25 3h1.386c.51 0 .955.343 1.087.836L5.64 6.75m0 0h13.11c.86 0 1.505.79 1.333 1.633l-1.2 5.85A1.125 1.125 0 0117.782 15H8.25a1.125 1.125 0 01-1.102-.893L5.64 6.75zm0 0L4.5 4.5m3.75 14.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
//                 />
//               </svg>
//             </div>

//             <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
//               BAG HEE BAG
//             </p>

//             <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
//               Your cart is empty
//             </h1>

//             <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
//               Looks like you haven't added anything to your cart yet.
//               Discover something beautiful for your next look.
//             </p>

//             <button
//               type="button"
//               onClick={() => navigate("/shop")}
//               className="mt-8 rounded-2xl bg-amber-400 px-7 py-4 text-sm font-bold text-black transition hover:bg-amber-300"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
//       <div className="mx-auto max-w-[1500px]">
//         <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
//               BAG HEE BAG
//             </p>
//             <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
//               Shopping Cart
//             </h1>
//             <p className="mt-2 text-sm text-white/45">
//               {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() => navigate("/shop")}
//             className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/60 transition hover:text-amber-400"
//           >
//             ← Continue Shopping
//           </button>
//         </div>

//         {totalSavings > 0 && (
//           <div className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-5 py-4">
//             <p className="text-sm font-semibold text-emerald-300">
//               You're saving {formatPrice(totalSavings)}
//             </p>
//             <p className="mt-1 text-xs text-white/40">
//               Product discounts are already applied.
//             </p>
//           </div>
//         )}

//         <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
//           <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">
//             <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
//               <div>
//                 <h2 className="text-lg font-semibold sm:text-xl">
//                   Your Items
//                 </h2>
//                 <p className="mt-1 text-xs text-white/40">
//                   Review your selection before checkout.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleClearCart}
//                 disabled={actionLoading}
//                 className="text-xs font-semibold uppercase tracking-wider text-white/35 transition hover:text-red-400 disabled:opacity-40"
//               >
//                 Clear Cart
//               </button>
//             </div>

//             <div className="divide-y divide-white/10">
//               {/* ✅ cartItems.map use karo */}
//               {cartItems.map((item, index) => {
//                 const product = getProduct(item);
//                 const variant = getVariant(item);
//                 const image = getProductImage(item);
//                 const name = getProductName(item);
//                 const price = getItemPrice(item);
//                 const originalPrice = getOriginalPrice(item);
//                 const quantity = getItemQuantity(item);
//                 const itemSubtotal = getItemSubtotal(item);
//                 const hasDiscount = originalPrice > price;

//                 return (
//                   <article
//                     key={item?._id || `${product?._id}-${index}`}
//                     className="group p-4 transition hover:bg-white/[0.015] sm:p-6"
//                   >
//                     <div className="flex gap-4 sm:gap-5">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           product?._id &&
//                           navigate(`/product/${product._id}`)
//                         }
//                         className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:h-36 sm:w-32"
//                       >
//                         {image ? (
//                           <img
//                             src={image}
//                             alt={name}
//                             className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
//                           />
//                         ) : (
//                           <div className="flex h-full w-full items-center justify-center text-white/20">
//                             No Image
//                           </div>
//                         )}
//                       </button>

//                       <div className="min-w-0 flex-1">
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 product?._id &&
//                                 navigate(`/product/${product._id}`)
//                               }
//                               className="text-left"
//                             >
//                               <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-white transition hover:text-amber-400 sm:text-base">
//                                 {name}
//                               </h3>
//                             </button>

//                             {product?.brand && (
//                               <p className="mt-1 text-xs text-white/35">
//                                 {product.brand}
//                               </p>
//                             )}

//                             {variant && (
//                               <div className="mt-2 flex flex-wrap gap-2">
//                                 {variant.color && (
//                                   <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45">
//                                     Color: {variant.color}
//                                   </span>
//                                 )}
//                                 {variant.size && (
//                                   <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45">
//                                     Size: {variant.size}
//                                   </span>
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           <button
//                             type="button"
//                             onClick={() => handleRemove(item._id)}
//                             disabled={actionLoading}
//                             className="shrink-0 rounded-full p-2 text-white/25 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40"
//                             aria-label={`Remove ${name}`}
//                           >
//                             ✕
//                           </button>
//                         </div>

//                         <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-base font-bold text-amber-400 sm:text-lg">
//                                 {formatPrice(price)}
//                               </span>

//                               {hasDiscount && (
//                                 <span className="text-xs text-white/25 line-through">
//                                   {formatPrice(originalPrice)}
//                                 </span>
//                               )}
//                             </div>

//                             <p className="mt-1 text-xs text-white/30">
//                               {formatPrice(price)} × {quantity}
//                             </p>
//                           </div>

//                           <div className="flex items-center justify-between gap-4 sm:justify-end">
//                             <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03]">
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleQuantityChange(item, quantity - 1)
//                                 }
//                                 disabled={actionLoading || quantity <= 1}
//                                 className="flex h-10 w-10 items-center justify-center text-white/50 transition hover:text-amber-400 disabled:opacity-20"
//                               >
//                                 −
//                               </button>

//                               <span className="flex h-10 min-w-10 items-center justify-center border-x border-white/10 px-3 text-sm font-semibold">
//                                 {quantity}
//                               </span>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleQuantityChange(item, quantity + 1)
//                                 }
//                                 disabled={actionLoading}
//                                 className="flex h-10 w-10 items-center justify-center text-white/50 transition hover:text-amber-400 disabled:opacity-20"
//                               >
//                                 +
//                               </button>
//                             </div>

//                             <div className="min-w-[90px] text-right">
//                               <p className="text-base font-bold text-white">
//                                 {formatPrice(itemSubtotal)}
//                               </p>
//                               <p className="mt-1 text-[10px] uppercase tracking-wider text-white/25">
//                                 Item Total
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           </section>

//           <aside className="h-fit xl:sticky xl:top-6">
//             <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">
//               <div className="border-b border-white/10 px-5 py-5 sm:px-7">
//                 <h2 className="text-lg font-semibold sm:text-xl">
//                   Order Summary
//                 </h2>
//                 <p className="mt-1 text-xs text-white/40">
//                   Review your discount before proceeding.
//                 </p>
//               </div>

//               <div className="space-y-6 p-5 sm:p-7">
//                 <CouponBox
//                   cartSubtotal={cartSubtotal}
//                   appliedCoupon={appliedCoupon}
//                   onCouponApplied={setAppliedCoupon}
//                   onCouponRemoved={() => setAppliedCoupon(null)}
//                 />

//                 <div className="space-y-3 border-t border-white/10 pt-5">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-white/45">Subtotal</span>
//                     <span className="font-medium">
//                       {formatPrice(cartSubtotal)}
//                     </span>
//                   </div>

//                   {totalSavings > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-white/45">
//                         Product Savings
//                       </span>
//                       <span className="text-emerald-400">
//                         - {formatPrice(totalSavings)}
//                       </span>
//                     </div>
//                   )}

//                   {couponDiscount > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-white/45">
//                         Coupon Discount
//                       </span>
//                       <span className="text-emerald-400">
//                         - {formatPrice(couponDiscount)}
//                       </span>
//                     </div>
//                   )}

//                   <div className="flex justify-between text-sm">
//                     <span className="text-white/45">Delivery</span>
//                     <span className="text-xs text-white/35">
//                       Calculated at checkout
//                     </span>
//                   </div>
//                 </div>

//                 {appliedCoupon?.coupon?.code && (
//                   <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3">
//                     <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
//                       Coupon Applied
//                     </p>
//                     <div className="mt-1 flex items-center justify-between">
//                       <span className="text-sm font-bold">
//                         {appliedCoupon.coupon.code}
//                       </span>
//                       <span className="text-xs text-emerald-400">
//                         - {formatPrice(couponDiscount)}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] p-5">
//                   <div className="flex items-end justify-between gap-4">
//                     <div>
//                       <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
//                         Cart Total
//                       </p>
//                       <p className="mt-1 text-xs text-white/30">
//                         Delivery calculated at checkout
//                       </p>
//                     </div>

//                     <p className="text-2xl font-bold text-amber-400 sm:text-3xl">
//                       {formatPrice(finalTotal)}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => navigate("/checkout")}
//                   disabled={actionLoading || cartItems.length === 0}
//                   className="group w-full rounded-2xl bg-amber-400 px-6 py-4 font-bold text-black shadow-lg transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <span className="flex items-center justify-center gap-2">
//                     {actionLoading ? (
//                       <>
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
//                         Updating...
//                       </>
//                     ) : (
//                       <>
//                         Proceed to Checkout
//                         <span className="text-lg transition-transform group-hover:translate-x-1">
//                           →
//                         </span>
//                       </>
//                     )}
//                   </span>
//                 </button>

//                 <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
//                   <p className="text-[11px] leading-5 text-white/35">
//                     Your order details and payment information are processed
//                     securely.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
//               <p className="text-sm font-semibold text-white">
//                 Delivery details
//               </p>
//               <p className="mt-1 text-xs leading-5 text-white/35">
//                 Choose your delivery address and payment method on the next
//                 step.
//               </p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;

import React, { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import CouponBox from "../components/CouponBox";

const Cart = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
  } = useCart();

  // ✅ CartContext me cart = { items: [] } hota hai
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getProduct = (item) => item?.product || {};
  const getVariant = (item) => item?.variant || null;

  const getProductName = (item) => {
    const product = getProduct(item);
    const variant = getVariant(item);
    return product?.name || variant?.name || "BHB Product";
  };

  const getProductImage = (item) => {
    const product = getProduct(item);
    const variant = getVariant(item);

    if (variant?.images?.length) {
      const image = variant.images.find((img) => img?.url);
      if (image?.url) return image.url;
    }

    if (product?.images?.length) {
      const primary = product.images.find((img) => img?.isPrimary);
      if (primary?.url) return primary.url;

      const first = product.images.find((img) => img?.url);
      if (first?.url) return first.url;
    }

    return product?.image || "";
  };

  const getItemPrice = (item) => {
    const product = getProduct(item);
    const variant = getVariant(item);

    return (
      Number(
        variant?.discountPrice ??
          variant?.price ??
          product?.discountPrice ??
          product?.price ??
          0
      ) || 0
    );
  };

  const getOriginalPrice = (item) => {
    const product = getProduct(item);
    const variant = getVariant(item);
    return Number(variant?.price ?? product?.price ?? 0) || 0;
  };

  const getItemQuantity = (item) => Number(item?.quantity) || 1;

  const getItemSubtotal = (item) =>
    getItemPrice(item) * getItemQuantity(item);

  const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const couponDiscount = Number(appliedCoupon?.discount || 0);

  const finalTotal = Math.max(
    0,
    Number(cartSubtotal || 0) - couponDiscount
  );

  // ✅ cartItems use karo, cart nahi
  const totalSavings = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const saving = Math.max(
          0,
          getOriginalPrice(item) - getItemPrice(item)
        );
        return total + saving * getItemQuantity(item);
      }, 0),
    [cartItems]
  );

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;

    try {
      setActionLoading(true);
      await updateQuantity(item._id, quantity);
    } catch (error) {
      console.error("Quantity update failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setActionLoading(true);
      await removeItem(itemId);
    } catch (error) {
      console.error("Remove cart item failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all items from your cart?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await clearCart();
      setAppliedCoupon(null);
    } catch (error) {
      console.error("Clear cart failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-16 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-white/50">
              Loading your cart...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ cartItems.length check karo
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
            <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
              <svg
                className="h-10 w-10 text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.836L5.64 6.75m0 0h13.11c.86 0 1.505.79 1.333 1.633l-1.2 5.85A1.125 1.125 0 0117.782 15H8.25a1.125 1.125 0 01-1.102-.893L5.64 6.75zm0 0L4.5 4.5m3.75 14.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              BAG HEE BAG
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
              Looks like you haven't added anything to your cart yet.
              Discover something beautiful for your next look.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-8 rounded-2xl bg-amber-400 px-7 py-4 text-sm font-bold text-black transition hover:bg-amber-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              BAG HEE BAG
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-white/45">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/60 transition hover:text-amber-400"
          >
            ← Continue Shopping
          </button>
        </div>

        {totalSavings > 0 && (
          <div className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-5 py-4">
            <p className="text-sm font-semibold text-emerald-300">
              You're saving {formatPrice(totalSavings)}
            </p>
            <p className="mt-1 text-xs text-white/40">
              Product discounts are already applied.
            </p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  Your Items
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  Review your selection before checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={actionLoading}
                className="text-xs font-semibold uppercase tracking-wider text-white/35 transition hover:text-red-400 disabled:opacity-40"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-white/10">
              {/* ✅ cartItems.map use karo */}
              {cartItems.map((item, index) => {
                const product = getProduct(item);
                const variant = getVariant(item);
                const image = getProductImage(item);
                const name = getProductName(item);
                const price = getItemPrice(item);
                const originalPrice = getOriginalPrice(item);
                const quantity = getItemQuantity(item);
                const itemSubtotal = getItemSubtotal(item);
                const hasDiscount = originalPrice > price;

                return (
                  <article
                    key={item?._id || `${product?._id}-${index}`}
                    className="group p-4 transition hover:bg-white/[0.015] sm:p-6"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      <button
                        type="button"
                        onClick={() =>
                          product?._id &&
                          navigate(`/product/${product._id}`)
                        }
                        className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:h-36 sm:w-32"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/20">
                            No Image
                          </div>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                product?._id &&
                                navigate(`/product/${product._id}`)
                              }
                              className="text-left"
                            >
                              <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-white transition hover:text-amber-400 sm:text-base">
                                {name}
                              </h3>
                            </button>

                            {product?.brand && (
                              <p className="mt-1 text-xs text-white/35">
                                {product.brand}
                              </p>
                            )}

                            {variant && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {variant.color && (
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45">
                                    Color: {variant.color}
                                  </span>
                                )}
                                {variant.size && (
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/45">
                                    Size: {variant.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item._id)}
                            disabled={actionLoading}
                            className="shrink-0 rounded-full p-2 text-white/25 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40"
                            aria-label={`Remove ${name}`}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-amber-400 sm:text-lg">
                                {formatPrice(price)}
                              </span>

                              {hasDiscount && (
                                <span className="text-xs text-white/25 line-through">
                                  {formatPrice(originalPrice)}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-white/30">
                              {formatPrice(price)} × {quantity}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03]">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item, quantity - 1)
                                }
                                disabled={actionLoading || quantity <= 1}
                                className="flex h-10 w-10 items-center justify-center text-white/50 transition hover:text-amber-400 disabled:opacity-20"
                              >
                                −
                              </button>

                              <span className="flex h-10 min-w-10 items-center justify-center border-x border-white/10 px-3 text-sm font-semibold">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item, quantity + 1)
                                }
                                disabled={actionLoading}
                                className="flex h-10 w-10 items-center justify-center text-white/50 transition hover:text-amber-400 disabled:opacity-20"
                              >
                                +
                              </button>
                            </div>

                            <div className="min-w-[90px] text-right">
                              <p className="text-base font-bold text-white">
                                {formatPrice(itemSubtotal)}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/25">
                                Item Total
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="h-fit xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                <h2 className="text-lg font-semibold sm:text-xl">
                  Order Summary
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  Review your discount before proceeding.
                </p>
              </div>

              <div className="space-y-6 p-5 sm:p-7">
                <CouponBox
                  cartValue={cartSubtotal}
                  appliedCoupon={appliedCoupon}
                  onApply={setAppliedCoupon}
                  onRemove={() => setAppliedCoupon(null)}
                />

                <div className="space-y-3 border-t border-white/10 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/45">
                        Product Savings
                      </span>
                      <span className="text-emerald-400">
                        - {formatPrice(totalSavings)}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/45">
                        Coupon Discount
                      </span>
                      <span className="text-emerald-400">
                        - {formatPrice(couponDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-white/45">Delivery</span>
                    <span className="text-xs text-white/35">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                {appliedCoupon?.coupon?.code && (
                  <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      Coupon Applied
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {appliedCoupon.coupon.code}
                      </span>
                      <span className="text-xs text-emerald-400">
                        - {formatPrice(couponDiscount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                        Cart Total
                      </p>
                      <p className="mt-1 text-xs text-white/30">
                        Delivery calculated at checkout
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-amber-400 sm:text-3xl">
                      {formatPrice(finalTotal)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  disabled={actionLoading || cartItems.length === 0}
                  className="group w-full rounded-2xl bg-amber-400 px-6 py-4 font-bold text-black shadow-lg transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <span className="text-lg transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </span>
                </button>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <p className="text-[11px] leading-5 text-white/35">
                    Your order details and payment information are processed
                    securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm font-semibold text-white">
                Delivery details
              </p>
              <p className="mt-1 text-xs leading-5 text-white/35">
                Choose your delivery address and payment method on the next
                step.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;