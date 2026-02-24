import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If no publishable key, show a message
  if (!publishableKey || publishableKey.includes('dummy')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] px-4">
        <div className="w-full max-w-md bg-[#13161E] border border-[#1E2330] rounded-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#00B894] flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-[#0A0C10]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400 mb-4">Start building your data dashboards</p>
          <div className="p-4 bg-[#0A0C10] rounded-lg border border-[#1E2330]">
            <p className="text-sm text-gray-400">
              Authentication is not configured. Please set up Clerk environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] px-4">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-[#13161E] border-[#1E2330] shadow-none",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-[#0A0C10] border-[#1E2330] text-white placeholder:text-gray-600",
            formButtonPrimary: "bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90",
            footerActionText: "text-gray-400",
            footerActionLink: "text-[#00D4AA] hover:text-[#00D4AA]/80",
            dividerLine: "bg-[#1E2330]",
            dividerText: "text-gray-500 bg-[#13161E]",
            socialButtonsBlockButton: "bg-[#0A0C10] border-[#1E2330] text-white hover:bg-[#1E2330]",
            socialButtonsBlockButtonText: "text-white",
            identityPreviewText: "text-gray-300",
            identityPreviewEditButton: "text-[#00D4AA]",
            formFieldSuccessText: "text-[#00D4AA]",
            formFieldErrorText: "text-red-400",
            alertText: "text-red-400",
            alert: "bg-red-500/10 border-red-500/20",
          },
        }}
      />
    </div>
  );
}
