import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getToken } from '../utils/auth';
import Login from './login';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/chat'); // already logged in
    }
  }, []);

  return (
    <Login/>
  );
}
