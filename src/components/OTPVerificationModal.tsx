import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone } from "lucide-react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  orderId: string;
  phoneNumber: string;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  orderId,
  phoneNumber,
}) => {
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const maxAttempts = 3;
  const resendCooldown = 60;

  // Start countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (isOpen && orderId && phoneNumber) {
      sendOTP();
    }
  }, [isOpen, orderId, phoneNumber]);

  const sendOTP = async () => {
    if (isResending) return;
    
    try {
      setIsResending(true);
      
      // Call RPC to create OTP
      const { data, error } = await supabase.rpc('create_order_otp', {
        p_order_id: orderId,
        p_phone_number: phoneNumber
      });

      if (error) throw error;

      // Send OTP via email edge function
      const { error: emailError } = await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'otp_verification',
          phone: phoneNumber,
          orderId: orderId,
          otpCode: data[0]?.otp_code,
          expiresAt: data[0]?.expires_at
        }
      });

      if (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}. Please check your messages.`,
      });

      setCountdown(resendCooldown);
      
    } catch (error) {
      console.error('OTP send error:', error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: "Please try again or contact support.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a complete 6-digit verification code.",
      });
      return;
    }

    if (attempts >= maxAttempts) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
      return;
    }

    try {
      setIsVerifying(true);
      
      const { data: isValid, error } = await supabase.rpc('verify_order_otp', {
        p_order_id: orderId,
        p_otp_code: otpValue
      });

      if (error) throw error;

      if (isValid) {
        // Send confirmation email
        await supabase.functions.invoke('send-order-email', {
          body: {
            type: 'verification_success',
            phone: phoneNumber,
            orderId: orderId
          }
        });

        toast({
          title: "Phone Verified",
          description: "Your phone number has been successfully verified!",
        });
        
        onVerified();
        onClose();
      } else {
        setAttempts(prev => prev + 1);
        setOtpValue("");
        
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: `Incorrect verification code. ${maxAttempts - attempts - 1} attempts remaining.`,
        });
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Unable to verify code. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setOtpValue("");
    setAttempts(0);
    sendOTP();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit verification code to <strong>{phoneNumber}</strong> to prevent fake orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={otpValue}
              onChange={setOtpValue}
              maxLength={6}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {attempts > 0 && (
              <p className="text-destructive mb-2">
                {maxAttempts - attempts} attempts remaining
              </p>
            )}
            
            <p>
              Didn't receive the code?{" "}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              )}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={verifyOTP}
              disabled={isVerifying || otpValue.length !== 6 || attempts >= maxAttempts}
              className="w-full"
            >
              {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Place Order
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};