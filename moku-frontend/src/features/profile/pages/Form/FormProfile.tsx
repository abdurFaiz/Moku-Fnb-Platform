/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formSchema } from "@/features/profile/schemas";
import { useRegister, useUpdateProfile } from "@/features/profile/services";
import { useAuth } from "@/features/auth/hooks/auth.hooks";
import { genderToString } from "@/features/profile/types/Auth";
import HeaderBar from "@/components/HeaderBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { FormValues } from "@/features/profile/schemas/profile.schemas";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

export default function FormProfile() {
  const navigate = useNavigate();
  const { navigateToAccount, outletSlug } = useOutletNavigation();

  const { user, isAuthenticated } = useAuth();

  const registerMutation = useRegister();
  const updateProfileMutation = useUpdateProfile();

  // Determine if this is update mode (user is logged in with profile data)
  const isUpdateMode = isAuthenticated && user?.customer_profile;

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      date_birth: "",
      gender: "",
      job: "",
      avatar: undefined,
    },
  });

  // Populate form with existing data when in update mode
  useEffect(() => {
    if (isUpdateMode && user?.customer_profile) {
      const profile = user.customer_profile;
      const rawAvatarUrl = user.avatar_url || profile.avatar;

      // Fix the avatar URL if it's using localhost without port
      const avatarUrl = rawAvatarUrl
        ? rawAvatarUrl.replace('http://localhost/', 'http://localhost:8000/')
        : undefined;

      form.reset({
        name: user.name || "",
        phone: user.phone || "",
        date_birth: profile.date_birth || "",
        gender: genderToString(profile.gender ?? null),
        job: profile.job || "",
        avatar: avatarUrl,
      });

      // Set image preview if exists
      if (avatarUrl) {
        setImagePreview(avatarUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateMode, user?.id, user?.avatar_url]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }

      form.setValue('avatar', file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    // Check if redirecting back to checkout after profile completion
    const isRedirectingToCheckout = localStorage.getItem('redirectAfterProfileComplete') === 'checkout';

    if (isUpdateMode) {
      // Update existing profile
      updateProfileMutation.mutate(data, {
        onSuccess: () => {
          // Clear the redirect flag
          localStorage.removeItem('redirectAfterProfileComplete');

          // If coming from checkout, go back to checkout; otherwise go to account
          if (isRedirectingToCheckout) {
            navigate(`/${outletSlug}/checkout`, { replace: true });
          } else {
            navigate(`/${outletSlug}/account`, { replace: true });
            toast.success("Profil berhasil diperbarui.");
          }
        },
        onError: (error: any) => {
          console.error("Update profile failed:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
        },
      });
    } else {
      // Register new user
      registerMutation.mutate(data, {
        onSuccess: () => {
          // Clear the redirect flag
          localStorage.removeItem('redirectAfterProfileComplete');

          // After registration, go to checkout if flag was set, otherwise onboard
          if (isRedirectingToCheckout) {
            navigate(`/${outletSlug}/checkout`, { replace: true });
          } else {
            navigate(`/${outletSlug}/onboard`, { replace: true });
          }
        },
        onError: (error: any) => {
          console.error("Registration failed:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
        },
      });
    }
  };

  const isSubmitting = registerMutation.isPending || updateProfileMutation.isPending;

  // Button text based on mode and loading state
  const getButtonText = () => {
    if (isSubmitting) {
      return isUpdateMode ? "Menyimpan..." : "Mendaftar...";
    }
    return isUpdateMode ? "Simpan Perubahan" : "Daftar Sekarang";
  };

  return (
    <ScreenWrapper className="min-h-screen">
      <HeaderBar showBack onBack={() => navigateToAccount()}
        title={isUpdateMode ? "Ubah Data Diri" : "Lengkapi Data Diri"}
        subtitle="Pastikan semua datanya benar ya, biar nggak keliru."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 px-4 mt-6"
        >
          <div className="flex flex-col gap-4 min-h-[calc(100vh-200px)]">
            {/* Nama Lengkap */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="name">Nama Lengkap</FieldLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="text-primary-orange"
                      placeholder="Nama Lengkap*"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nomor WhatsApp */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="phone">Nomor WhatsApp</FieldLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className="text-primary-orange bg-gray-50"
                      placeholder="Nomor WhatsApp*"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Lahir */}
            <FormField
              control={form.control}
              name="date_birth"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="date_birth">Tanggal Lahir</FieldLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Tanggal Lahir"
                      className="text-primary-orange font-medium icon-calendar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Kelamin */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="gender">Gender</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-primary-orange">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pekerjaan */}
            <FormField
              control={form.control}
              name="job"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="job">Pekerjaan</FieldLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="text-primary-orange"
                      placeholder="Pekerjaan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foto Profil */}
            <FormField
              control={form.control}
              name="avatar"
              render={() => (
                <FormItem>
                  <FieldLabel className="text-body-grey" htmlFor="avatar">Foto Profil</FieldLabel>
                  <FormControl>
                    <div className="flex flex-col gap-3">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-primary-orange"
                      />
                      {imagePreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            variant="primary"
            size="xl"
            type="submit"
            className="w-full mb-8"
            disabled={isSubmitting}
          >
            {getButtonText()}
          </Button>
        </form>
      </Form>
    </ScreenWrapper>
  );
}