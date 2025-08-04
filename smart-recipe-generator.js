const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class SmartRecipeGenerator {
  constructor() {
    this.visionClient = this.initializeVisionClient();
    this.lithuanianIngredients = this.loadLithuanianIngredients();
    this.cookingVerbs = this.loadCookingVerbs();
  }

  initializeVisionClient() {
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLOUD_CLIENT_EMAIL)}`
    };

    return new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });
  }

  loadLithuanianIngredients() {
    return [
      'svogūnas', 'česnakas', 'pomidorai', 'bulvės', 'morkos', 'kopūstai',
      'vištiena', 'kiauliena', 'jautiena', 'žuvis', 'kiaušiniai', 'pienas',
      'grietinė', 'sūris', 'sviestas', 'aliejus', 'druska', 'pipiras',
      'cukrus', 'miltai', 'ryžiai', 'makaronai', 'duona', 'medus',
      'citrina', 'obuoliai', 'mėlynės', 'braškės', 'agurkos', 'ridikėliai'
    ];
  }

  loadCookingVerbs() {
    return [
      'kepti', 'virti', 'troškinti', 'kepinti', 'skrudinti', 'blanšuoti',
      'marinuoti', 'pjaustykite', 'supjaustykite', 'smulkiai kapokite',
      'išmaišykite', 'sumaišykite', 'įdėkite', 'pridėkite', 'užpilkite',
      'paruoškite', 'įkaitinkite', 'atvėsinkite', 'patiekite'
    ];
  }

  async generateRecipeFromImage(imagePath) {
    console.log(`🔍 Processing image: ${path.basename(imagePath)}`);
    
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Extract text using Vision API
      console.log('📝 Extracting text with Google Vision API...');
      const [result] = await this.visionClient.textDetection({
        image: { content: imageBuffer }
      });

      const textAnnotations = result.textAnnotations;
      if (!textAnnotations || textAnnotations.length === 0) {
        throw new Error('No text detected in image');
      }

      const extractedText = textAnnotations[0].description;
      console.log(`✅ Extracted ${extractedText.length} characters`);

      // Parse the extracted text intelligently
      console.log('🧠 Parsing recipe components...');
      const parsedRecipe = this.parseRecipeText(extractedText);

      // Generate enhanced recipe JSON
      console.log('🎨 Generating enhanced recipe JSON...');
      const recipeJson = this.generateRecipeJson(parsedRecipe);

      return recipeJson;

    } catch (error) {
      console.error('❌ Error generating recipe:', error.message);
      throw error;
    }
  }

  parseRecipeText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const recipe = {
      title: '',
      ingredients: [],
      instructions: [],
      notes: [],
      prepTime: null,
      cookTime: null,
      servings: null,
      difficulty: 'vidutinis'
    };

    let currentSection = 'title';
    let instructionStep = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      
      // Skip image separators
      if (line.startsWith('===') && line.endsWith('===')) {
        continue;
      }

      // Extract title (first meaningful line that looks like a title)
      if (!recipe.title && this.looksLikeTitle(line)) {
        recipe.title = this.cleanTitle(line);
        continue;
      }

      // Extract timing information
      const timeInfo = this.extractTimeInfo(line);
      if (timeInfo.prepTime) recipe.prepTime = timeInfo.prepTime;
      if (timeInfo.cookTime) recipe.cookTime = timeInfo.cookTime;
      if (timeInfo.servings) recipe.servings = timeInfo.servings;

      // Detect section changes
      const sectionChange = this.detectSectionChange(line);
      if (sectionChange) {
        currentSection = sectionChange;
        continue;
      }

      // Parse based on current section
      if (currentSection === 'ingredients') {
        const ingredient = this.parseIngredient(line);
        if (ingredient) {
          recipe.ingredients.push(ingredient);
        }
      } else if (currentSection === 'instructions') {
        const instruction = this.parseInstruction(line, instructionStep);
        if (instruction) {
          recipe.instructions.push(instruction);
          instructionStep++;
        }
      } else if (currentSection === 'notes') {
        if (line.length > 10) {
          recipe.notes.push(line);
        }
      }
    }

    // Post-processing and validation
    this.validateAndCleanRecipe(recipe);
    
    return recipe;
  }

  looksLikeTitle(line) {
    // Skip obvious non-titles
    if (line.length < 3 || line.length > 80) return false;
    if (/^\d+/.test(line)) return false;
    if (line.toLowerCase().includes('reikės') || line.toLowerCase().includes('ingredientai')) return false;
    if (line.toLowerCase().includes('patarimai') || line.toLowerCase().includes('pastabos')) return false;
    if (line.toLowerCase().includes('marinatui') || line.toLowerCase().includes('padažui')) return false;
    if (line.includes('porcijoms') || line.includes('asmenims')) return false;
    if (line.includes('°C') || line.includes('min')) return false;
    if (line.includes('ml') || line.includes('kg') || line.includes(' g ')) return false;

    // Good title characteristics
    if (line === line.toUpperCase() && line.length > 8) return true; // All caps titles like "LISABONOS KIAULIENA"
    if (line.split(' ').length >= 2 && line.split(' ').length <= 6) return true; // 2-6 words

    // Should contain food-related words
    const foodWords = ['su', 'ir', 'receptas', 'patiekalas', 'sriuba', 'salotos', 'keptas', 'virtas', 'vištiena', 'kiauliena', 'žuvis'];
    const hasFood = foodWords.some(word => line.toLowerCase().includes(word));

    return hasFood;
  }

  cleanTitle(title) {
    return title
      .replace(/[^\w\sąčęėįšųūž-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  extractTimeInfo(line) {
    const info = { prepTime: null, cookTime: null, servings: null };
    
    // Extract preparation time
    const prepMatch = line.match(/(?:ruoš|prep|paruoš).*?(\d+)\s*min/i);
    if (prepMatch) info.prepTime = parseInt(prepMatch[1]);

    // Extract cooking time
    const cookMatch = line.match(/(?:kep|vir|cook|troš).*?(\d+)\s*min/i);
    if (cookMatch) info.cookTime = parseInt(cookMatch[1]);

    // Extract servings
    const servingMatch = line.match(/(\d+)\s*(?:porcij|žmonėms|asmenims|serving)/i);
    if (servingMatch) info.servings = parseInt(servingMatch[1]);

    return info;
  }

  detectSectionChange(line) {
    const lineLower = line.toLowerCase();
    
    if (lineLower.includes('reikės') || lineLower.includes('ingredientai') || lineLower.includes('produktai')) {
      return 'ingredients';
    }
    
    if (lineLower.includes('gaminimas') || lineLower.includes('ruošimas') || lineLower.includes('žingsniai')) {
      return 'instructions';
    }
    
    if (lineLower.includes('patarimai') || lineLower.includes('pastabos') || lineLower.includes('tips')) {
      return 'notes';
    }
    
    // Auto-detect instructions by numbered steps or cooking verbs
    if (/^\d+\./.test(line) || this.cookingVerbs.some(verb => lineLower.includes(verb))) {
      return 'instructions';
    }
    
    return null;
  }

  parseIngredient(line) {
    // Clean the line
    let cleaned = line
      .replace(/^[•⚫\-\*\d\.\s]+/, '')
      .trim();

    if (cleaned.length < 3) return null;

    // Skip lines that don't look like ingredients
    if (cleaned.toLowerCase().includes('papuošti') || cleaned.toLowerCase().includes('patiekti')) return null;
    if (cleaned.length > 100) return null; // Too long to be an ingredient

    // Try to separate quantity from ingredient name
    // Look for patterns like "700 g liesos kiaulienos" or "4 šaukštų alyvuogių aliejaus"
    const quantityMatch = cleaned.match(/^(\d+(?:[,\.]\d+)?\s*(?:kg|g|ml|l|šaukštų|šaukštelių|stiklainių|vnt\.?|skiltelių|lapų)?)\s+(.+)$/);

    let quantity = 'pagal skonį';
    let name = cleaned;

    if (quantityMatch) {
      quantity = quantityMatch[1].trim();
      name = quantityMatch[2].trim();
    } else {
      // Try simpler pattern for fractions like "1/2 raudonos aitriosios paprikos"
      const fractionMatch = cleaned.match(/^(\d+\/\d+)\s+(.+)$/);
      if (fractionMatch) {
        quantity = fractionMatch[1];
        name = fractionMatch[2].trim();
      }
    }

    // Clean up the name
    name = name.replace(/^(ir|bei)\s+/i, ''); // Remove "ir" or "bei" at start

    // Enhance ingredient name
    name = this.enhanceIngredientName(name);

    // Determine if vital ingredient
    const vital = this.isVitalIngredient(name);

    return {
      name: { lt: name },
      quantity: quantity,
      vital: vital
    };
  }

  enhanceIngredientName(name) {
    let enhanced = name.toLowerCase().trim();
    
    // Add descriptive words occasionally for common ingredients
    const enhancements = {
      'svogūnas': Math.random() > 0.6 ? 'vidutinio dydžio svogūnas' : 'svogūnas',
      'česnakas': Math.random() > 0.6 ? 'šviežias česnakas' : 'česnakas',
      'pomidorai': Math.random() > 0.6 ? 'sultingi pomidorai' : 'pomidorai',
      'aliejus': Math.random() > 0.6 ? 'aukštos kokybės aliejus' : 'aliejus',
      'druska': Math.random() > 0.6 ? 'jūros druska' : 'druska'
    };

    Object.keys(enhancements).forEach(key => {
      if (enhanced.includes(key)) {
        enhanced = enhanced.replace(key, enhancements[key]);
      }
    });

    return enhanced;
  }

  isVitalIngredient(name) {
    const nameLower = name.toLowerCase();
    
    // Main proteins and base ingredients are vital
    const vitalKeywords = [
      'vištiena', 'kiauliena', 'jautiena', 'žuvis', 'mėsa',
      'bulvės', 'ryžiai', 'makaronai', 'miltai',
      'svogūnas', 'česnakas', 'pomidorai'
    ];
    
    // Seasonings and garnishes are usually not vital
    const nonVitalKeywords = [
      'druska', 'pipiras', 'žolelės', 'petražolės', 'krapai',
      'papuošti', 'patiekti', 'pagardinti'
    ];
    
    if (nonVitalKeywords.some(keyword => nameLower.includes(keyword))) {
      return false;
    }
    
    return vitalKeywords.some(keyword => nameLower.includes(keyword)) || Math.random() > 0.3;
  }

  parseInstruction(line, stepNumber) {
    // Clean instruction text
    let cleaned = line
      .replace(/^\d+\.\s*/, '')
      .replace(/^[•\-\*]\s*/, '')
      .trim();
    
    if (cleaned.length < 10) return null;

    // Enhance instruction text
    cleaned = this.enhanceInstructionText(cleaned);
    
    // Generate step name from first few words
    const stepName = this.generateStepName(cleaned, stepNumber);

    return {
      step: stepNumber,
      name: { lt: stepName },
      text: { lt: cleaned }
    };
  }

  enhanceInstructionText(text) {
    // Improve instruction language for better readability
    const improvements = [
      { from: /^kepkite/i, to: 'kepame orkaitėje' },
      { from: /^virti/i, to: 'verdame' },
      { from: /^pjaustykite/i, to: 'supjaustome' },
      { from: /^maišykite/i, to: 'išmaišome' },
      { from: /^pridėkite/i, to: 'įdedame' },
      { from: /minutės/g, to: 'minučių' },
      { from: /laipsniai/g, to: '°C' }
    ];

    let enhanced = text;
    improvements.forEach(({ from, to }) => {
      enhanced = enhanced.replace(from, to);
    });

    return enhanced;
  }

  generateStepName(instruction, stepNumber) {
    const words = instruction.split(' ');
    const firstWords = words.slice(0, 3).join(' ');
    return `${stepNumber}. ${firstWords}`;
  }

  validateAndCleanRecipe(recipe) {
    // Set defaults if missing
    if (!recipe.title) recipe.title = 'Lietuviškas patiekalas';
    if (!recipe.prepTime) recipe.prepTime = 15;
    if (!recipe.cookTime) recipe.cookTime = 30;
    if (!recipe.servings) recipe.servings = 4;
    if (recipe.ingredients.length === 0) {
      recipe.ingredients.push({
        name: { lt: 'pagrindiniai ingredientai' },
        quantity: 'pagal receptą',
        vital: true
      });
    }
    if (recipe.instructions.length === 0) {
      recipe.instructions.push({
        step: 1,
        name: { lt: '1. Paruošimas' },
        text: { lt: 'Paruoškite ingredientus pagal receptą.' }
      });
    }
  }

  generateRecipeJson(parsedRecipe) {
    const slug = this.generateSlug(parsedRecipe.title);
    const seoData = this.generateSEOData(parsedRecipe);
    const totalTime = parsedRecipe.prepTime + parsedRecipe.cookTime;

    return {
      slug: slug,
      canonicalUrl: `https://ragaujam.lt/receptas/${slug}`,
      title: { lt: parsedRecipe.title },
      description: { lt: this.generateDescription(parsedRecipe) },
      seo: seoData,
      prepTimeMinutes: parsedRecipe.prepTime,
      cookTimeMinutes: parsedRecipe.cookTime,
      totalTimeMinutes: totalTime,
      timeCategory: this.getTimeCategory(totalTime),
      servings: parsedRecipe.servings,
      servingsUnit: "porcijos",
      difficulty: this.getDifficulty(parsedRecipe),
      primaryCategoryPath: this.inferPrimaryCategory(parsedRecipe),
      secondaryCategories: [],
      ingredients: this.shuffleNonVitalIngredients(parsedRecipe.ingredients),
      notes: this.generateNotes(parsedRecipe.notes),
      instructions: parsedRecipe.instructions,
      image: {
        src: `https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/${slug}.jpg`,
        alt: `${parsedRecipe.title} receptas`,
        width: 800,
        height: 600
      },
      tags: this.generateTags(parsedRecipe),
      author: {
        name: "ragaujam.lt",
        profileUrl: "https://ragaujam.lt"
      },
      status: "published",
      featured: false,
      trending: false,
      seasonal: [],
      sitemap: {
        priority: 0.8,
        changefreq: "monthly",
        lastmod: new Date().toISOString()
      },
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, match => {
        const map = { 'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z' };
        return map[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  generateDescription(recipe) {
    const mainIngredients = recipe.ingredients
      .filter(ing => ing.vital)
      .slice(0, 3)
      .map(ing => ing.name.lt)
      .join(', ');

    const templates = [
      `Skanaus ${recipe.title.toLowerCase()} receptas su ${mainIngredients}. Paprastas ir skanus patiekalas, kurį lengva paruošti namuose.`,
      `Tradicinis ${recipe.title.toLowerCase()} receptas. Naudojame ${mainIngredients} ir kitus natūralius produktus.`,
      `Naminis ${recipe.title.toLowerCase()} su ${mainIngredients}. Idealus pasirinkimas šeimai ar svečiams.`,
      `Autentiškas ${recipe.title.toLowerCase()} receptas. Pagrindinis ingredientas - ${recipe.ingredients[0]?.name.lt || 'kokybiški produktai'}.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateSEOData(recipe) {
    const keywords = this.generateKeywords(recipe);

    return {
      metaTitle: `${recipe.title} - Receptas | ragaujam.lt`,
      metaDescription: `${recipe.title} receptas su detaliais žingsniais. Lengvas ir skanus patiekalas namuose. ⭐ Išbandykite!`,
      keywords: keywords,
      recipeCategory: this.inferRecipeCategory(recipe),
      recipeCuisine: "Lietuviška",
      aggregateRating: {
        ratingValue: 4.5 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 50) + 15,
        bestRating: 5,
        worstRating: 1
      },
      nutrition: this.estimateNutrition(recipe)
    };
  }

  generateKeywords(recipe) {
    const titleWords = recipe.title.toLowerCase().split(' ');
    const ingredientWords = recipe.ingredients
      .slice(0, 5)
      .map(ing => ing.name.lt.toLowerCase().split(' ')[0]);

    const baseKeywords = [
      ...titleWords,
      ...ingredientWords,
      'receptas',
      'lietuviškas',
      'naminis',
      'skanus',
      'paprastas'
    ];

    return [...new Set(baseKeywords)].slice(0, 10);
  }

  inferRecipeCategory(recipe) {
    const title = recipe.title.toLowerCase();
    const ingredients = recipe.ingredients.map(ing => ing.name.lt.toLowerCase()).join(' ');

    if (title.includes('sriuba') || title.includes('sultinys')) return 'Sriubos';
    if (title.includes('salotos')) return 'Salotos';
    if (ingredients.includes('vištiena') || ingredients.includes('mėsa')) return 'Mėsos patiekalai';
    if (title.includes('pyragas') || title.includes('tortas')) return 'Desertai';
    if (title.includes('gėrimas') || title.includes('sultys')) return 'Gėrimai';

    return 'Pagrindinis patiekalas';
  }

  inferPrimaryCategory(recipe) {
    const category = this.inferRecipeCategory(recipe);
    const categoryMap = {
      'Sriubos': 'receptai/sriubos',
      'Salotos': 'receptai/salotos',
      'Mėsos patiekalai': 'receptai/mesa',
      'Desertai': 'receptai/desertai',
      'Gėrimai': 'receptai/gerimai',
      'Pagrindinis patiekalas': 'receptai/pagrindinis'
    };

    return categoryMap[category] || 'receptai/kita';
  }

  estimateNutrition(recipe) {
    let calories = 200;

    recipe.ingredients.forEach(ing => {
      const name = ing.name.lt.toLowerCase();
      if (name.includes('mėsa') || name.includes('vištiena')) calories += 150;
      if (name.includes('aliejus') || name.includes('sviestas')) calories += 100;
      if (name.includes('bulvės') || name.includes('ryžiai')) calories += 80;
      if (name.includes('daržovės')) calories += 30;
    });

    return {
      calories: Math.min(calories, 800),
      proteinContent: "15g",
      fatContent: "12g",
      fiberContent: "8g"
    };
  }

  getTimeCategory(totalMinutes) {
    if (totalMinutes <= 30) return 'Greiti patiekalai';
    if (totalMinutes <= 60) return 'Vidutinio sudėtingumo';
    return 'Ilgai ruošiami';
  }

  getDifficulty(recipe) {
    const instructionCount = recipe.instructions.length;
    const ingredientCount = recipe.ingredients.length;

    if (instructionCount <= 4 && ingredientCount <= 6) return 'lengvas';
    if (instructionCount <= 8 && ingredientCount <= 12) return 'vidutinis';
    return 'sunkus';
  }

  shuffleNonVitalIngredients(ingredients) {
    const vital = ingredients.filter(ing => ing.vital);
    const nonVital = ingredients.filter(ing => !ing.vital);

    // Shuffle non-vital ingredients
    for (let i = nonVital.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonVital[i], nonVital[j]] = [nonVital[j], nonVital[i]];
    }

    return [...vital, ...nonVital];
  }

  generateNotes(rawNotes) {
    if (!rawNotes || rawNotes.length === 0) {
      return [
        { text: { lt: 'Patiekalą galima paruošti iš anksto ir pašildyti prieš patiekiant.' }, priority: 1 },
        { text: { lt: 'Ingredientų kiekius galite koreguoti pagal skonį.' }, priority: 2 }
      ];
    }

    return rawNotes.map((note, index) => ({
      text: { lt: note.trim() },
      priority: index + 1
    }));
  }

  generateTags(recipe) {
    const tags = [];
    const title = recipe.title.toLowerCase();

    // Add cooking method tags
    if (title.includes('kep')) tags.push('keptas');
    if (title.includes('vir')) tags.push('virtas');
    if (title.includes('troš')) tags.push('troškintas');

    // Add main ingredient tags
    recipe.ingredients.slice(0, 3).forEach(ing => {
      const ingredient = ing.name.lt.toLowerCase();
      if (ingredient.includes('vištiena')) tags.push('vištiena');
      if (ingredient.includes('kiauliena')) tags.push('kiauliena');
      if (ingredient.includes('jautiena')) tags.push('jautiena');
      if (ingredient.includes('žuvis')) tags.push('žuvis');
    });

    // Add general tags
    tags.push('lietuviškas', 'naminis', 'skanus');

    return [...new Set(tags)].slice(0, 8);
  }
}

module.exports = SmartRecipeGenerator;
