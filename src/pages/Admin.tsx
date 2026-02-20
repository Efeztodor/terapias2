import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = { whatsappNumber: string; whatsappMessage: string };

const Admin = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/api/settings"),
  });

  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data) {
      setNumber(data.whatsappNumber ?? "");
      setMessage(data.whatsappMessage ?? "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: Partial<Settings>) => api.patch<Settings>("/api/settings", body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings"], updated);
      setNumber(updated.whatsappNumber ?? "");
      setMessage(updated.whatsappMessage ?? "");
      toast.success("Configuración guardada");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al guardar");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ whatsappNumber: number, whatsappMessage: message });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-heading font-light mb-2">Administración</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Configuración del botón flotante de WhatsApp.
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
              <Input
                id="whatsapp-number"
                type="text"
                placeholder="56977929416"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Solo dígitos, con código de país (ej. 56 para Chile).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Mensaje por defecto</Label>
              <Input
                id="whatsapp-message"
                type="text"
                placeholder="Hola, quiero agendar una sesión"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;
