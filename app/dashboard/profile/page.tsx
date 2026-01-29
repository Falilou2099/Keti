"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <p className="text-muted-foreground">
        Gérez vos informations personnelles et votre sécurité.
      </p>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Prénom</label>
            <Input placeholder="Nathan" />
          </div>

          <div>
            <label className="text-sm font-medium">Adresse e-mail</label>
            <Input type="email" placeholder="nathan@email.com" />
          </div>

          <Button className="mt-2">Enregistrer les modifications</Button>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mot de passe actuel</label>
            <Input type="password" />
          </div>

          <div>
            <label className="text-sm font-medium">Nouveau mot de passe</label>
            <Input type="password" />
          </div>

          <div>
            <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
            <Input type="password" />
          </div>

          <Button variant="outline">Changer le mot de passe</Button>
        </CardContent>
      </Card>
    </div>
  );
}
