"use client";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!result.success) {
        const msg = result.message || "Invalid email or password";
        setError(msg);
        enqueueSnackbar(msg, { variant: "error" });
        setLoading(false);
        return;
      }

      enqueueSnackbar("Logged in successfully", { variant: "success" });
      if (result.data?.role === "employee") {
        router.push("/employee/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-600/10 dark:from-black dark:via-gray-900 dark:to-black">
      <div
        className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl w-full max-w-md p-8 border border-gray-200 dark:border-gray-800 transition-all 
        animate-[fadeIn_0.7s_ease]"
      >
        {/* Heading */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700 dark:text-indigo-400 tracking-wide animate-[slideDown_0.6s_ease]">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-3 text-sm font-medium animate-[shake_0.2s]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="group transition-all">
            <label className="block text-gray-800 dark:text-gray-200 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white-100
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none
              transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="group transition-all">
            <label className="block text-gray-800 dark:text-gray-200 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white-100
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none
              transition-all duration-200"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold shadow-md 
            transition duration-300 transform
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5"}
            active:scale-[0.98]`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
