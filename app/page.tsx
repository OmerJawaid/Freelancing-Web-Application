import { redirect } from 'next/navigation';

export default function Home() {
  // This is a placeholder - in real implementation, you would check the user's role from your auth system
  const userRole = 'client'; // or 'freelancer'
  
  if (userRole === 'client') {
    redirect('/client-dashboard');
  } else {
    redirect('/freelancer-dashboard');
  }
} 