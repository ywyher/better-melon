import type { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { CONFIG } from "../lib/config";
import { downloadFile, extractArray, extractZip, getLatestIndexUrl, mergeBanks } from "./file";
import { createIndex, getIndexExists } from "./indexes";
import { addIncrementalIds, isRemoteFile, isLocalFile } from "./utils";
import type { OriginalNHKEntry } from "../types/nhk";
import type { Index } from "../types/indexes";
import type { ProcessingConfig } from "../types";
import { addExtraJMdictInfo } from "./jmdict";
import { editNHKStructure } from "./nhk";

export async function initializeDictionary(index: Index) {
  const { 
    folders: { downloads, extracts, dictionaries, dict },
    files,
    meilisearch: { indexes }
  } = CONFIG;
  
  const fileConfig = files[index];
  const indexConfig = indexes[index];

  if (!fileConfig || !indexConfig) {
    return {
      success: false,
      indexName: index,
      error: `Configuration not found for index: ${index}`
    };
  }

  try {
    const { name: indexName, settings } = indexConfig;
    if (await getIndexExists(indexName)) {
      console.log(`${index} index already exists, skipping`);
      return { success: true, indexName, documentCount: 0 };
    }

    const { filename } = fileConfig;
    let extractedData: unknown[];

    if (isRemoteFile(fileConfig)) {
      const { arrayToExtract } = fileConfig;
      const url = await getLatestIndexUrl(index);
      
      const downloadResult = await downloadFile({
        url, 
        filename, 
        extension: 'zip'
      });
      
      if (!downloadResult.success) {
        throw new Error(downloadResult.error || 'Download failed');
      }

      const extractResult = await extractZip({
        zipFilePath: `${downloads}${filename}.zip`,
        outputFilename: filename, 
        extension: 'json'
      });

      if (!extractResult.success) {
        throw new Error(extractResult.error || 'Extraction failed');
      }

      if(arrayToExtract) {
        extractedData = await extractArray({
          arrayKey: arrayToExtract, 
          jsonFilePath: `${extracts}${filename}.json`,
        });
      }else {
        extractedData = await Bun.file(`${extracts}${filename}.json`).json()
      }
    } else if (isLocalFile(fileConfig)) {
      const { mergeConfig } = fileConfig;
      
      const extractResult = await extractZip({
        zipFilePath: `${dict}${filename}.zip`,
        outputFilename: filename,
        useSubdirectory: fileConfig.useSubdirectory
      });
      
      if (!extractResult.success) {
        throw new Error(extractResult.error || 'Extraction failed');
      }
      
      if (fileConfig.requiresMerge && mergeConfig) {
        const mergeResults = await mergeBanks({
          extractedDir: mergeConfig.extractedDir,
          outputFilename: filename,
          flat: mergeConfig.flat
        });
        
        if (!mergeResults.success) {
          throw new Error(mergeResults.error || 'Merging failed');
        }
      }
      
      extractedData = await Bun.file(`${extracts}${filename}.json`).json();
    } else {
      throw new Error(`Invalid file configuration for ${index}`);
    }

    const processedData = processData(extractedData, fileConfig.processing);
    await Bun.write(
      `${dictionaries}${filename}.json`, 
      JSON.stringify(processedData)
    );
    await createIndex(index, processedData, settings);
    
    return { 
      success: true, 
      indexName,
      documentCount: processedData.length 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to setup ${index} index:`, errorMessage);
    
    return { 
      success: false, 
      indexName: index,
      error: errorMessage 
    };
  }
}


function processData(data: unknown[], config: ProcessingConfig): unknown[] {
  let processedData = data;

  switch (config.type) {
    case 'addExtraInfo':
      processedData = addExtraJMdictInfo(data as JMdictWord[]);
      break;
    case 'editStructure':
      processedData = editNHKStructure(data as OriginalNHKEntry[]);
      break;
    case 'none':
    default:
    break;
  }

  if (config.addIds && config.idField && config.startId) {
    processedData = addIncrementalIds(
      processedData as any[], 
      config.idField,
      config.startId
    );
  }
  return processedData;
}