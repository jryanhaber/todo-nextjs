// app/connect/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { generateSyncCode } from '@/lib/auth-client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function ConnectPage() {
  return (
    <div className="connect-page">
      <h1>Connect Chrome Extension</h1>

      <div className="connect-content">
        <p>Chrome extension sync is currently disabled for testing.</p>
        <p>You can still export data from Settings and import it into the extension.</p>

        <div className="action-buttons">
          <Link href="/dashboard" className="button">
            Go to Dashboard
          </Link>
          <Link href="/settings" className="button">
            Go to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

// export default function ConnectPage() {
//   const { user } = useAuth();
//   const [syncCode, setSyncCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [timeLeft, setTimeLeft] = useState(0);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (timeLeft > 0) {
//       timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//     }

//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [timeLeft]);

//   const handleGenerateCode = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const code = await generateSyncCode();
//       setSyncCode(code);
//       setTimeLeft(15 * 60); // 15 minutes in seconds
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Failed to generate sync code');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="connect-page">
//       <h1>Connect Chrome Extension</h1>

//       <div className="connect-instructions">
//         <h2>How to Connect Your Chrome Extension</h2>

//         <ol>
//           <li>Generate a sync code below</li>
//           <li>Open your Chrome extension</li>
//           <li>Click on the settings icon</li>
//           <li>Select "Connect to Web App"</li>
//           <li>Enter the sync code provided below</li>
//           <li>Click "Connect"</li>
//         </ol>

//         <div className="sync-code-container">
//           {error && <div className="error-message">{error}</div>}

//           {syncCode ? (
//             <>
//               <h3>Your Sync Code:</h3>
//               <div className="sync-code">{syncCode}</div>
//               <div className="expires-in">Expires in: {formatTime(timeLeft)}</div>
//               <button onClick={handleGenerateCode} disabled={loading} className="generate-btn">
//                 Generate New Code
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={handleGenerateCode}
//               disabled={loading}
//               className="generate-btn primary"
//             >
//               {loading ? 'Generating...' : 'Generate Sync Code'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
