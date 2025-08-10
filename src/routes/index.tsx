import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { useAuthStore } from "~/stores/authStore";
import { Users, Briefcase, MessageCircle, Shield, Star, CheckCircle, Award, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated()) {
    // Redirect authenticated users to the feed
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back to MedConnect!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Continue building your professional network and advancing your medical career.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/feed" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                View Your Feed
              </Link>
              <Link 
                to="/jobs" 
                className="bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/images/medical-team-bg.jpg"
          >
            <source src="/videos/healthcare-hero-bg.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
          </video>
          {/* Fallback background image */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/medical-team-bg.jpg)' }}
          ></div>
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        <div className="relative text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm border border-blue-100">
              <Award className="text-blue-600 mr-2" size={16} />
              <span className="text-sm font-medium text-blue-800">India's Largest Healthcare Professional Network</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Connect. Learn. Grow.
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent"> Together.</span>
            </h1>
            
            <p className="text-xl text-blue-50 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Join India's most trusted professional network for healthcare professionals. Connect with verified doctors, 
              nurses, and medical experts. Discover opportunities, share knowledge, and advance your career.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join MedConnect Today
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
              <Link
                to="/login"
                className="bg-white/90 text-gray-700 border border-white/50 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:border-white transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="text-green-400 mr-2" size={16} />
                <span>MCI Verified Professionals</span>
              </div>
              <div className="flex items-center">
                <Lock className="text-blue-400 mr-2" size={16} />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <Shield className="text-purple-400 mr-2" size={16} />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div 
          className="absolute inset-0 opacity-5 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hospital-corridor-bg.jpg)' }}
        ></div>
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Healthcare Professionals Across India</h2>
            <p className="text-lg text-gray-600">Join thousands of medical professionals advancing their careers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:scale-105 transition-transform duration-200">1.2L+</div>
              <div className="text-gray-600 font-medium">Healthcare Professionals</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2 group-hover:scale-105 transition-transform duration-200">25K+</div>
              <div className="text-gray-600 font-medium">Job Opportunities</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 group-hover:scale-105 transition-transform duration-200">500+</div>
              <div className="text-gray-600 font-medium">Healthcare Organizations</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 group-hover:scale-105 transition-transform duration-200">50+</div>
              <div className="text-gray-600 font-medium">Medical Specialties</div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Categories Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect with Your Medical Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join specialized groups and connect with professionals in your field across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-lg p-3 mr-4">
                  <Users className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Doctors & Physicians</h3>
                  <p className="text-sm text-gray-600">45K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Connect with MBBS, MD, MS professionals across all specialties</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nurses & Allied Health</h3>
                  <p className="text-sm text-gray-600">35K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Join nursing professionals, physiotherapists, and allied health workers</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-lg p-3 mr-4">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pharmacists</h3>
                  <p className="text-sm text-gray-600">18K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Network with D.Pharm, B.Pharm, and clinical pharmacists</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-lg p-3 mr-4">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Medical Students</h3>
                  <p className="text-sm text-gray-600">25K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Connect with MBBS, BDS, and other medical students</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                  <Users className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Healthcare Administrators</h3>
                  <p className="text-sm text-gray-600">12K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Join hospital administrators, healthcare managers, and executives</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 rounded-lg p-3 mr-4">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Medical Researchers</h3>
                  <p className="text-sm text-gray-600">8K+ members</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Connect with research scientists and clinical researchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="py-20 bg-white relative overflow-hidden">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 opacity-8 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/medical-equipment-bg.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-white/90"></div>
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Professional Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and resources designed specifically for Indian healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Briefcase className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Career Opportunities</h3>
              <p className="text-gray-600 text-center leading-relaxed">Discover exclusive job openings from AIIMS, Apollo, Fortis, and other top healthcare institutions across India.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">CME & Certifications</h3>
              <p className="text-gray-600 text-center leading-relaxed">Access continuing medical education programs, online courses, and professional certifications recognized by MCI.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <MessageCircle className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Medical Communities</h3>
              <p className="text-gray-600 text-center leading-relaxed">Join specialty-specific groups, participate in case discussions, and collaborate with peers in your field.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Users className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Professional Network</h3>
              <p className="text-gray-600 text-center leading-relaxed">Build meaningful connections with verified healthcare professionals across India and expand your referral network.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Star className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Medical Conferences</h3>
              <p className="text-gray-600 text-center leading-relaxed">Stay updated on upcoming medical conferences, symposiums, and workshops happening across India.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Shield className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Industry Insights</h3>
              <p className="text-gray-600 text-center leading-relaxed">Access latest healthcare news, research publications, policy updates, and industry trends in Indian healthcare.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Categories Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Next Career Opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore job opportunities across India's leading healthcare institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600 mb-2">5,200+</div>
              <div className="text-gray-600 font-medium mb-1">Doctor Positions</div>
              <div className="text-sm text-gray-500">All specialties</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-2xl font-bold text-green-600 mb-2">3,800+</div>
              <div className="text-gray-600 font-medium mb-1">Nursing Jobs</div>
              <div className="text-sm text-gray-500">All levels</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-2xl font-bold text-purple-600 mb-2">1,500+</div>
              <div className="text-gray-600 font-medium mb-1">Pharmacy Roles</div>
              <div className="text-sm text-gray-500">Clinical & Retail</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600 mb-2">900+</div>
              <div className="text-gray-600 font-medium mb-1">Admin Positions</div>
              <div className="text-sm text-gray-500">Management roles</div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/jobs"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Briefcase className="mr-2" size={20} />
              Explore All Job Opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600">See what medical professionals are saying about MedConnect</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <blockquote className="text-gray-900 mb-6 leading-relaxed">
                "MedConnect helped me connect with senior cardiologists across India. The networking opportunities are incredible."
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                  DR
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Dr. Rajesh Kumar</div>
                  <div className="text-gray-600 text-sm">Cardiologist, AIIMS Delhi</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <blockquote className="text-gray-900 mb-6 leading-relaxed">
                "Found my dream job at Apollo Hospital through MedConnect. The platform is specifically designed for healthcare professionals."
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                  PR
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Priya Sharma</div>
                  <div className="text-gray-600 text-sm">Senior Nurse, Apollo Hospital</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <blockquote className="text-gray-900 mb-6 leading-relaxed">
                "The CME courses and professional development resources have been invaluable for my career growth."
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                  AM
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Dr. Amit Mehta</div>
                  <div className="text-gray-600 text-sm">Orthopedic Surgeon, Mumbai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Network Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect Locally, Network Nationally
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join regional healthcare communities and connect with professionals in your city
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-blue-600 mb-1">Mumbai</div>
              <div className="text-sm text-gray-600">18K+ professionals</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-green-600 mb-1">Delhi</div>
              <div className="text-sm text-gray-600">22K+ professionals</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-purple-600 mb-1">Bangalore</div>
              <div className="text-sm text-gray-600">15K+ professionals</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-indigo-600 mb-1">Chennai</div>
              <div className="text-sm text-gray-600">12K+ professionals</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-orange-600 mb-1">Kolkata</div>
              <div className="text-sm text-gray-600">9K+ professionals</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-lg font-bold text-red-600 mb-1">Hyderabad</div>
              <div className="text-sm text-gray-600">8K+ professionals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Advance Your Medical Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join India's largest network of healthcare professionals. Connect, learn, and grow with verified medical experts across the country.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Join Free Today
            </Link>
            <Link
              to="/jobs"
              className="inline-block bg-blue-700 text-white border border-blue-500 px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Job Opportunities
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
