"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon as ReloadIcon, PlusCircleIcon } from "lucide-react"
import { RechargeDialog } from "@/components/recharge-dialog"

// Tipo para los usuarios
type User = {
  id: string
  name: string
  email: string
  saldo: number
  lastRecharge?: string
}

export function UserBalanceTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false)

  // Obtener usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const response = await fetch('/api/users');
      let data = await response.json();
      console.log("Usuarios crudos desde API:", data);

      if (!Array.isArray(data)) {
        // Si hay error, muestra un toast o un mensaje y no intentes mapear
        console.error("Error al obtener usuarios:", data.error || data);
        setUsers([]);
        setLoading(false);
        return;
      }

      data = data.map((user: any) => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        saldo: Number(user.saldo) || 0,
      }));
      console.log("Usuarios mapeados (saldo como número):", data);
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Función para recargar saldo usando la API
  const handleRecharge = async (userId: string, amount: number) => {
    setLoading(true);
    const response = await fetch(`/api/users/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (response.ok) {
      const res = await fetch('/api/users');
      let updatedUsers = await res.json();
      console.log("Usuarios después de recarga (crudos):", updatedUsers);
      updatedUsers = updatedUsers.map((user: any) => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        saldo: Number(user.saldo) || 0,
      }));
      console.log("Usuarios después de recarga (mapeados):", updatedUsers);
      setUsers(updatedUsers);
    }
    setLoading(false);
    setRechargeDialogOpen(false);
  };

  // Función para abrir el diálogo de recarga
  const openRechargeDialog = (user: User) => {
    console.log("Usuario seleccionado para recarga:", user);
    setSelectedUser({
      ...user,
      saldo: Number(user.saldo) || 0,
    });
    setRechargeDialogOpen(true);
  };

  // Función para refrescar la lista de usuarios
  const refreshUsers = async () => {
    setLoading(true);
    const response = await fetch('/api/users');
    let data = await response.json();
    data = data.map((user: any) => ({
      ...user,
      name: `${user.first_name} ${user.last_name}`,
      saldo: typeof user.saldo === "string" ? parseFloat(user.saldo) : Number(user.saldo) || 0,
    }));
    setUsers(data);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
        <Button variant="outline" onClick={refreshUsers} disabled={loading}>
          {loading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <ReloadIcon className="mr-2 h-4 w-4" />
              Actualizar
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Última Recarga</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <ReloadIcon className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2">Cargando usuarios...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No hay usuarios disponibles
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                console.log("Render saldo:", user.saldo, typeof user.saldo);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      ${Number(user.saldo).toFixed(2)}
                    </TableCell>
                    <TableCell>{user.lastRecharge || "No hay recargas"}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => openRechargeDialog(user)}>
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        Recargar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <RechargeDialog
          user={selectedUser}
          open={rechargeDialogOpen}
          onOpenChange={setRechargeDialogOpen}
          onRecharge={handleRecharge}
        />
      )}
    </div>
  )
}
