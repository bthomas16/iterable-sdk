import { useEffect, useState } from 'react';
import {initializeWithConfig, updateUser} from '@iterable/web-sdk';

export default function App() {

  // I was thinking we would place the signed sdk object into a variable for use in the handleUpdateUser function
  const [iterable, setIterable] = useState(null);

  useEffect(() => {
    const initIterable = async () => {
      const jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJyZW50dGhvbWFzLmNAZ21haWwuY29tIiwiaWF0IjoxNzQ1MjY4NTQ2LCJleHAiOjE3NDUyNzI0Mjh9._KGdpeLwrdIGSkBeA41DWqsB3gPY22l7YlRi5YTD8bI";
     
      try {
        const sdk = await initializeWithConfig({
          apiKey: "<PDF API KEY VALUE584...58e>",
          packageName: "sa-js-challenge",
          configOptions: {},
          generateJWT: () => new Promise((resolve) => resolve(jwt_token)),
        });

        console.log('SDK returned:', sdk);

        if (!sdk || typeof sdk.setEmail !== 'function') {
          throw new Error("Iterable SDK failed to initialize correctly.");
        }

        await sdk.setEmail("brentthomas.c@gmail.com");
        setIterable(sdk);
      } catch (error) {
        console.error("Iterable init failed:", error);
      }
    };

    initIterable();
  }, []);



  const handleUpdateUser = async () => {
    console.log("Updating user profile...", iterable);
    if (iterable) {
      await updateUser({
        firstName: "Brent",
        isWebUser: true,
        SA_WebUser_Test_Key: "completed",
      });
      alert("User profile updated!");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Iterable SDK Demo (React)</h1>
      <button
        onClick={handleUpdateUser}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Update User Profile
      </button>
    </div>
  );
}
