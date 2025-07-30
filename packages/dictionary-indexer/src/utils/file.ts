import yauzl from 'yauzl-promise'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { CONFIG } from '../lib/config'
import { clearLine, client, colors, createProgressBar, formatBytes } from '../lib/ky'
import type { Index } from '../types/indexes'
import type { GitHubAsset, GitHubRelease } from '../types/github'
import { getFilePath, isRemoteFile, validateExtension } from './utils'
import path from 'path'
import { readdir } from 'fs/promises'
import { fileExists, validateRequiredParams } from './utils'
import type { ProcessingResult } from '../types'

const { folders: { downloads, extracts } } = CONFIG

export async function downloadFile({ url, filename, extension } :{
  url: string,
  filename: string,
  extension: string,
}): Promise<ProcessingResult<string>> {
  validateRequiredParams({ url, filename, extension });
  validateExtension(extension)
  
  try {
    const filePath = getFilePath(downloads, filename, extension)
    if (await fileExists(filePath)) {
      console.log('File exists, using cached version');
      return {
        success: true,
        data: filePath
      };
    }

    console.log(`Downloading ${filename}.${extension}...`)
    const response = await client(url, {
      onDownloadProgress(progress) {
        const percent = Math.round(progress.percent * 100);
        const downloaded = formatBytes(progress.transferredBytes);
        const total = formatBytes(progress.totalBytes);
        const progressBar = createProgressBar(percent);
        
        // Clear the current line and write the progress
        clearLine();
        process.stdout.write(
          `${colors.cyan}Downloading:${colors.reset} ` +
          `${progressBar} ` +
          `${colors.bright}${percent}%${colors.reset} ` +
          `${colors.dim}(${downloaded} / ${total})${colors.reset}`
        );
        
        // Add a newline when download is complete
        if (percent === 100) {
          console.log(`\n${colors.green}✓ Download completed!${colors.reset}`);
        }
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.arrayBuffer()
    await Bun.write(filePath, data)

    return {
      success: true,
      data: filePath
    }
  } catch(error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Download failed: ${message}`,
      code: 'DOWNLOAD_ERROR'
    };
  }
}

export async function extractZip({ zipFilePath, extension, outputFilename, useSubdirectory = false }: {
  zipFilePath: string, 
  outputFilename?: string, 
  extension?: string,
  useSubdirectory?: boolean
}): Promise<ProcessingResult<string | string[]>> {
  validateRequiredParams({ zipFilePath });

  try {
    const fileBuffer = await Bun.file(zipFilePath).arrayBuffer()
    const zipBuffer = Buffer.from(new Uint8Array(fileBuffer));
  
    const zip = await yauzl.fromBuffer(zipBuffer)
    const extractedFiles: string[] = []
    let targetFilePath: string | null = null;

    // Determine base extraction path
    let baseExtractionPath = extracts;
    if (useSubdirectory && outputFilename) {
      baseExtractionPath = path.join(extracts, outputFilename);
      await mkdir(baseExtractionPath, { recursive: true });
    }

    for await (const entry of zip) {
      console.log(`Processing: ${entry.filename}`);
      
      // Skip directories
      if (entry.filename.endsWith('/')) {
        const dirPath = path.join(baseExtractionPath, entry.filename);
        await mkdir(dirPath, { recursive: true });
        continue;
      }

      // Extract to base path (subdirectory or root extracts)
      const fullPath = path.join(baseExtractionPath, entry.filename);
      
      // Create parent directory
      await mkdir(path.dirname(fullPath), { recursive: true });

      try {
        const readStream = await entry.openReadStream();
        const writeStream = createWriteStream(fullPath);
        await pipeline(readStream, writeStream);
        
        extractedFiles.push(fullPath);
        console.log(`✓ Extracted: ${entry.filename} -> ${fullPath}`);
        
        // If this matches what we're looking for, remember it
        if (extension && entry.filename.endsWith(`.${extension}`)) {
          targetFilePath = fullPath;
        }
      } catch (fileError) {
        console.warn(`✗ Failed to extract ${entry.filename}:`, fileError);
      }
    }
    
    await zip.close();
    
    if (extractedFiles.length === 0) {
      throw new Error('No files were extracted from the zip archive')
    }
    
    // Handle single file extraction with renaming
    if (extractedFiles.length === 1 && targetFilePath && !useSubdirectory) {
      if (!extension || !outputFilename) throw new Error("Missing params for single file extraction")
      validateExtension(extension)

      const desiredPath = getFilePath(extracts, outputFilename, extension);
      
      // Only rename if it's different from what we want
      if (targetFilePath !== desiredPath) {
        await Bun.write(desiredPath, Bun.file(targetFilePath));
        const file = Bun.file(targetFilePath);
        await file.delete()

        console.log(`✓ Renamed to: ${desiredPath}`);
        return {
          success: true,
          data: desiredPath
        };
      }
    }
    
    if (useSubdirectory || extractedFiles.length > 1) {
      return {
        success: true,
        data: extractedFiles
      }
    }
    
    // Single file case
    const resultPath = targetFilePath || extractedFiles[0] || "";
    return {
      success: true,
      data: resultPath
    }
  } catch(error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message)
    return {
      success: false,
      error: `Extraction failed: ${message}`,
      code: 'EXTRACTION_ERROR'
    };
  }
}

export async function mergeBanks({ 
  extractedDir, 
  outputFilename,
  flat = false 
}: {
  extractedDir: string;
  outputFilename: string;
  flat?: boolean;
}): Promise<ProcessingResult<string>> {
  validateRequiredParams({ extractedDir, outputFilename });
  
  try {
    const filePath = getFilePath(extracts, outputFilename, 'json')
    if (await fileExists(filePath)) {
      console.log('Merged file exists, using cached version');
      return {
        success: true,
        data: filePath
      };
    }

    const files = await readdir(extractedDir);
    
    const indexFile = files.find(file => file === 'index.json');
    let indexData = {};
    
    if (indexFile) {
      const indexPath = path.join(extractedDir, indexFile);
      indexData = await Bun.file(indexPath).json();
      console.log(`✓ Found index.json with ${Object.keys(indexData).length} properties`);
    } else {
      console.log('No index.json found, creating merged file without index data');
    }

    const bankFiles = files
      .filter(file => file.match(/.*(term|bank).*\.json$/))
      .sort((a, b) => {
        const numA = Number(a.match(/\d+/)?.[0] || '0');
        const numB = Number(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    if (bankFiles.length === 0) {
      throw new Error('No bank files found matching pattern: /.*(term|bank).*\.json$/');
    }

    console.log(`Found ${bankFiles.length} bank files to merge:`, bankFiles);

    const allEntries: unknown[] = [];
    for (const bankFile of bankFiles) {
      const bankPath = path.join(extractedDir, bankFile);
      try {
        const bankData = await Bun.file(bankPath).json();
        
        if (Array.isArray(bankData)) {
          allEntries.push(...bankData);
          console.log(`✓ Merged ${bankData.length} entries from ${bankFile}`);
        } else {
          console.warn(`⚠ ${bankFile} is not an array, skipping`);
        }
      } catch (error) {
        console.warn(`✗ Failed to read ${bankFile}:`, error);
      }
    }

    if (allEntries.length === 0) {
      throw new Error('No entries found in any bank files');
    }
    
    const mergedData = flat ? allEntries : {
      ...indexData,
      entries: allEntries
    };

    const outputPath = path.join(extracts, `${outputFilename}.json`);
    console.log(outputPath)
    
    await Bun.write(outputPath, JSON.stringify(mergedData, null, 2));
    
    console.log(`✓ Successfully merged ${allEntries.length} entries from ${bankFiles.length} banks`);
    console.log(`✓ Merged file saved to: ${outputPath}`);

    return {
      success: true,
      data: outputPath
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message)
    return {
      success: false,
      error: `Bank merge failed: ${message}`,
      code: 'MERGE_ERROR'
    };
  }
}

export async function extractArray({ arrayKey, jsonFilePath }: {
  arrayKey: string,
  jsonFilePath: string,
}): Promise<unknown[]> {
  validateRequiredParams({ arrayKey, jsonFilePath });

  try {
    if (!(await fileExists(jsonFilePath))) {
      throw new Error(`File not found: ${jsonFilePath}`);
    }
    
    const jsonData = await Bun.file(jsonFilePath).json()
    
    const extractedArray = jsonData[arrayKey];
    if (!Array.isArray(extractedArray)) {
      throw new Error(`Property '${arrayKey}' is not an array or doesn't exist in the JSON file`);
    }
    
    console.log(`Extracted ${extractedArray.length} items`);
    return extractedArray;
    
  } catch (error) {
    console.error('Error extracting array:', error);
    throw error;
  }
}

export async function getLatestIndexUrl(index: Index): Promise<string> {
  const { 
    github: { apiBaseUrl: githubBaseUrl, repositories: { jmdictSimplified } },
    files
  } = CONFIG;

  const fileConfig = files[index];
  
  if (!isRemoteFile(fileConfig)) {
    throw new Error(`Cannot get URL for local file: ${index}`);
  }

  const { fallbackUrl, match } = fileConfig;
  
  try {
    const release: GitHubRelease = await client(`${githubBaseUrl}/${jmdictSimplified}`).json();

    const asset: GitHubAsset | undefined = release.assets.find(asset => 
      asset.name.includes(match) && 
      asset.name.endsWith('.json.zip')
    );
    
    if (!asset) {
      console.warn(`Could not find ${match} JSON zip file in latest release, using fallback`);
      return fallbackUrl;
    }
    
    console.log(`Found latest release: ${release.tag_name}`);
    console.log(`Asset: ${asset.name}`);
    
    return asset.browser_download_url;
    
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
    console.log('Falling back to hardcoded URL...');
    return fallbackUrl;
  }
}