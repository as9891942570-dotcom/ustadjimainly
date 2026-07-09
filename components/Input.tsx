"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, type, ...props }, ref) => {
    const inputId = id || props.name;
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordField = type === "password";
    const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full rounded-xl border bg-white/80 px-4 py-2.5 text-gray-900 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
              error ? "border-red-400" : "border-gray-200 hover:border-emerald-300"
            } ${isPasswordField ? "pr-11" : ""} ${className}`}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
