/**
 * Custom analyzer that wraps an existing kuromojin tokenizer for use with Kuroshiro
 */
class CustomKuromojiAnalyzer {
  /**
   * Constructor
   * @param {Object} options 
   * @param {Tokenizer} options.tokenizer - An existing tokenizer instance from kuromojin
   */
  constructor(options) {
    this.tokenizer = options.tokenizer;
    this.initialized = false;
  }

  /**
   * Initialize the analyzer
   * @returns {Promise} Promise object represents the result of initialization
   */
  async init() {
    // Since we're using an existing tokenizer instance, there's no need to initialize it again
    // Just mark our analyzer as initialized
    this.initialized = true;
    return Promise.resolve();
  }

  /**
   * Parse the given string
   * @param {string} str - String to be analyzed
   * @returns {Promise} Promise object represents the result of parsing
   */
  async parse(str) {
    if (!this.initialized) {
      throw new Error("Analyzer is not initialized");
    }
    
    // Use the existing tokenizer to tokenize the string
    const tokens = this.tokenizer.tokenize(str);
    
    // Return the tokens directly - they already match the format Kuroshiro expects
    return tokens;
  }
}

export default CustomKuromojiAnalyzer;