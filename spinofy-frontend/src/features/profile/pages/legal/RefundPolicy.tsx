import { HeaderBar, ScreenWrapper } from "@/components";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { refundPolicyData } from "@/features/profile/constants/dataRefundPolicyConstant";
import { motion } from "motion/react";
import { ShieldCheck, AlertCircle, RefreshCw, MessageCircle, FileText } from "lucide-react";

export default function RefundPolicy() {
    const { navigateToAccount } = useOutletNavigation();

    const getIcon = (id: number) => {
        switch (id) {
            case 1: return <RefreshCw className="w-5 h-5 text-blue-500" />;
            case 2: return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 3: return <ShieldCheck className="w-5 h-5 text-green-500" />;
            case 4: return <MessageCircle className="w-5 h-5 text-purple-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <ScreenWrapper>
            <HeaderBar title={refundPolicyData.title} showBack={true} onBack={navigateToAccount} />
            <div className="mt-6 px-4 pb-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-2xl font-bold text-title-black dark:text-white mb-2">
                        {refundPolicyData.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {refundPolicyData.subtitle}
                    </p>
                </motion.div>
                <div className="space-y-4">
                    {refundPolicyData.sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl shrink-0">
                                    {getIcon(section.id)}
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-title-black dark:text-white mb-1.5">
                                        {section.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {section.content}
                                    </p>
                                    {section.list && (
                                        <ul className="mt-3 space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 pl-1">
                                            {section.list.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {section.contacts && (
                                        <div className="mt-4 space-y-1">
                                            {section.contacts.map((contact, i) => (
                                                <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{contact.label}: </span>
                                                    {contact.link ? (
                                                        <a href={contact.link} target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline">
                                                            {contact.value}
                                                        </a>
                                                    ) : (
                                                        <span>{contact.value}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                        <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                        Kami berkomitmen untuk memberikan layanan terbaik. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.
                    </p>
                </motion.div>
            </div>
        </ScreenWrapper>
    );
}