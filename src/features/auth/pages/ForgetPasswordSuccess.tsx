import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import bgImage from '../../../assets/commonbackground.png';

const PasswordResetSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Success Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-[380px] p-10 text-center z-10 animate-fadeIn">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-green-100 p-5 rounded-full">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#466b9d]">
            Your password has been reset successfully!
          </h2>
          <button
            onClick={handleGoToLogin}
            className="bg-[#a2b8da] hover:bg-[#8ea9d0] text-white py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;