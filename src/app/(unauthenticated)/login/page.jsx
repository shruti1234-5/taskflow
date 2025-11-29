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
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!result.success) {
        const msg = result.message || "Invalid email or password";
        setError(msg);
        enqueueSnackbar(msg, { variant: 'error' });
        setLoading(false);
        return;
      }

      enqueueSnackbar('Logged in successfully', { variant: 'success' });
      if (result.data?.role === "employee") {
        router.push("/employee/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      enqueueSnackbar('Something went wrong. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-800 transition-all">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700 dark:text-indigo-400">
        Login
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-3 text-sm font-medium">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-gray-700 dark:text-black-200 text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-black-100"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 dark:text-black-200 text-sm font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-black-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold shadow-md transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-lg'}`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
