"use client";
import Sidebar from "../_component/Sidebar";
import { useRouter } from "next/navigation";
// Main App component that renders the services page
export default function App() {
    return <ServicesPage />;
  }
  const ServiceCard = ({ icon, title, description, ctaText, isComingSoon = false,link}) => {
    const router=useRouter();
    return (
      <div className={`relative rounded-2xl p-8 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl ${isComingSoon ? 'bg-white/50 shadow-md' : 'bg-white shadow-lg'}`}>
        {isComingSoon && (
          <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            COMING SOON
          </div>
        )}
        <div className={`mb-6 inline-block rounded-xl p-4 ${isComingSoon ? 'bg-gray-300 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 min-h-[72px]">{description}</p>
        <button
          disabled={isComingSoon}
          onClick={()=>{
            if (!isComingSoon) router.push(link);
          }}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${isComingSoon ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300'}`}
        >
          {ctaText}
        </button>
      </div>
    );
  };
  
  // The main page component for showcasing services
  const ServicesPage = () => {
    const services = [
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M13 8H7"></path><path d="M17 12H7"></path>
          </svg>
        ),
        title: 'AI Mock Interviewer',
        description: 'Sharpen your interview skills with our intelligent AI. Receive instant, personalized feedback to boost your confidence and land your dream job.',
        ctaText: 'Start Practicing',
        link:'/CreateInterView',
        isComingSoon: false,
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path>
          </svg>
        ),
        title: 'ATS Resume Checker',
        description: 'Optimize your resume to get past automated screening systems. Our checker analyzes your resume against job descriptions to increase your chances.',
        ctaText: 'Check Your Resume',
        link:'/Insight',
        isComingSoon: false,
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.5c0-3.87-3.13-7-7-7h-6c-3.87 0-7 3.13-7 7"></path>
              <path d="M2 11.5v1c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-1"></path>
              <path d="M8 16.5v-5"></path><path d="M16 16.5v-5"></path>
          </svg>
        ),
        title: 'BridgeTalk AI',
        description: 'The future of integrated conversation. Seamlessly connect and communicate across all your favorite platforms with our unified AI solution.',
        ctaText: 'Launching Soon',
        link:'/',
        isComingSoon: true,
      },
    ];
  
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar/>
        <div className=" md:ml-64 min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans text-gray-800">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              Unlock Your <span className="text-indigo-600">Career Potential</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              We provide cutting-edge AI tools designed to give you a competitive edge in your professional journey.
            </p>
          </header>
  
          {/* Services Grid */}
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </main>
        </div>
      </div>
      </div>
    );
  };
  