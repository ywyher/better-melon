'use server'

import { AnkiPresetSchema } from "@/app/settings/anki/_components/anki-preset-form"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { AnkiPreset, ankiPreset, User } from "@/lib/db/schema"
import { generateId } from "better-auth"
import { and, count, eq, ne } from "drizzle-orm"
import { headers } from "next/headers"

export async function createPreset({ data }: { data: AnkiPresetSchema }) {
    let userId;
    const currentUser = await auth.api.getSession({
        headers: await headers()
    })
    
    userId = currentUser?.user.id;

    if(!currentUser) {
        const anon = await auth.api.signInAnonymous()
        
        if(!anon?.user) return {
            message: null,
            error: "Not authenticated nor were we able to authenticate you as an anonymous please register"
        }

        userId = anon.user.id
    }

    if(data.isDefault == true){
        await db.update(ankiPreset).set({
            isDefault: false,
            updatedAt: new Date()
        }).where(eq(ankiPreset.isDefault, true))
    }
    
    const id = generateId()
    
    const [createdPreset] = await db.insert(ankiPreset).values({
        id,
        name: data.name,
        deck: data.deck,
        model: data.model,
        fields: data.fields,
        isDefault: data.isDefault,
        isGui: data.isGui,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning()

    if(!createdPreset.id) return {
        message: null,
        error: "Coudn't create preset, please try again later"
    }

    return {
        message: "Preset created successfully",
        error: null
    }
}

export async function updatePreset({ 
  id, 
  data 
}: { 
  id: string; 
  data: AnkiPresetSchema 
}) {
  let userId;
  const currentUser = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!currentUser) {
    return {
      message: null,
      error: "Not authenticated. Please log in to update a preset."
    };
  }

  userId = currentUser.user.id;

  const [existingPreset] = await db.select().from(ankiPreset)
    .where(and(
        eq(ankiPreset.id, id),
        eq(ankiPreset.userId, userId)
    ));

  if (!existingPreset) {
    return {
      message: null,
      error: "Preset not found or you don't have permission to update it."
    };
  }

  if (data.isDefault === true) {
    await db.update(ankiPreset)
      .set({
        isDefault: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(ankiPreset.isDefault, true),
          eq(ankiPreset.userId, userId),
          ne(ankiPreset.id, id) // Don't update the current preset
        )
      );
  }else {
    const [anotherPreset] = await db.select().from(ankiPreset)
    .where(and(
        eq(ankiPreset.userId, userId),
        ne(ankiPreset.id, id)
    ))

    if (anotherPreset) {
      await db.update(ankiPreset)
        .set({
          isDefault: true,
          updatedAt: new Date()
        })
        .where(eq(ankiPreset.id, anotherPreset.id));
    }
  }
  
  const [updatedPreset] = await db.update(ankiPreset)
    .set({
      name: data.name,
      deck: data.deck,
      model: data.model,
      fields: data.fields,
      isDefault: data.isDefault,
      isGui: data.isGui,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(ankiPreset.id, id),
        eq(ankiPreset.userId, userId)
      )
    )
    .returning();

  if (!updatedPreset) {
    return {
      message: null,
      error: "Failed to update preset. Please try again later."
    };
  }

  return {
    message: "Preset updated successfully",
    error: null
  };
}

export async function deletePreset({ id }: { id: string }) {
  let userId;
  const currentUser = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!currentUser) {
    return {
      message: null,
      error: "Not authenticated. Please log in to delete a preset."
    };
  }

  userId = currentUser.user.id;

  const [existingPreset] = await db.select().from(ankiPreset)
    .where(and(
        eq(ankiPreset.id, id),
        eq(ankiPreset.userId, userId)
    ))

  if (!existingPreset) {
    return {
      message: null,
      error: "Preset not found or you don't have permission to delete it."
    };
  }

  const [presetCount] = await db.select({ count: count() })
    .from(ankiPreset)
    .where(eq(ankiPreset.userId, userId));
  
  if (presetCount.count <= 1) {
    return {
      message: null,
      error: "Cannot delete the only preset. Please create another preset first."
    };
  }

  if (existingPreset.isDefault) {
    const [anotherPreset] = await db.select().from(ankiPreset)
        .where(and(
            eq(ankiPreset.userId, userId),
            ne(ankiPreset.id, id)
        ))

    if (anotherPreset) {
      // Make another preset the default
      await db.update(ankiPreset)
        .set({
          isDefault: true,
          updatedAt: new Date()
        })
        .where(eq(ankiPreset.id, anotherPreset.id));
    }
  }

  await db.delete(ankiPreset)
    .where(
      and(
        eq(ankiPreset.id, id),
        eq(ankiPreset.userId, userId)
      )
    );

  return {
    message: "Preset deleted successfully",
    error: null
  };
}

export async function getPresets() {
    const presets = await db.select().from(ankiPreset)

    return presets
} 

export async function getPreset({ id }: { id: AnkiPreset['id'] }) {
    const [preset] = await db.select().from(ankiPreset).where(eq(ankiPreset.id, id))

    return preset
}

export async function getDefaultPreset() {
    const [preset] = await db.select().from(ankiPreset).where(eq(ankiPreset.isDefault, true))

    return preset
}