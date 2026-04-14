import HeaderBar from "@/components/HeaderBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import Button from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/auth.hooks";
import { useUpdateProfile } from "@/features/profile/services";
import { genderToString } from "@/features/profile/types/Auth";
import { emailSchema } from "@/features/profile/schemas";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";


export default function FormEmail() {
    const navigate = useNavigate();
    const { navigateToAccount } = useOutletNavigation();
    const { user } = useAuth();
    const updateProfileMutation = useUpdateProfile();

    const form = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (data: z.infer<typeof emailSchema>) => {


        // Check if user data is available
        if (!user?.customer_profile) {
            console.error("User data not available");
            return;
        }

        // Prepare full profile data with updated email
        const profileData = {
            name: user.name,
            email: data.email,
            date_birth: user.customer_profile.date_birth || "",
            gender: genderToString(user.customer_profile.gender ?? null),
            job: user.customer_profile.job || "",
            phone: user.phone || "",
        };

        // Call update profile API
        updateProfileMutation.mutate(profileData, {
            onSuccess: () => {

                navigate("/account", { replace: true });
            },
            onError: (error: any) => {
                console.error("Update email failed:", error);
                console.error("Error response:", error.response?.data);
                console.error("Error status:", error.response?.status);
            },
        });
    };

    return (
        <ScreenWrapper>
            <HeaderBar
                title="Email"
                showBack
                onBack={() => navigateToAccount()}
            />
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 px-4 pt-8">
                    <p className="text-base font-rubik text-body-grey">
                        Email Anda Saat Ini
                    </p>
                    <h1 className="text-lg font-rubik text-title-black font-medium">
                        {user ? user.name : "Loading..."}
                    </h1>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="px-4 text-base font-medium font-rubik text-title-black">
                        Email Baru <span className="text-dark-red">*</span>{" "}
                    </p>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-[440px] px-4"
                        >
                            <div className="flex flex-col gap-4">
                                {/* Nomor WhatsApp */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    className="text-primary-orange"
                                                    placeholder="Contoh: email@example.com"
                                                    {...field}
                                                />
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
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </ScreenWrapper>
    );
}
