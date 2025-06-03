import { create } from 'zustand';

interface BalanceState {
  userSaldo: number;
  fetchUserSaldo: (userId: string | number | undefined, isSignedIn: boolean) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  userSaldo: 0,
  fetchUserSaldo: async (userId, isSignedIn) => {
    if (!isSignedIn || !userId) {
      console.log("No hay sesión activa");
      set({ userSaldo: 0 });
      return;
    }
    try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el saldo");
      }
      const data = await response.json();
      if (typeof data.saldo === 'number') {
        set({ userSaldo: data.saldo });
      } else {
        console.error("Formato de saldo inválido:", data);
        set({ userSaldo: 0 });
      }
    } catch (err) {
      console.error("Error al obtener el saldo:", err);
      set({ userSaldo: 0 });
    }
  },
})); 
