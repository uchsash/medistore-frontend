"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Mail, Shield, BadgeCheck } from "lucide-react";

import { profileService, type MyProfile } from "@/services/profile.service";
import { normalizeRole } from "@/lib/roles";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ProfileView() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState<MyProfile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await profileService.getMe();
      console.log(data);
      setMe(data);

      const anyData = data as unknown as {
        name?: string | null;
        phone?: string | null;
        image?: string | null;
        data?: {
          phone?: string | null;
          image?: string | null;
        } | null;
      };

      const nextName = anyData.name ?? "";
      const nextPhone = anyData.phone ?? anyData.data?.phone ?? "";
      const nextImage = anyData.image ?? anyData.data?.image ?? "";

      setName(nextName);
      setPhone(nextPhone);
      setImage(nextImage);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!me) return;

    const nextName = name.trim();
    if (!nextName) return toast.error("Name is required");

    setBusy(true);
    try {
      await profileService.updateMe({
        name: nextName,
        phone: phone.trim() ? phone.trim() : null,
        image: image.trim() ? image.trim() : null,
      });
      toast.success("Profile updated");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-2xl animate-pulse" />
        <div className="h-72 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!me) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Could not load profile. Please login again.
        </CardContent>
      </Card>
    );
  }

  const uiRole = normalizeRole(me.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your personal info. Role and status are managed by the system.
        </p>
      </div>

      <Separator />

      {/* Summary */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold">{me.name}</p>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {me.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined: {fmtDate(me.createdAt)} • Updated: {fmtDate(me.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full inline-flex items-center gap-2"
            >
              <Shield className="h-4 w-4" /> {uiRole.toUpperCase()}
            </Badge>
            <Badge
              className="rounded-full inline-flex items-center gap-2"
              variant={me.status === "BANNED" ? "destructive" : "default"}
            >
              <BadgeCheck className="h-4 w-4" /> {me.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Editable */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Edit profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Name</label>
              <Input
                className="rounded-xl mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Phone (optional)</label>
              <Input
                className="rounded-xl mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Photo URL (optional)</label>
              <Input
                className="rounded-xl mt-1"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="rounded-xl" onClick={handleSave} disabled={busy}>
              <Save className="mr-2 h-4 w-4" />
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Email, role and status cannot be changed from here. If needed, contact admin,
          </p>
        </CardContent>
      </Card>
    </div>
  );
}