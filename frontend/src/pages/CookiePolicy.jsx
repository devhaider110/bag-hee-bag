import React from "react";

function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Cookie Policy
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Learn how cookies and similar technologies may be used on our
          website.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 md:p-10">
          <section>
            <h2 className="text-2xl font-semibold">1. What Are Cookies?</h2>
            <p className="mt-3 leading-7 text-black/65">
              Cookies are small pieces of information stored by your browser
              that can help websites remember information and provide a better
              user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. How We Use Cookies</h2>
            <p className="mt-3 leading-7 text-black/65">
              BAG HEE BAG may use cookies or similar technologies for
              authentication, session management, preferences, website
              functionality and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Essential Cookies</h2>
            <p className="mt-3 leading-7 text-black/65">
              Some cookies may be necessary for features such as account
              sessions, authentication and secure website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Preference Cookies</h2>
            <p className="mt-3 leading-7 text-black/65">
              Preference technologies may help remember settings or choices
              made during your visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Managing Cookies</h2>
            <p className="mt-3 leading-7 text-black/65">
              Most modern browsers allow you to control or delete cookies
              through browser settings. Disabling certain cookies may affect
              some website functionality.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CookiePolicy;