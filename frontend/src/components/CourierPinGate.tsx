import { useState, useRef, useEffect } from 'react';
import { Lock, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface CourierPinGateProps {
  onAccessGranted: (pin: string) => boolean;
}

export function CourierPinGate({ onAccessGranted }: CourierPinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown-app';
  const appId = encodeURIComponent(hostname);

  const handleSubmit = () => {
    const success = onAccessGranted(pin);
    if (!success) {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 600);
    }
  };

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const handlePinChange = (value: string) => {
    setError(false);
    setPin(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src="/assets/generated/courier-icon.dim_128x128.png"
                  alt="Courier"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-800 text-xl text-foreground tracking-tight">
                The Deccan <span className="text-primary">BHOJAN</span>{' '}
                <span className="text-muted-foreground font-normal text-base">Courier</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main PIN entry */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-card">
              <Truck className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-800 text-foreground mb-2">
              Courier Access
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your 4-digit PIN to access the courier dashboard.
            </p>
          </div>

          {/* PIN Input */}
          <div
            className={`flex flex-col items-center gap-6 ${shake ? 'animate-shake' : ''}`}
          >
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              inputMode="numeric"
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot
                  index={0}
                  className={`w-14 h-14 text-xl rounded-xl border-2 ${
                    error
                      ? 'border-destructive text-destructive'
                      : 'border-border focus:border-primary'
                  }`}
                />
                <InputOTPSlot
                  index={1}
                  className={`w-14 h-14 text-xl rounded-xl border-2 ${
                    error
                      ? 'border-destructive text-destructive'
                      : 'border-border focus:border-primary'
                  }`}
                />
                <InputOTPSlot
                  index={2}
                  className={`w-14 h-14 text-xl rounded-xl border-2 ${
                    error
                      ? 'border-destructive text-destructive'
                      : 'border-border focus:border-primary'
                  }`}
                />
                <InputOTPSlot
                  index={3}
                  className={`w-14 h-14 text-xl rounded-xl border-2 ${
                    error
                      ? 'border-destructive text-destructive'
                      : 'border-border focus:border-primary'
                  }`}
                />
              </InputOTPGroup>
            </InputOTP>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Incorrect PIN. Please try again.</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              ref={submitRef}
              size="lg"
              onClick={handleSubmit}
              disabled={pin.length < 4}
              className="w-full gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock Dashboard
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-foreground">
                The Deccan <span className="text-primary">BHOJAN</span>
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
