import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList, BarChart3, Wrench, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-white text-4xl">✈</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
                בלובירד טכגארד
              </h1>
              <p className="text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                מערכת מתקדמת לניהול תקלות טכניות במטוסים
              </p>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link to="/FaultBoard">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-7 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 gap-3 group">
                  כניסה לבורד תקלות
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/FaultBoard" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">בורד תקלות</h3>
            <p className="text-gray-600 leading-relaxed">רישום ומעקב אחר תקלות במטוסים</p>
          </Link>

          <Link to="/DeliveryCertificate" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">תעודת מסירה</h3>
            <p className="text-gray-600 leading-relaxed">Delivery Certificate</p>
          </Link>

          <Link to="/InstalledComponents" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">רכיבים מותקנים</h3>
            <p className="text-gray-600 leading-relaxed">Installed Components</p>
          </Link>

          <Link to="/SpecialPermits" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">היתרים מיוחדים</h3>
            <p className="text-gray-600 leading-relaxed">Special Permits</p>
          </Link>

          <Link to="/MaintenanceProcedures" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">תקלות ותחזוקה</h3>
            <p className="text-gray-600 leading-relaxed">Failures & Maintenance</p>
          </Link>

          <Link to="/Configuration" className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">תצורה</h3>
            <p className="text-gray-600 leading-relaxed">Configuration Tracking</p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 בלובירד טכגארד – מערכת ניהול תקלות טכניות במטוסים
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}