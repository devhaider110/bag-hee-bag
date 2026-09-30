import React from "react";

function Shipping({ navigate }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Shipping Policy
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Everything you need to know about delivery and order shipping.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 md:p-10">
          <section>
            <h2 className="text-2xl font-semibold">1. Order Processing</h2>
            <p className="mt-3 leading-7 text-black/65">
              Orders are processed after successful order placement and
              payment confirmation where applicable. Processing time can vary
              depending on product availability and order volume.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Delivery Address</h2>
            <p className="mt-3 leading-7 text-black/65">
              Customers should provide a complete and accurate delivery
              address, phone number and other required delivery information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Delivery Time</h2>
            <p className="mt-3 leading-7 text-black/65">
              Estimated delivery timelines may vary based on destination,
              courier availability, weather, holidays and other logistical
              circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Shipping Charges</h2>
            <p className="mt-3 leading-7 text-black/65">
              Applicable shipping charges, if any, will be displayed during
              checkout before the order is confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Tracking</h2>
            <p className="mt-3 leading-7 text-black/65">
              Where tracking information is available, customers may receive
              tracking details through the order or notification system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Delivery Issues</h2>
            <p className="mt-3 leading-7 text-black/65">
              If your order is delayed, damaged or appears to have a delivery
              issue, please contact our customer support team as soon as
              possible.
            </p>

            <button
              onClick={() => navigate("/contact")}
              className="mt-5 rounded-full bg-[#17120f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              Contact Support
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Shipping;