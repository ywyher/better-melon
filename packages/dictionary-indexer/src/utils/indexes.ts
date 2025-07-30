import path from 'path'
import { CONFIG } from "../lib/config";
import { meili } from "../lib/meilisearch";
import type { IndexSettings } from "../types";
import type { Index } from "../types/indexes";
import { fileExists } from './utils';
import { existsSync } from 'fs';
import { rmdir } from 'fs/promises';
import { indexes } from '../lib/constants';

export async function createIndex(indexName: Index, data: any[], settings: IndexSettings) {
  console.log(`Creating ${indexName} index...`)
  const index = meili.index(indexName)
  
  await index.updateSettings(settings)
  console.log(`${indexName} index settings updated`)

  const addedDocument = await index.addDocuments(data, {
    primaryKey: 'id'
  })
  console.log("Documents added:", addedDocument)  
}

export async function getIndexExists(index: Index) {
  try {
    await meili.getIndex(index);
    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteIndex(index: Index): Promise<{
  success: boolean;
  deletedFiles: string[];
  errors: string[];
}> {
  const deletedFiles: string[] = [];
  const errors: string[] = [];
  
  const {
    folders: { downloads, extracts, dictionaries },
    files
  } = CONFIG;
  
  const fileConfig = files[index];
  
  if (!fileConfig) {
    errors.push(`Configuration not found for index: ${index}`);
    return { success: false, deletedFiles, errors };
  }

  try {
    console.log(`Deleting MeiliSearch index: ${index}`);
    try {
      await meili.deleteIndex(index);
      console.log(`✓ MeiliSearch index '${index}' deleted`);
    } catch (meiliError) {
      const errorMsg = `Failed to delete MeiliSearch index: ${meiliError}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    const { filename } = fileConfig;

    // 2. Delete files from different folders
    const filesToDelete = [
      path.join(downloads, `${filename}.zip`),
      path.join(extracts, `${filename}.json`),
      path.join(dictionaries, `${filename}.json`),
    ];

    // Delete individual files
    for (const filePath of filesToDelete) {
      try {
        const file = Bun.file(filePath)
        if (await file.exists()) {
          await file.delete();
          deletedFiles.push(filePath);
          console.log(`✓ Deleted file: ${filePath}`);
        }
      } catch (fileError) {
        const errorMsg = `Failed to delete file ${filePath}: ${fileError}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    if (fileConfig.useSubdirectory) {
      const subdirPath = path.join(extracts, filename);
      
      try {
        if (existsSync(subdirPath)) {
          await rmdir(subdirPath, { recursive: true });
          deletedFiles.push(subdirPath);
          console.log(`✓ Deleted directory: ${subdirPath}`);
        }
      } catch (dirError) {
        const errorMsg = `Failed to delete directory ${subdirPath}: ${dirError}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const hasErrors = errors.length > 0;
    if (hasErrors) {
      console.log(`⚠ Index '${index}' deletion completed with ${errors.length} error(s)`);
      console.log(`✓ Successfully deleted ${deletedFiles.length} file(s)/folder(s)`);
    } else {
      console.log(`✓ Index '${index}' and all associated files deleted successfully`);
    }

    return {
      success: !hasErrors,
      deletedFiles,
      errors
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const generalError = `Failed to delete index ${index}: ${errorMessage}`;
    console.error(generalError);
    errors.push(generalError);
    
    return {
      success: false,
      deletedFiles,
      errors
    };
  }
}

export async function deleteAllIndexes(): Promise<{
  success: boolean;
  results: Record<Index, { success: boolean; deletedFiles: string[]; errors: string[] }>;
}> {
  const results: Record<string, any> = {};
  let overallSuccess = true;

  console.log('Starting deletion of all indexes and associated files...\n');

  for (const index of indexes) {
    console.log(`--- Deleting ${index} ---`);
    const result = await deleteIndex(index);
    results[index] = result;
    
    if (!result.success) {
      overallSuccess = false;
    }
    console.log('');
  }

  console.log(overallSuccess ? 'All indexes deleted successfully' : 'Some indexes had deletion errors');
  
  return {
    success: overallSuccess,
    results: results as Record<Index, { success: boolean; deletedFiles: string[]; errors: string[] }>
  };
}