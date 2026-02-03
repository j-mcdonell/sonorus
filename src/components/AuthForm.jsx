import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Music2, Loader2, AlertCircle, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function AuthForm({ onSuccess, message = "Sign in to review albums and follow critics" }) {
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (action) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (action === 'signup') {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      if (action === 'signup') {
        toast.success('Account created! Please check your email to confirm.');
      } else {
        toast.success('Welcome back!');
        // Update the global auth state without reloading the page
        await checkUserAuth();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
          <Music2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Sonorus</h1>
        <p className="text-zinc-400">{message}</p>
      </div>

      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-950 border border-zinc-800 mb-6">
            <TabsTrigger value="signin" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-zinc-400">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  id="auth-email" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus:border-violet-500 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-white">Password</Label>
              <Input 
                id="auth-password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 focus:border-violet-500 text-white"
              />
            </div>

            <TabsContent value="signin" className="mt-4">
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-white" 
                onClick={() => handleAuth('signin')}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-white" 
                onClick={() => handleAuth('signup')}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
              <p className="text-xs text-center text-zinc-500 mt-4">
                By clicking Create Account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}