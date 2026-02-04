import { ProfileForm } from "@/components/settings/profile-form";

export default function ProfileSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>
      <ProfileForm />
    </div>
  );
}
