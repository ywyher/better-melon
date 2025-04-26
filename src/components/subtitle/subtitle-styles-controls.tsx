'use client'

import { subtitleStylesSchema } from "@/app/settings/subtitle/types"
import { ColorInput } from "@/components/form/color-input"
import { SelectInput } from "@/components/form/select-input" // The new component we just created
import LoadingButton from "@/components/loading-button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useIsSmall } from "@/hooks/use-media-query"
import { FieldErrors, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FormField } from "@/components/form/form-field"
import { SliderInput } from "@/components/form/slider-input"
import { useEffect } from "react"
import { textShadowTypes, fontFamilies } from "@/app/settings/subtitle/_subtitle-styles/constants"

export default function SubtitleStylesControls({ form, onSubmit, isLoading, method }: { 
    form: UseFormReturn<z.infer<typeof subtitleStylesSchema>, any, undefined>;
    onSubmit: (data: z.infer<typeof subtitleStylesSchema>) => void;
    isLoading: boolean;
    method: 'watch' | 'submit'
}) {
    const isSmall = useIsSmall()

    const fontFamilyOptions = fontFamilies.map(family => ({ value: family, label: family }));
    const textShadowOptions = textShadowTypes.map(type => ({ 
        value: type, 
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
    }));

    const onError = (errors: FieldErrors<z.infer<typeof subtitleStylesSchema>>) => {

        const position = isSmall ? "top-center" : "bottom-right"
        const firstError = Object.values(errors)[0];
    
        if (firstError && 'message' in firstError && typeof firstError.message === 'string') {
            toast.error(firstError.message, { position });
        }
    }

    useEffect(() => {
        if (method !== 'watch') return;
        let timeout: NodeJS.Timeout;
        
        const subscription = form.watch(() => {
            if (timeout) clearTimeout(timeout);
            
            timeout = setTimeout(() => {
                form.trigger().then(isValid => {
                    if (isValid) {
                        const validData = form.getValues();
                        onSubmit(validData as z.infer<typeof subtitleStylesSchema>);
                    } else {
                        // timeout for the erros to have time to load
                        setTimeout(() => {
                            const errors = form.formState.errors;
                            if (Object.keys(errors).length > 0) {
                                onError(errors);
                            }
                        }, 100)
                    }
                });
            }, 300);
        });
        
        return () => {
            subscription.unsubscribe();
            if (timeout) clearTimeout(timeout);
        };
    }, [form, method, onSubmit, onError]);
    
    return (
        <Form {...form}>
            <form 
                className="flex flex-col"
                onSubmit={form.handleSubmit(onSubmit, onError)}
            >
                <Card className="w-full border-none pt-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="m-0 p-0"></CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 p-0">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-1 rounded-full"></div>
                                <h3 className="text-lg font-medium">Font Styles</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        form={form}
                                        name="fontSize"
                                        label="Size"
                                    >
                                        <SliderInput
                                            min={0}
                                            max={90}
                                            step={1}
                                            showValue={true}
                                            unit='px'
                                            className="w-full"
                                        />
                                    </FormField>
                                    <FormField
                                        form={form}
                                        name="fontFamily"
                                        label="Font Family"
                                    >
                                        <SelectInput 
                                            options={fontFamilyOptions} 
                                            placeholder="Select font"
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-2" />
                        
                        {/* Text Appearance Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-1 rounded-full"></div>
                                <h3 className="text-lg font-medium">Text Appearance</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        form={form}
                                        name="textColor"
                                        label="Text Color"
                                    >
                                        <ColorInput />
                                    </FormField>
                                    
                                    <FormField
                                        form={form}
                                        name="textShadow"
                                        label="Text Shadow"
                                    >
                                        <SelectInput 
                                            options={textShadowOptions}
                                            placeholder="Select shadow style"
                                        />
                                    </FormField>
                                </div>
                                
                                <FormField
                                    form={form}
                                    name="textOpacity" 
                                    label="Text Opacity"
                                >
                                    <SliderInput
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        showValue={true}
                                        unit="percentage"
                                        className="w-full"
                                    />
                                </FormField>
                            </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        {/* Background Style Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-1 rounded-full"></div>
                                <h3 className="text-lg font-medium">Background Style</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        form={form}
                                        name="backgroundColor"
                                        label="Background Color"
                                    >
                                        <ColorInput />
                                    </FormField>
                                    
                                    <FormField
                                        form={form}
                                        name="backgroundOpacity"
                                        label='Background Opacity'
                                    >
                                        <SliderInput
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            showValue={true}
                                            unit='percentage'
                                            className="w-full"
                                        />
                                    </FormField>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        form={form}
                                        name="backgroundBlur"
                                        label='Blur Effect'
                                    >
                                        <SliderInput
                                            min={0}
                                            max={30}
                                            showValue={true}
                                            unit='px'
                                            step={1}
                                            className="w-full"
                                        />
                                    </FormField>
                                    
                                    <FormField
                                        form={form}
                                        name="backgroundRadius"
                                        label='Corner Radius'
                                    >
                                        <SliderInput
                                            min={0}
                                            max={30}
                                            step={1}
                                            showValue={true}
                                            unit='px'
                                            className="w-full"
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    
                    {method == 'submit' && (
                        <CardFooter className="p-0 mt-4">
                            <LoadingButton 
                                isLoading={isLoading} 
                                className="p-0"
                                type="submit"
                                onClick={form.handleSubmit(onSubmit, onError)}
                            >
                                Apply Styles
                            </LoadingButton>
                        </CardFooter>
                    )}
                </Card>
            </form>
        </Form>
    )
}