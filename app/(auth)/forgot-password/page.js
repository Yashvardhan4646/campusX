'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';
import ForgotStepIndicator from '@/components/auth/ForgotStepIndicator';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to send OTP');
      }

      toast.success('OTP sent successfully if email exists');
      // Navigate to verify page with email in query params
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" href="/login" />
          <p className="text-muted-foreground mt-2 text-sm">Recover your access to CampusX</p>
        </div>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <ForgotStepIndicator currentStep={1} />
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the email address associated with your account and we&apos;ll send you an OTP to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 h-11 bg-background/50"
                    required 
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full rounded-full h-11 text-sm font-bold transition-all" disabled={loading || !email}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <Link 
                href="/login" 
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
