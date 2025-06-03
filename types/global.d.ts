   // types/global.d.ts
   export {};

   declare global {
     interface Window {
       Clerk?: {
         openUserProfile: () => void;
         // Puedes agregar más métodos si los usas
       };
     }
   }
