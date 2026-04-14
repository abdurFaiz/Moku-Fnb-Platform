import { HeaderBar, ScreenWrapper } from "@/components";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqData } from "@/features/profile/constants/dataFAQConstant";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";

export default function FAQ() {
    const { navigateToAccount } = useOutletNavigation()
    return (
        <ScreenWrapper>
            <HeaderBar title="FAQ" onBack={navigateToAccount} showBack />
            <div className="mt-6 flex flex-col gap-4 min-h-screen px-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-title-black font-medium text-lg font-rubik">Frequently Asked Questions</h1>
                    <p className="text-base text-body-grey">Temukan jawaban seputar cara kerja, kemitraan, dan fitur utama Spinofy untuk membantu coffee shop Anda tumbuh.</p>
                </div>
                <Accordion type="single" collapsible className="flex flex-col gap-3">
                    {faqData.items.map((item) => (
                        <AccordionItem
                            value={item.id.toString()}
                            key={item.id}
                            className="border border-border rounded-xl bg-white shadow-xs transition-shadow hover:shadow-sm hover:transition-shadow duration-300 ease-in-out"
                        >
                            <AccordionTrigger className="px-4 text-base font-medium text-title-black active:text-primary-orange">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 text-sm text-body leading-relaxed text-body-grey">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </ScreenWrapper>
    )
}