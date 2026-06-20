//the function of this component is to manage user seesion, handle sign-in sign out requests, track user's status

import React, {createContext,useState,useEffect,useContext} from 'react';
import { supabase } from '../../services/supabaseClient';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const[user,setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    const continueAsGuest = () => {
        setIsGuest(true);
      };

    useEffect(() => {
        const checkSessionAndListen = async () => {
          // 1. Check for an active session right now
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setUser(session.user); // If a session exists, save the user info!
          }
      
          // 2. Setup the listener to catch any future logins/logouts automatically
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              setUser(session.user);
            } else {
              setUser(null);
            }
            setLoading(false); // Stop showing any loading spinners once we know the state
          });
      
          // If we didn't find an initial session, turn off loading right away
          if (!session) {
            setLoading(false);
          }
      
          // Clean up the listener when the component unmounts
          return () => {
            subscription.unsubscribe();
          };
        };
      
        checkSessionAndListen();
      }, []);

      const login = async (email:any, password:any) => {
        try{
            const{data,error} = await supabase.auth.signInWithPassword({
                email:email,
                password:password,
            });
            if (error) throw error;
            return { success: true, data };
        } catch (error:any){
            console.error("Login error:", error.message);
            return { success: false, error: error.message };
        }
      };
    
      const logout = async () => {
        try {
          const { error } = await supabase.auth.signOut();
          setIsGuest(false);
          if (error) throw error;
        } catch (error: any) {
          console.error("Logout error:", error.message);
        }
      };
    return(
        <AuthContext.Provider value={{ user, loading, login, logout, isGuest, continueAsGuest  }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);