import React from "react";

function Terms({ navigate }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Terms & Conditions
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Please read these terms carefully before using the BAG HEE BAG
          website or placing an order.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 md:p-10">
          <section>
            <h2 className="text-2xl font-semibold">1. Website Usage</h2>
            <p className="mt-3 leading-7 text-black/65">
              By using this website, you agree to use it lawfully and not to
              interfere with its operation, security or availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Account</h2>
            <p className="mt-3 leading-7 text-black/65">
              You are responsible for keeping your account credentials secure
              and for providing accurate information when creating an account
              or placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Products & Pricing</h2>
            <p className="mt-3 leading-7 text-black/65">
              Product details, availability, pricing and offers may change
              from time to time. We make reasonable efforts to display
              accurate information on the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Orders</h2>
            <p className="mt-3 leading-7 text-black/65">
              An order is subject to product availability and successful
              processing. BAG HEE BAG may contact you when additional
              information is required for order verification or delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Payments</h2>
            <p className="mt-3 leading-7 text-black/65">
              Available payment methods are displayed during checkout.
              Payments may be handled through authorized third-party payment
              providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Returns & Refunds</h2>
            <p className="mt-3 leading-7 text-black/65">
              Returns and refunds are subject to the applicable BAG HEE BAG
              return policy and the conditions displayed for the relevant
              order.
            </p>

            <button
              onClick={() => navigate("/returns")}
              className="mt-5 rounded-full bg-[#17120f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              View Return Policy
            </button>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Changes</h2>
            <p className="mt-3 leading-7 text-black/65">
              BAG HEE BAG may update these terms when necessary. Updated terms
              will be made available on this page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Terms;