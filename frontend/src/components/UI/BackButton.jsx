import React from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/back.png";

export default function BackButton({ to, title = "Punto Marisco", showEditIcon = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-orange-500 px-2 py-3 flex items-center justify-between w-full min-h-[60px]">
      <div className="flex items-center justify-start w-16">
        <button
          onClick={handleBack}
          className="hover:opacity-80 transition-opacity flex items-center justify-center p-2"
        >
          <img 
            src={backIcon} 
            alt="Volver" 
            className="w-8 h-8 filter brightness-0 invert"
          />
        </button>
      </div>
      
      <div className="flex-1 flex justify-center items-center">
        <h1 className="text-3xl font-bold text-center">
          <span className="text-black">Punto</span>{" "}
          <span className="text-white">Marisco</span>
        </h1>
      </div>
      
      <div className="flex items-center justify-end w-16">
        {showEditIcon && (
          <div className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
