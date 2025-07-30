import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccordionSkeleton() {
    return (
        <Accordion className="w-full flex-1" type="single" collapsible>
            <AccordionItem value="1">
            <AccordionTrigger className="cursor-pointer" disabled>
                <Skeleton className="h-6 w-20" />
            </AccordionTrigger>
            <AccordionContent>
            </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}