import React, { useState } from 'react';
import { UtensilsCrossed, Lock } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface CourierPinGateProps {
  onAccess: (pin: string) => boolean;
}

export default function CourierPinGate({ onAccess }: CourierPinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handlePinChange = (value: string) => {
    setPin(value);
    setError(false);

    if (value.length === 4) {
      const granted = onAccess(value);
      if (!granted) {
        setError(true);
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          setPin('');
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-orange">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-800">The Deccan BHOJAN</h1>
          <p className="text-gray-500 text-sm mt-1">Courier Dashboard</p>
        </div>

        {/* PIN card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-card p-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-orange-500" />
            <h2 className="font-display font-semibold text-lg text-gray-800">Enter PIN</h2>
          </div>
          <p className="text-center text-sm text-gray-500 mb-6">
            Enter your 4-digit PIN to access the dashboard
          </p>

          <div className={`flex justify-center ${shaking ? 'animate-shake' : ''}`}>
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className={error ? 'border-red-400 text-red-600' : 'border-orange-200 focus:border-orange-500'}
                />
                <InputOTPSlot
                  index={1}
                  className={error ? 'border-red-400 text-red-600' : 'border-orange-200 focus:border-orange-500'}
                />
                <InputOTPSlot
                  index={2}
                  className={error ? 'border-red-400 text-red-600' : 'border-orange-200 focus:border-orange-500'}
                />
                <InputOTPSlot
                  index={3}
                  className={error ? 'border-red-400 text-red-600' : 'border-orange-200 focus:border-orange-500'}
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500 mt-4 font-medium">
              Incorrect PIN. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
