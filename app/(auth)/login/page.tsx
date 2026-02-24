import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-4">Sign in to access your dashboards</p>
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
      <SignIn 
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
