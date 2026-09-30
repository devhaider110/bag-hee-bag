import { useEffect, useState } from "react";

import {
  addAdminSupportMessage,
  getAdminSupportSummary,
  getAdminSupportTicket,
  getAdminSupportTickets,
  updateAdminSupportTicket,
} from "../../services/supportService";


const statuses = [
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const priorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];


const label = (value) =>
  String(value || "")
    .replaceAll("_", " ");


function AdminSupport() {
  const [
    summary,
    setSummary,
  ] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });


  const [
    tickets,
    setTickets,
  ] = useState([]);


  const [
    selectedId,
    setSelectedId,
  ] = useState(null);


  const [
    ticket,
    setTicket,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    status,
    setStatus,
  ] = useState("");


  const [
    priority,
    setPriority,
  ] = useState("");


  const [
    reply,
    setReply,
  ] = useState("");


  const [
    internalNotes,
    setInternalNotes,
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
    saving,
    setSaving,
  ] = useState(false);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const loadSummary =
    async () => {
      const response =
        await getAdminSupportSummary();

      setSummary(
        response.summary || {}
      );
    };


  const loadTickets =
    async () => {
      try {
        setLoading(true);

        const response =
          await getAdminSupportTickets({
            search,
            status,
            priority,
            page: 1,
            limit: 100,
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


  const loadTicket =
    async (id) => {
      if (!id) return;

      try {
        setDetailLoading(true);

        const response =
          await getAdminSupportTicket(
            id
          );

        setTicket(
          response.ticket
        );

        setInternalNotes(
          response.ticket
            ?.internalNotes || ""
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
    Promise.all([
      loadSummary(),
      loadTickets(),
    ]).catch((err) => {
      setError(
        err?.response?.data?.message ||
          "Unable to load support dashboard."
      );
    });
  }, [
    status,
    priority,
  ]);


  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadTickets();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [search]);


  useEffect(() => {
    loadTicket(
      selectedId
    );
  }, [selectedId]);


  const refresh =
    async () => {
      await Promise.all([
        loadSummary(),
        loadTickets(),
      ]);

      if (selectedId) {
        await loadTicket(
          selectedId
        );
      }
    };


  const saveTicket =
    async () => {
      if (!ticket?._id) return;

      try {
        setSaving(true);

        await updateAdminSupportTicket(
          ticket._id,
          {
            status:
              ticket.status,

            priority:
              ticket.priority,

            internalNotes,
          }
        );

        await refresh();
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to update ticket."
        );
      } finally {
        setSaving(false);
      }
    };


  const sendReply =
    async (event) => {
      event.preventDefault();

      if (
        !reply.trim() ||
        !ticket?._id
      ) {
        return;
      }

      try {
        setSending(true);

        const response =
          await addAdminSupportMessage(
            ticket._id,
            reply.trim()
          );

        setTicket(
          response.ticket
        );

        setReply("");

        await refresh();
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to send admin reply."
        );
      } finally {
        setSending(false);
      }
    };


  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <div className="mb-8">

          

          <h1 className="mt-2 text-3xl font-semibold">
            Support Ticket Dashboard
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Manage enquiries, customer
            conversations, priorities,
            internal notes and ticket status.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* SUMMARY */}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

          {[
            [
              "Total",
              summary.total,
              "text-white",
            ],

            [
              "New",
              summary.new,
              "text-yellow-300",
            ],

            [
              "In Progress",
              summary.inProgress,
              "text-blue-300",
            ],

            [
              "Resolved",
              summary.resolved,
              "text-emerald-300",
            ],

            [
              "Closed",
              summary.closed,
              "text-white/50",
            ],
          ].map(
            ([
              title,
              value,
              color,
            ]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >

                <p className="text-xs uppercase tracking-widest text-white/35">
                  {title}
                </p>

                <p
                  className={`mt-3 text-3xl font-semibold ${color}`}
                >
                  {value || 0}
                </p>

              </div>
            )
          )}

        </section>


        {/* MAIN */}

        <section className="mt-6 grid gap-5 lg:grid-cols-[420px_1fr]">


          {/* TICKET LIST */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

            <div className="grid gap-2">

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search ticket, customer, email, subject..."
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-[#d4af37]/50"
              />


              <div className="grid grid-cols-2 gap-2">

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white outline-none"
                >

                  <option value="">
                    All Status
                  </option>

                  {statuses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {label(item)}
                      </option>
                    )
                  )}

                </select>


                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white outline-none"
                >

                  <option value="">
                    All Priority
                  </option>

                  {priorities.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>


            <div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">

              {loading ? (
                <p className="p-5 text-sm text-white/50">
                  Loading tickets...
                </p>
              ) : tickets.length === 0 ? (
                <p className="p-5 text-sm text-white/50">
                  No tickets found.
                </p>
              ) : (
                tickets.map(
                  (item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          item._id
                        )
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedId ===
                        item._id
                          ? "border-[#d4af37]/40 bg-[#d4af37]/10"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-[10px] text-[#d4af37]">
                          {
                            item.ticketNumber
                          }
                        </span>

                        <span className="text-[10px] uppercase text-white/40">
                          {
                            label(
                              item.status
                            )
                          }
                        </span>

                      </div>


                      <p className="mt-2 text-sm font-medium">
                        {item.subject}
                      </p>


                      <p className="mt-1 text-xs text-white/40">
                        {item.name} ·{" "}
                        {item.email}
                      </p>


                      <div className="mt-3 flex items-center justify-between text-[10px]">

                        <span className="text-white/30">
                          {new Date(
                            item.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <span className="text-[#d4af37]">
                          {item.priority}
                        </span>

                      </div>

                    </button>
                  )
                )
              )}

            </div>

          </div>


          {/* DETAILS */}

          <div className="min-h-[700px] rounded-2xl border border-white/10 bg-white/[0.03]">

            {detailLoading ? (

              <div className="flex min-h-[700px] items-center justify-center text-sm text-white/50">
                Loading ticket details...
              </div>

            ) : !ticket ? (

              <div className="flex min-h-[700px] items-center justify-center text-sm text-white/40">
                Select a ticket from the list.
              </div>

            ) : (

              <div className="flex min-h-[700px] flex-col">

                {/* HEADER */}

                <div className="border-b border-white/10 p-5">

                  <div className="flex flex-wrap items-start justify-between gap-5">

                    <div>

                      <p className="text-xs text-[#d4af37]">
                        {
                          ticket.ticketNumber
                        }
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold">
                        {
                          ticket.subject
                        }
                      </h2>

                      <p className="mt-2 text-sm text-white/45">
                        {ticket.name} ·{" "}
                        {ticket.email}

                        {ticket.phone
                          ? ` · ${ticket.phone}`
                          : ""}
                      </p>

                    </div>


                    <div className="grid min-w-[260px] gap-2 sm:grid-cols-2">

                      <select
                        value={
                          ticket.status
                        }
                        onChange={(
                          event
                        ) =>
                          setTicket(
                            (
                              current
                            ) => ({
                              ...current,
                              status:
                                event.target
                                  .value,
                            })
                          )
                        }
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white outline-none"
                      >

                        {statuses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {label(
                                item
                              )}
                            </option>
                          )
                        )}

                      </select>


                      <select
                        value={
                          ticket.priority
                        }
                        onChange={(
                          event
                        ) =>
                          setTicket(
                            (
                              current
                            ) => ({
                              ...current,
                              priority:
                                event.target
                                  .value,
                            })
                          )
                        }
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-white outline-none"
                      >

                        {priorities.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>


                  {/* ORDER */}

                  {ticket.order && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">

                      <span className="font-semibold text-white">
                        Order:
                      </span>{" "}
                      {ticket.order._id}

                      <span className="mx-2">
                        ·
                      </span>

                      <span className="font-semibold text-white">
                        Status:
                      </span>{" "}
                      {
                        ticket.order
                          .orderStatus
                      }

                      <span className="mx-2">
                        ·
                      </span>

                      <span className="font-semibold text-white">
                        Total:
                      </span>{" "}
                      ₹
                      {Number(
                        ticket.order
                          .totalAmount ||
                          0
                      ).toFixed(2)}

                    </div>
                  )}

                </div>


                {/* CONVERSATION */}

                <div className="flex-1 space-y-4 overflow-y-auto p-5">

                  <div className="rounded-xl border border-[#d4af37]/15 bg-[#d4af37]/[0.04] p-4">

                    <p className="text-xs uppercase tracking-widest text-[#d4af37]">
                      Original Enquiry
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/70">
                      {ticket.message}
                    </p>

                  </div>


                  {(
                    ticket.messages ||
                    []
                  ).map(
                    (item) => (
                      <div
                        key={item._id}
                        className={`flex ${
                          item.senderRole ===
                          "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            item.senderRole ===
                            "admin"
                              ? "bg-[#d4af37] text-black"
                              : "border border-white/10 bg-black/30 text-white"
                          }`}
                        >

                          <p className="text-xs font-semibold opacity-70">
                            {item.senderRole ===
                            "admin"
                              ? "Admin"
                              : item.sender?.name ||
                                "Customer"}
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


                {/* CONTROLS */}

                <div className="border-t border-white/10 p-4">

                  <textarea
                    value={
                      internalNotes
                    }
                    onChange={(
                      event
                    ) =>
                      setInternalNotes(
                        event.target
                          .value
                      )
                    }
                    rows={3}
                    placeholder="Internal/admin notes..."
                    className="mb-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-[#d4af37]/50"
                  />


                  <button
                    type="button"
                    onClick={
                      saveTicket
                    }
                    disabled={
                      saving
                    }
                    className="rounded-xl border border-[#d4af37]/30 px-4 py-2.5 text-sm text-[#d4af37] disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Status / Notes"}
                  </button>


                  {ticket.status !==
                    "CLOSED" && (
                    <form
                      onSubmit={
                        sendReply
                      }
                      className="mt-3 flex gap-2"
                    >

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
                        placeholder="Reply to customer..."
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
                          : "Reply"}
                      </button>

                    </form>
                  )}

                </div>

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

export default AdminSupport;