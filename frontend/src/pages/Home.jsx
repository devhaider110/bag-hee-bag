import { useEffect, useState } from "react";
import { getHomeData } from "../services/homeService";

import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ProductSection from "../components/ProductSection";
import OfferSection from "../components/OfferSection";
import WhyChooseUs from "../components/WhyChooseUs";
import StoreSection from "../components/StoreSection";

function Home() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await getHomeData();
        setHomeData(data);
      } catch (error) {
        console.error("Home data error:", error);
        setError("Unable to load the BHB storefront.");
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30">
            <span className="text-sm tracking-[0.2em] text-[#e4c76b]">
              BHB
            </span>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Loading collection...
          </p>
        </div>
      </div>
    );
  }

  if (error || !homeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-white">
        <div>
          <div className="flex items-center justify-center w-16 h-16 mx-auto border rounded-full border-red-500/20">
            !
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            {error || "Unable to load the BHB storefront."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full border border-white/10 px-6 py-3 text-sm transition hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <Hero hero={homeData.hero} />

      <CategorySection categories={homeData.categories} />

      <ProductSection
        title="Featured Products"
        subtitle="Our highlighted collection"
        products={homeData.featuredProducts}
      />

      <ProductSection
        title="New Arrivals"
        subtitle="Fresh styles coming to BHB"
        products={homeData.newArrivals}
      />

      <ProductSection
        title="Best Sellers"
        subtitle="Popular choices from our collection"
        products={homeData.bestSellers}
      />

      <OfferSection offer={homeData.offer} />

      <WhyChooseUs items={homeData.whyChooseUs} />

      <StoreSection store={homeData.store} />
    </main>
  );
}

export default Home;