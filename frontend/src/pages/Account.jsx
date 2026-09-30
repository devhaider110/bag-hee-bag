import { useAuth } from "../context/AuthContext";

function Account() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#080808] px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-[#d4af37]">
          BHB Account
        </p>

        <h1 className="mt-4 text-3xl font-semibold">
          My Account
        </h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">
                Name
              </p>

              <p className="mt-2">{user?.name}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">
                Email
              </p>

              <p className="mt-2 break-all">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">
                Phone
              </p>

              <p className="mt-2">
                {user?.phone || "Not added"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">
                Account Type
              </p>

              <p className="mt-2 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 rounded-xl border border-red-500/20 px-5 py-3 text-sm text-red-400 transition hover:bg-red-500/5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;