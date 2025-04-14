'use client'

import { subtitleSettingsSchema } from "@/app/settings/subtitle/types"
import { NumberInput } from "@/components/form/number-input"
import { ColorInput } from "@/components/form/color-input"
import LoadingButton from "@/components/loading-button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useIsSmall } from "@/hooks/useMediaQuery"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { textShadowTypes } from "@/lib/constants"
import { createSubtitleSettings } from "@/app/settings/subtitle/actions"
import { Switch } from "@/components/ui/switch"

const fontFamilies = ["Arial", "Helvetica", "Verdana", "Tahoma", "Georgia", "Times New Roman", "Courier New", "Monaco", "Roboto", "Open Sans", "Noto Sans JP"];

type SubtitleSettingsSchema = z.infer<typeof subtitleSettingsSchema> 

export default function SubtitleSettingsForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const isSmall = useIsSmall()
    
    const form = useForm<SubtitleSettingsSchema>({
        resolver: zodResolver(subtitleSettingsSchema),
        defaultValues: {
            fontSize: 16,
            fontFamily: "Arial",
            textShadow: 'outline',
            textColor: "#FFFFFF",
            textOpacity: 1, 
            backgroundColor: "#000000", 
            backgroundOpacity: 0.5, 
            backgroundBlur: 2,
            backgroundRadius: 6,
        }
    })
    
    const onSubmit = async (data: SubtitleSettingsSchema) => {
        setIsLoading(true)
        try {
            const { error, message } = await createSubtitleSettings({ data })

            if(error) {
                toast.error(error)
                setIsLoading(false)
                return;
            }
            
            toast.success(message)
            setIsLoading(false)
        } catch (error) {
            toast.error("Failed to apply settings")
            setIsLoading(false)
        }
    }
    
    const onError = (errors: FieldErrors<SubtitleSettingsSchema>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        const firstError = Object.values(errors)[0];
    
        if (firstError && 'message' in firstError && typeof firstError.message === 'string') {
            toast.error(firstError.message, { position });
        }
    }
    
    return (
        <Form {...form}>
            <form 
                className="flex flex-col"
                onSubmit={form.handleSubmit(onSubmit, onError)}
            >
                <Card className="w-full border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Subtitle Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {/* Font Settings Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-1 bg-foreground rounded-full"></div>
                                <h3 className="text-lg font-medium">Font Settings</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <FormField
                                        control={form.control}
                                        name="fontSize"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <FormLabel className="text-sm font-medium">Size</FormLabel>
                                                    <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">{field.value}px</span>
                                                </div>
                                                <FormControl>
                                                    <NumberInput
                                                        className="w-full"
                                                        placeholder="Font size"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fontFamily"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="block mb-2 text-sm font-medium">Font Family</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="w-full cursor-pointer">
                                                            <SelectValue placeholder="Select font" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fontFamilies.map((family: string, idx: number) => (
                                                                <SelectItem key={idx} value={family}>
                                                                    {family}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="my-2" />
                        
                        {/* Text Appearance Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-1 bg-foreground rounded-full"></div>
                                <h3 className="text-lg font-medium">Text Appearance</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="textColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="block mb-2 text-sm font-medium">Text Color</FormLabel>
                                                <FormControl>
                                                    <ColorInput 
                                                        value={field.value} 
                                                        onChange={field.onChange} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="textShadow"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="block mb-2 text-sm font-medium">Text Shadow</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select shadow style" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {textShadowTypes.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <FormField
                                    control={form.control}
                                    name="textOpacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center mb-2">
                                                <FormLabel className="text-sm font-medium">Text Opacity</FormLabel>
                                                <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">{Math.round(field.value * 100)}%</span>
                                            </div>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={1}
                                                    step={0.05}
                                                    value={[field.value]}
                                                    onValueChange={(value) => field.onChange(value[0])}
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        {/* Background Style Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-1 bg-foreground rounded-full"></div>
                                <h3 className="text-lg font-medium">Background Style</h3>
                            </div>
                            <div className="pl-3 pr-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="backgroundColor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="block mb-2 text-sm font-medium">Background Color</FormLabel>
                                                <FormControl>
                                                    <ColorInput 
                                                        value={field.value} 
                                                        onChange={field.onChange} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="backgroundOpacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-2">
                                                    <FormLabel className="text-sm font-medium">Background Opacity</FormLabel>
                                                    <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">{Math.round(field.value * 100)}%</span>
                                                </div>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={1}
                                                        step={0.05}
                                                        value={[field.value]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="backgroundBlur"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-2">
                                                    <FormLabel className="text-sm font-medium">Blur Effect</FormLabel>
                                                    <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">{field.value}px</span>
                                                </div>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={30}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="backgroundRadius"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center mb-2">
                                                    <FormLabel className="text-sm font-medium">Corner Radius</FormLabel>
                                                    <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded-md">{field.value}px</span>
                                                </div>
                                                <FormControl>
                                                    <Slider
                                                        min={0}
                                                        max={30}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="isGlobal"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Is Global</FormLabel>
                                        <FormDescription>
                                            Use this preset by default when creating new cards
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            className="cursor-pointer"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            // disabled={isFirstPreset}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    
                    <CardFooter className="mt-4">
                        <LoadingButton 
                            isLoading={isLoading} 
                            className="px-8"
                            type="submit"
                        >
                            Apply Settings
                        </LoadingButton>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}