import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "animate.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./_component/Navbar";
import DataProvider from "./DataProvider";
<script src="https://checkout.razorpay.com/v1/checkout.js" async></script>;
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'SynvueAI - AI-Powered Interview Practice Platform',
    template: '%s | SynvueAI'
  },
  description:
    "SynvueAI is an all-in-one platform that uses AI to help you ace your job search. Practice interviews with an AI coach, check your resume's ATS score, and get job-ready faster.",
  keywords: [
    'Interview',
    'Mock Interview',
    'ATS Checker',
    'Resume Score',
    'Practice Interview',
    'Interview Practice Platform',
    'AI Resume Analyzer',
    'Job Interview Preparation',
    'AI Interview Coach'
  ],
  metadataBase: new URL('https://synvue-ai.vercel.app'),
  alternates: {
    canonical: 'https://synvue-ai.vercel.app'
  },
  openGraph: {
    title: 'SynvueAI - AI-Powered Interview Practice Platform',
    description:
      "SynvueAI helps you ace your job search with AI-powered mock interviews, ATS resume scoring, and smart coaching.",
    url: 'https://synvue-ai.vercel.app',
    siteName: 'SynvueAI',
    images: [
      {
        url: 'https://synvue-ai.vercel.app/IntervueLogo.png',
        width: 1200,
        height: 630,
        alt: 'SynvueAI Platform Preview'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SynvueAI - AI-Powered Interview Practice',
    description:
      "Ace your next interview with SynvueAI's AI-powered practice tools and resume scoring.",
    images: ['https://synvue-ai.vercel.app/IntervueLogo.png'],
    creator: '@Nishchal_Sundan'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  authors: [{ name: 'Nishchal Sundan', url: 'https://www.linkedin.com/in/nishchal-sundan/' }],
  creator: 'SynvueAI',
  publisher: 'SynvueAI'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SynvueAI',
              url: 'https://synvue-ai.vercel.app',
              logo: 'https://synvue-ai.vercel.app/images/logo.png',
              sameAs: [
                'https://x.com/Nishchal_Sundan',
                'https://www.linkedin.com/in/nishchal-sundan/',
                'https://www.instagram.com/nishchal_sundan20_04/'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'synvueai@gmail.com',
                contactType: 'customer support',
                availableLanguage: ['English']
              }
            })
          }}
        />
        {/* JSON-LD: Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SynvueAI',
              url: 'https://synvue-ai.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://synvue-ai.vercel.app/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <DataProvider>
            <Navbar />
            {children}
          </DataProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
