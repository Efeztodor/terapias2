import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Social = { url: string; label: string };
type Settings = {
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappTooltip?: string;
  social?: { instagram: Social; facebook: Social; youtube: Social; tiktok: Social };
};

const defaultSocial = (): Settings["social"] => ({
  instagram: { url: "https://instagram.com/paola.cyc", label: "Instagram" },
  facebook: { url: "https://www.facebook.com/share/18M4oaggvG/?mibextid=wwXIfr", label: "Facebook" },
  youtube: { url: "https://youtube.com/@pao.terapeuta", label: "YouTube" },
  tiktok: { url: "https://www.tiktok.com/@paola.terapeuta.cyc", label: "TikTok" },
});

const Admin = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/api/settings"),
  });

  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [tooltip, setTooltip] = useState("");
  const [social, setSocial] = useState<Settings["social"]>(defaultSocial);

  useEffect(() => {
    if (data) {
      setNumber(data.whatsappNumber ?? "");
      setMessage(data.whatsappMessage ?? "");
      setTooltip(data.whatsappTooltip ?? "");
      setSocial(data.social ?? defaultSocial());
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: Record<string, string>) => api.patch<Settings>("/api/settings", body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings"], updated);
      setNumber(updated.whatsappNumber ?? "");
      setMessage(updated.whatsappMessage ?? "");
      setTooltip(updated.whatsappTooltip ?? "");
      setSocial(updated.social ?? defaultSocial());
      toast.success("Configuración guardada");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al guardar");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      whatsappNumber: number,
      whatsappMessage: message,
      whatsappTooltip: tooltip,
      socialInstagramUrl: social?.instagram.url ?? "",
      socialInstagramLabel: social?.instagram.label ?? "",
      socialFacebookUrl: social?.facebook.url ?? "",
      socialFacebookLabel: social?.facebook.label ?? "",
      socialYoutubeUrl: social?.youtube.url ?? "",
      socialYoutubeLabel: social?.youtube.label ?? "",
      socialTiktokUrl: social?.tiktok.url ?? "",
      socialTiktokLabel: social?.tiktok.label ?? "",
    });
  };

  const updateSocial = (key: keyof NonNullable<Settings["social"]>, field: "url" | "label", value: string) => {
    setSocial((prev) => {
      const s = prev ?? defaultSocial();
      return { ...s, [key]: { ...s[key], [field]: value } };
    });
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
          WhatsApp flotante y enlaces de redes sociales (sección Contacto).
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-medium">WhatsApp</h2>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">Número</Label>
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
              <div className="space-y-2">
                <Label htmlFor="whatsapp-tooltip">Texto del tooltip (al pasar el mouse)</Label>
                <Input
                  id="whatsapp-tooltip"
                  type="text"
                  placeholder="💬 ¡Hablemos, con gusto te oriento!"
                  value={tooltip}
                  onChange={(e) => setTooltip(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-medium">Redes sociales</h2>
              {(["instagram", "facebook", "youtube", "tiktok"] as const).map((key) => (
                <div key={key} className="rounded-lg border border-border/50 p-4 space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Input
                    type="url"
                    placeholder="URL"
                    value={social?.[key]?.url ?? ""}
                    onChange={(e) => updateSocial(key, "url", e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder="Texto visible (ej. Instagram)"
                    value={social?.[key]?.label ?? ""}
                    onChange={(e) => updateSocial(key, "label", e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
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
