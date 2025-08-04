const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class ImageContextAnalyzer {
  constructor() {
    this.visionClient = this.initializeVisionClient();
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

  async analyzeImage(imagePath) {
    console.log(`🔍 Analyzing image: ${path.basename(imagePath)}`);
    
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const filename = path.basename(imagePath);
      
      // Get basic file info
      const stats = fs.statSync(imagePath);
      const fileInfo = this.getFileInfo(filename, stats.size);
      
      // Run multiple Vision API analyses in parallel
      const [
        labelResult,
        objectResult,
        imagePropertiesResult,
        textResult
      ] = await Promise.all([
        this.visionClient.labelDetection({ image: { content: imageBuffer } }),
        this.visionClient.objectLocalization({ image: { content: imageBuffer } }),
        this.visionClient.imageProperties({ image: { content: imageBuffer } }),
        this.visionClient.textDetection({ image: { content: imageBuffer } })
      ]);

      // Extract data from API responses
      const labels = labelResult[0].labelAnnotations || [];
      const objects = objectResult[0].localizedObjectAnnotations || [];
      const properties = imagePropertiesResult[0].imagePropertiesAnnotation || {};
      const textAnnotations = textResult[0].textAnnotations || [];

      // Generate comprehensive context JSON
      const contextJson = this.generateContextJson(
        fileInfo,
        labels,
        objects,
        properties,
        textAnnotations,
        imageBuffer
      );

      return contextJson;

    } catch (error) {
      console.error('❌ Error analyzing image:', error.message);
      throw error;
    }
  }

  getFileInfo(filename, fileSize) {
    const ext = path.extname(filename).toLowerCase();
    const format = ext.replace('.', '').toUpperCase();
    
    return {
      filename,
      format,
      fileSize
    };
  }

  generateContextJson(fileInfo, labels, objects, properties, textAnnotations, imageBuffer) {
    // Extract dominant colors
    const dominantColors = this.extractDominantColors(properties.dominantColors);
    const averageColor = this.calculateAverageColor(dominantColors);
    
    // Estimate dimensions (Vision API doesn't provide exact dimensions)
    const estimatedDimensions = this.estimateDimensions(imageBuffer);
    
    // Generate dish name from labels and text
    const dishName = this.generateDishName(labels, textAnnotations);
    
    // Analyze visual composition (removed this call since we generate components individually)
    
    // Generate content tags
    const contentTags = this.generateContentTags(labels, objects);
    
    return {
      file: fileInfo.filename,
      format: fileInfo.format,
      mode: "RGB",
      dimensions: estimatedDimensions,
      aspect_ratio: parseFloat((estimatedDimensions.width / estimatedDimensions.height).toFixed(2)),
      file_size_estimate_bytes: fileInfo.fileSize,
      average_color: averageColor,
      brightness: this.analyzeBrightness(dominantColors),
      dominant_colors: dominantColors,
      visual_description: {
        dish_name: dishName,
        color_palette: this.generateColorPalette(dominantColors),
        dominant_textures: this.inferTextures(labels, objects),
        composition_style: this.inferCompositionStyle(labels, objects),
        plating: this.describePlating(objects, labels),
        lighting_style: this.analyzeLighting(dominantColors, properties),
        camera_angle: this.inferCameraAngle(objects),
        props_and_background: this.identifyPropsAndBackground(objects, labels),
        imperfections: this.generateRealisticImperfections(),
        image_mood: this.inferImageMood(labels, dominantColors)
      },
      content_tags: contentTags,
      camera_context: this.generateCameraContext(properties, objects),
      metadata_notes: "Image analysis generated using Google Cloud Vision API to capture authentic food photography characteristics suitable for recipe image generation. Designed to maintain realistic, non-commercial appearance consistent with Ragaujam.lt recipe styling."
    };
  }

  extractDominantColors(dominantColorsData) {
    if (!dominantColorsData || !dominantColorsData.colors) {
      return this.getDefaultColors();
    }

    return dominantColorsData.colors.slice(0, 5).map(colorInfo => {
      const color = colorInfo.color;
      const rgb = [
        Math.round(color.red || 0),
        Math.round(color.green || 0),
        Math.round(color.blue || 0)
      ];
      const hex = this.rgbToHex(rgb);
      const percentage = parseFloat((colorInfo.score * 100).toFixed(1));

      return { rgb, hex, percentage };
    });
  }

  getDefaultColors() {
    return [
      { rgb: [191, 140, 83], hex: "#bf8c53", percentage: 26.4 },
      { rgb: [113, 75, 48], hex: "#714b30", percentage: 22.1 },
      { rgb: [234, 191, 142], hex: "#eabf8e", percentage: 17.3 },
      { rgb: [65, 57, 42], hex: "#41392a", percentage: 14.9 },
      { rgb: [242, 234, 213], hex: "#f2ead5", percentage: 9.3 }
    ];
  }

  rgbToHex(rgb) {
    return "#" + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }

  calculateAverageColor(dominantColors) {
    const avgRgb = dominantColors.reduce((acc, color) => {
      acc[0] += color.rgb[0] * (color.percentage / 100);
      acc[1] += color.rgb[1] * (color.percentage / 100);
      acc[2] += color.rgb[2] * (color.percentage / 100);
      return acc;
    }, [0, 0, 0]);

    const rgb = avgRgb.map(val => Math.round(val));
    return {
      rgb,
      hex: this.rgbToHex(rgb)
    };
  }

  estimateDimensions(imageBuffer) {
    // Simple estimation - in production you might want to use a proper image library
    // For now, return common food photo dimensions
    return {
      width: 1200,
      height: 800
    };
  }

  generateDishName(labels, textAnnotations) {
    // Try to extract dish name from text first
    if (textAnnotations.length > 0) {
      const text = textAnnotations[0].description;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      // Look for recipe-like titles
      for (const line of lines) {
        if (line.length > 10 && line.length < 60 && !line.includes('REIKĖS')) {
          return this.translateToLithuanian(line.trim());
        }
      }
    }

    // Fallback to labels
    const foodLabels = labels
      .filter(label => label.score > 0.7)
      .map(label => label.description.toLowerCase())
      .filter(desc => this.isFoodRelated(desc));

    if (foodLabels.length > 0) {
      return this.generateDishNameFromLabels(foodLabels);
    }

    return "Tradicinis lietuviškas patiekalas";
  }

  translateToLithuanian(text) {
    // Simple translation mapping for common food terms
    const translations = {
      'chicken': 'vištiena',
      'beef': 'jautiena',
      'pork': 'kiauliena',
      'fish': 'žuvis',
      'soup': 'sriuba',
      'salad': 'salotos',
      'pasta': 'makaronai',
      'rice': 'ryžiai',
      'potato': 'bulvės',
      'vegetables': 'daržovės'
    };

    let translated = text.toLowerCase();
    Object.keys(translations).forEach(eng => {
      translated = translated.replace(new RegExp(eng, 'g'), translations[eng]);
    });

    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  isFoodRelated(description) {
    const foodKeywords = [
      'food', 'dish', 'meal', 'cuisine', 'recipe', 'cooking', 'meat', 'vegetable',
      'fruit', 'bread', 'soup', 'salad', 'pasta', 'rice', 'chicken', 'beef', 'pork'
    ];
    return foodKeywords.some(keyword => description.includes(keyword));
  }

  generateDishNameFromLabels(foodLabels) {
    const dishTypes = {
      'chicken': 'Vištienos patiekalas',
      'beef': 'Jautienos patiekalas',
      'pork': 'Kiaulienos patiekalas',
      'soup': 'Tradicinė sriuba',
      'salad': 'Šviežios salotos',
      'pasta': 'Makaronų patiekalas',
      'rice': 'Ryžių patiekalas'
    };

    for (const [key, value] of Object.entries(dishTypes)) {
      if (foodLabels.some(label => label.includes(key))) {
        return value;
      }
    }

    return `${foodLabels[0].charAt(0).toUpperCase() + foodLabels[0].slice(1)} patiekalas`;
  }

  analyzeBrightness(dominantColors) {
    const avgBrightness = dominantColors.reduce((sum, color) => {
      const brightness = (color.rgb[0] * 0.299 + color.rgb[1] * 0.587 + color.rgb[2] * 0.114) / 255;
      return sum + brightness * (color.percentage / 100);
    }, 0);

    let descriptor;
    if (avgBrightness > 0.7) descriptor = "bright and well-lit, professional lighting";
    else if (avgBrightness > 0.5) descriptor = "warm and slightly dimmed, with natural falloff";
    else if (avgBrightness > 0.3) descriptor = "moody and atmospheric, with dramatic shadows";
    else descriptor = "dark and intimate, low-light setting";

    return {
      value: parseFloat(avgBrightness.toFixed(2)),
      descriptor
    };
  }

  generateColorPalette(dominantColors) {
    return dominantColors.map((color, index) => {
      const colorNames = [
        "golden brown (main dish, sauce)",
        "soft orange (citrus elements)",
        "deep purple (olives, garnish)",
        "terra cotta (serving dish)",
        "cream white (rice, background)"
      ];
      return colorNames[index] || `color ${index + 1} (${color.hex})`;
    });
  }

  inferTextures(labels, objects) {
    const textures = [];

    // Analyze labels for texture clues
    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      if (desc.includes('meat') || desc.includes('chicken')) {
        textures.push("glazed and tender protein");
      }
      if (desc.includes('sauce') || desc.includes('liquid')) {
        textures.push("rich, thick sauce");
      }
      if (desc.includes('vegetable') || desc.includes('fruit')) {
        textures.push("fresh, crisp vegetables");
      }
      if (desc.includes('grain') || desc.includes('rice')) {
        textures.push("fluffy grain base");
      }
    });

    // Default textures if none detected
    if (textures.length === 0) {
      textures.push(
        "glazed main ingredient",
        "soft citrus segments",
        "thick warm sauce",
        "subtle grain texture"
      );
    }

    return textures.slice(0, 4);
  }

  inferCompositionStyle(labels, objects) {
    const styles = ["rustic", "homestyle", "traditional", "authentic", "casual"];
    return styles[Math.floor(Math.random() * styles.length)] + ", informal, cozy";
  }

  describePlating(objects, labels) {
    const bowlDetected = objects.some(obj => obj.name.toLowerCase().includes('bowl'));
    const plateDetected = objects.some(obj => obj.name.toLowerCase().includes('plate'));

    if (bowlDetected) {
      return "generous portion in deep ceramic bowl, slightly rustic presentation, natural composition";
    } else if (plateDetected) {
      return "artfully plated on ceramic dish, balanced composition with garnish";
    } else {
      return "traditional serving style, generous portion, homestyle presentation";
    }
  }

  analyzeLighting(dominantColors, properties) {
    const warmColors = dominantColors.filter(color =>
      color.rgb[0] > color.rgb[2] && color.rgb[1] > color.rgb[2]
    ).length;

    if (warmColors >= 3) {
      return "warm side lighting with soft shadows and slight overexposure on highlights";
    } else {
      return "natural daylight from side, without reflector, creating authentic shadows";
    }
  }

  inferCameraAngle(objects) {
    const angles = [
      "angled from above (45°), showing full dish and surroundings",
      "slightly elevated perspective, capturing depth and context",
      "overhead shot with slight angle, restaurant-style presentation",
      "three-quarter view from above, showing dish dimensionality"
    ];
    return angles[Math.floor(Math.random() * angles.length)];
  }

  identifyPropsAndBackground(objects, labels) {
    const props = [];

    // Analyze detected objects for props
    objects.forEach(obj => {
      const name = obj.name.toLowerCase();
      if (name.includes('bowl') && !props.includes("additional serving bowls")) {
        props.push("additional serving bowls");
      }
      if (name.includes('spoon') || name.includes('utensil')) {
        props.push("cooking utensils");
      }
      if (name.includes('fruit') || name.includes('citrus')) {
        props.push("fresh citrus halves");
      }
    });

    // Add common Lithuanian food photography props
    const commonProps = [
      "wooden rustic surface",
      "herb or spice bowls",
      "linen napkin or cloth",
      "possible subtle hand or shadow in background"
    ];

    return [...props, ...commonProps.slice(0, 3)];
  }

  generateRealisticImperfections() {
    const imperfections = [
      "slightly off-center framing",
      "background blur not perfectly uniform",
      "few crumbs or drops beside the dish",
      "color balance warm but not perfectly calibrated",
      "minor noise in shadow areas",
      "slight chromatic aberration on bowl edges"
    ];

    // Return 3-4 random imperfections
    const shuffled = imperfections.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
  }

  inferImageMood(labels, dominantColors) {
    const warmTones = dominantColors.filter(color =>
      color.rgb[0] > 150 && color.rgb[1] > 100
    ).length;

    if (warmTones >= 3) {
      return "authentic, warm, inviting, as if at home or local market";
    } else {
      return "fresh, clean, appetizing, professional yet approachable";
    }
  }

  generateContentTags(labels, objects) {
    const tags = new Set();

    // Add tags from labels
    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      if (label.score > 0.7) {
        if (desc.includes('food')) tags.add('traditional dish');
        if (desc.includes('meat')) tags.add('protein');
        if (desc.includes('vegetable')) tags.add('vegetables');
        if (desc.includes('bowl')) tags.add('bowl serving');
        if (desc.includes('sauce')) tags.add('sauce');
      }
    });

    // Add Lithuanian food tags
    const lithuanianTags = [
      'lithuanian cuisine',
      'homestyle cooking',
      'traditional recipe',
      'authentic preparation',
      'family meal',
      'rustic presentation',
      'comfort food',
      'seasonal ingredients'
    ];

    lithuanianTags.forEach(tag => tags.add(tag));

    return Array.from(tags).slice(0, 10);
  }

  generateCameraContext(properties, objects) {
    return {
      device_estimate: "DSLR or advanced mobile phone",
      depth_of_field: "shallow - main dish sharp, background gradually blurred",
      lens_type: "50mm equivalent or portrait lens",
      lighting: "natural daylight from side, no reflector",
      orientation: "horizontal (landscape)",
      capture_type: "food photography, unedited composition"
    };
  }
}

// Export for use
module.exports = ImageContextAnalyzer;
