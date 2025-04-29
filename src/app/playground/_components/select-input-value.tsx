"use client"

import { useEffect } from "react";
import { animeListStatuses } from "@/components/add-to-list/constants";
import { anielistStatusEnum } from "@/components/add-to-list/types";
import { FormField } from "@/components/form/form-field";
import { SelectInput } from "@/components/form/select-input";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  status: z.enum([...anielistStatusEnum]).nullable(),
})

export default function SelectInputValue() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    // No defaultValues here, we'll use reset instead
  })

  useEffect(() => {

  }, [form]); // Include form in the dependency array

  // For debugging - log when values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return( 
    <Form {...form}>
      <form>
        <FormField
          form={form}
          name="status"
          showError={true} // Show errors to help debug
        >
          <SelectInput
            options={animeListStatuses}
          /> 
        </FormField>
      </form>
    </Form>
  )
}