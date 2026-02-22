"use client";

type AuthFormHeaderProps = {
  title: string;
  prompt: string;
  actionLabel: string;
  onAction?: () => void;
};

export function AuthFormHeader({ title, prompt, actionLabel, onAction }: AuthFormHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">
        {prompt}{" "}
        <button
          onClick={onAction}
          className="font-medium text-secondary hover:text-primary2 transition"
          type="button"
        >
          {actionLabel}
        </button>
      </p>
    </div>
  );
}
