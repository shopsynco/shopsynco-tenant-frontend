import { X } from "lucide-react";
import CreditCardImage from "../../../../assets/creaditCard.png"; // Replace with correct path
import BankImage from "../../../../assets/bankTransfer.png"; // Replace with correct path
import UpiImage from "../../../../assets/upiPayment.png"; // Replace with correct path

export default function AddPaymentMethodModal({ onClose, onPaymentMethodSelect }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] sm:w-[600px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Add Payment Method
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Credit/Debit Card Button */}
          <button
            onClick={() => onPaymentMethodSelect("addCard")}
            className="flex flex-col items-center justify-center gap-3 border-2 border-[#6A3CB1] text-[#6A3CB1] rounded-lg p-4 hover:border-[#5b32a2] transition"
          >
            <img src={CreditCardImage} alt="Credit Card" className="w-16 h-16" />
            <span>Credit/Debit Card</span>
          </button>

          {/* Bank Transfer Button */}
          <button
            onClick={() => onPaymentMethodSelect("addBank")}
            className="flex flex-col items-center justify-center gap-3 border-2 border-[#6A3CB1] text-[#6A3CB1] rounded-lg p-4 hover:border-[#5b32a2] transition"
          >
            <img src={BankImage} alt="Bank Transfer" className="w-16 h-16" />
            <span>Bank Transfer</span>
          </button>

          {/* UPI Payment Button */}
          <button
            onClick={() => onPaymentMethodSelect("addUpi")}
            className="flex flex-col items-center justify-center gap-3 border-2 border-[#6A3CB1] text-[#6A3CB1] rounded-lg p-4 hover:border-[#5b32a2] transition"
          >
            <img src={UpiImage} alt="UPI Payment" className="w-16 h-16" />
            <span>UPI Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
