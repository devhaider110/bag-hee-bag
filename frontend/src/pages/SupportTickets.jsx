import { useEffect, useState } from "react";

import {
  addCustomerSupportMessage,
  getMySupportTicket,
  getMySupportTickets,
} from "../services/supportService";


const statusLabel = (
  status
) =>
  String(status || "NEW")
    .replaceAll("_", " ");


function SupportTickets() {

  const [
    tickets,
    setTickets,
  ] = useState([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState(null);

  const [
    selectedTicket,
    setSelectedTicket,
  ] = useState(null);

  const [
    reply,
    setReply,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const loadTickets =
    async () => {
      try {
        setLoading(true);

        const response =
          await getMySupportTickets({
            limit: 50,
          });

        setTickets(
          response.tickets || []
        );

        if (
          !selectedId &&
          response.tickets?.length
        ) {
          setSelectedId(
            response.tickets[0]._id
          );
        }

      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load support tickets."
        );
      } finally {
        setLoading(false);
      }
    };


  const loadDetail =
    async (id) => {
      if (!id) return;

      try {
        setDetailLoading(true);

        const response =
          await getMySupportTicket(
            id
          );

        setSelectedTicket(
          response.ticket
        );

      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load ticket details."
        );
      } finally {
        setDetailLoading(false);
      }
    };


  useEffect(() => {
    loadTickets();
  }, []);


  useEffect(() => {
    loadDetail(
      selectedId
    );
  }, [selectedId]);


  const sendReply =
    async (event) => {
      event.preventDefault();

      if (
        !reply.trim() ||
        !selectedId
      ) {
        return;
      }

      try {
        setSending(true);

        const response =
          await addCustomerSupportMessage(
            selectedId,
            reply.trim()
          );

        setSelectedTicket(
          response.ticket
        );

        setReply("");

        await loadTickets();

      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to send reply."
        );
      } finally {
        setSending(false);
      }
    };


  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">
            Support
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            My Support Tickets
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Track your enquiries and
            continue conversations with
            BAG HEE BAG support.
          </p>

        </div>


        {error && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">


          {/* TICKETS */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">

            {loading ? (

              <p className="p-5 text-sm text-white/50">
                Loading tickets...
              </p>

            ) : tickets.length ===
              0 ? (

              <p className="p-5 text-sm text-white/50">
                No support tickets yet.
                Create one from Contact Us.
              </p>

            ) : (

              <div className="space-y-2">

                {tickets.map(
                  (ticket) => (

                    <button
                      key={ticket._id}
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          ticket._id
                        )
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedId ===
                        ticket._id
                          ? "border-[#d4af37]/40 bg-[#d4af37]/10"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs text-[#d4af37]">
                          {
                            ticket.ticketNumber
                          }
                        </span>

                        <span className="text-[10px] uppercase text-white/45">
                          {
                            statusLabel(
                              ticket.status
                            )
                          }
                        </span>

                      </div>


                      <p className="mt-2 line-clamp-2 text-sm font-medium">
                        {
                          ticket.subject
                        }
                      </p>


                      <p className="mt-2 text-xs text-white/35">
                        {new Date(
                          ticket.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>

                    </button>

                  )
                )}

              </div>
            )}

          </section>


          {/* DETAILS */}

          <section className="flex min-h-[600px] flex-col rounded-2xl border border-white/10 bg-white/[0.03]">

            {detailLoading ? (

              <div className="flex flex-1 items-center justify-center text-sm text-white/50">
                Loading ticket...
              </div>

            ) : !selectedTicket ? (

              <div className="flex flex-1 items-center justify-center text-sm text-white/40">
                Select a ticket to view
                the conversation.
              </div>

            ) : (

              <>

                <div className="border-b border-white/10 p-5">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>

                      <p className="text-xs text-[#d4af37]">
                        {
                          selectedTicket.ticketNumber
                        }
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        {
                          selectedTicket.subject
                        }
                      </h2>

                    </div>


                    <div className="flex gap-2 text-xs">

                      <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                        {
                          statusLabel(
                            selectedTicket.status
                          )
                        }
                      </span>

                      <span className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-[#d4af37]">
                        {
                          selectedTicket.priority
                        }
                      </span>

                    </div>

                  </div>

                </div>


                <div className="flex-1 space-y-4 overflow-y-auto p-5">

                  {(
                    selectedTicket.messages ||
                    []
                  ).map(
                    (item) => (

                      <div
                        key={item._id}
                        className={`flex ${
                          item.senderRole ===
                          "customer"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            item.senderRole ===
                            "customer"
                              ? "bg-[#d4af37] text-black"
                              : "border border-white/10 bg-black/30 text-white"
                          }`}
                        >

                          <p className="text-xs font-semibold opacity-70">
                            {
                              item.senderRole ===
                              "customer"
                                ? "You"
                                : "BAG HEE BAG Support"
                            }
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                            {
                              item.message
                            }
                          </p>

                          <p className="mt-2 text-[10px] opacity-50">
                            {new Date(
                              item.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>


                {selectedTicket.status !==
                  "CLOSED" && (

                  <form
                    onSubmit={
                      sendReply
                    }
                    className="border-t border-white/10 p-4"
                  >

                    <div className="flex gap-2">

                      <input
                        value={reply}
                        onChange={(
                          event
                        ) =>
                          setReply(
                            event.target
                              .value
                          )
                        }
                        placeholder="Write a reply..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-[#d4af37]/50"
                      />

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !reply.trim()
                        }
                        className="rounded-xl bg-[#d4af37] px-5 text-sm font-semibold text-black disabled:opacity-50"
                      >
                        {sending
                          ? "..."
                          : "Send"}
                      </button>

                    </div>

                  </form>

                )}

              </>

            )}

          </section>

        </div>

      </div>

    </main>
  );
}

export default SupportTickets;