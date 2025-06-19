# 🗂️ Categories & Navigation Menu Setup

This guide will help you implement the complete category navigation system for your Lithuanian recipe website.

## 📋 What Gets Created

### **1. Navigation Menu System**
- ✅ **Desktop Sidebar** - Visible on category/subcategory pages only
- ✅ **Mobile Menu** - Categories appear when hamburger menu is tapped
- ✅ **Expandable/Collapsible** - Main categories expand to show subcategories
- ✅ **No Icons/Counts** - Clean, performance-optimized design

### **2. Complete Categories Collection**
- ✅ **70+ Main Categories** from your `categ-subcateg.md`
- ✅ **50+ Subcategories** with proper hierarchy
- ✅ **SEO Optimized** - Meta titles, descriptions, keywords for each
- ✅ **Lithuanian Slugs** - No special characters, URL-friendly
- ✅ **Smart Filters** - Auto-generated based on category type

## 🚀 Installation Steps

### **Step 1: Create Categories Collection**

1. **Open MongoDB Compass**
2. **Connect to your database**
3. **Navigate to your database**
4. **Click the shell icon (">")** at bottom
5. **Copy and paste** entire content of `scripts/create-categories-collection.js`
6. **Press Enter** to execute

**Expected Output:**
```
🏗️ Creating comprehensive categories_new collection...
📊 Total categories to create: 70
📊 Total subcategories: 50
✅ Successfully created 120 categories!
📊 Main categories: 70
📊 Subcategories: 50
🚀 Your category menu is ready to use!
```

### **Step 2: Test the Navigation**

1. **Start your development server**: `npm run dev`
2. **Visit a category page**: `http://localhost:3000/receptai/karsti-patiekalai`
3. **Check desktop sidebar** - Should appear on left side
4. **Check mobile menu** - Tap hamburger, categories should appear
5. **Test expansion** - Click main categories to expand subcategories

## 📊 Category Structure Created

### **Main Category Groups:**

#### **🍽️ Patiekalų tipai (Dish Types)**
- Karštieji patiekalai → 8 subcategories
- Sriubos → 5 subcategories  
- Užkandžiai → 4 subcategories
- Salotos ir mišrainės → 3 subcategories
- Blynai ir vafliai → 4 subcategories
- Garnyrai → 4 subcategories

#### **🥩 Pagal ingredientą (By Ingredient)**
- Jautiena, Kiauliena, Žuvis, etc.
- Paukštiena → 3 subcategories
- Daržovės, Grybai, Bulvės, etc.

#### **🍰 Saldumynai (Desserts)**
- Desertai, Tortai, Sausainiai, etc.
- Pyragai → 2 subcategories

#### **🥗 Mitybos pasirinkimai (Dietary)**
- Vegetariški, Veganiški, Be glitimo, etc.

#### **⏰ Pagal laiką (By Time)**
- Iki 30 minučių, 30-60 minučių, etc.

#### **🎉 Proginiai (Occasions)**
- Kalėdoms, Velykoms, Gimtadieniui, etc.

#### **🌍 Pasaulio virtuvės (World Cuisines)**
- Lietuviška, Italų, Prancūzų, etc.

#### **🥤 Gėrimai (Drinks)**
- Nealkoholiniai → 3 subcategories
- Alkoholiniai kokteiliai

#### **🧂 Papildomai (Additional)**
- Padažai ir užpilai
- Konservavimas → 3 subcategories
- Ekonomiški receptai, etc.

## 🎯 SEO Features

### **Optimized Meta Data:**
```javascript
// Main Category Example
{
  metaTitle: "Karštieji patiekalai receptai - Paragaujam.lt",
  metaDescription: "Atraskite geriausius karštieji patiekalai receptus. Lengvi ir skanūs karštieji patiekalai patiekalai su nuotraukomis ir instrukcijomis kiekvienai dienai.",
  keywords: ["karštieji patiekalai", "karštieji patiekalai receptai", "lietuviški receptai", "maistas", "gaminimas"],
  canonicalUrl: "https://paragaujam.lt/receptai/karstieji-patiekalai"
}

// Subcategory Example  
{
  metaTitle: "Kepsniai ir troškiniai receptai - Karštieji patiekalai | Paragaujam.lt",
  metaDescription: "Geriausi kepsniai ir troškiniai receptai su nuotraukomis ir detaliais gaminimo instrukcijomis. Autentiški lietuviški ir tarptautiniai kepsniai ir troškiniai patiekalai.",
  keywords: ["kepsniai ir troškiniai", "kepsniai ir troškiniai receptai", "lietuviški receptai", "maistas", "gaminimas"],
  canonicalUrl: "https://paragaujam.lt/receptai/karstieji-patiekalai/kepsniai-ir-troskiniai"
}
```

### **Smart Filters Generated:**
- **Soups**: Karštos, Šaltos, Tirštos
- **Meat**: Kepsniai, Troškiniai, Orkaitėje  
- **Desserts**: Šokoladiniai, Su vaisiais, Kreminiai

## 🔧 Technical Implementation

### **URL Structure:**
```
/receptai/karsti-patiekalai              → Main category
/receptai/karsti-patiekalai/kepsniai     → Subcategory
```

### **Database Schema:**
```javascript
{
  path: "karsti-patiekalai/kepsniai",
  parentPath: "karsti-patiekalai", 
  level: 2,
  title: { lt: "Kepsniai ir troškiniai" },
  slug: "kepsniai-ir-troskiniai",
  seo: { /* SEO data */ },
  filters: { /* Smart filters */ },
  isActive: true
}
```

### **Performance Features:**
- ✅ **Indexed queries** for fast category loading
- ✅ **Lazy loading** - Categories load only when menu opens
- ✅ **Cached API responses** for better performance
- ✅ **Optimized slugs** without Lithuanian characters

## 🧪 Testing Checklist

### **Desktop Testing:**
- [ ] Sidebar appears on `/receptai/karsti-patiekalai`
- [ ] Sidebar hidden on `/receptas/recipe-slug`
- [ ] Sidebar hidden on `/receptai` main page
- [ ] Categories expand/collapse correctly
- [ ] Links navigate to correct URLs

### **Mobile Testing:**
- [ ] Hamburger menu shows categories
- [ ] Categories expand/collapse in mobile menu
- [ ] Menu closes when category is selected
- [ ] Responsive design works on small screens

### **SEO Testing:**
- [ ] Category pages have proper meta titles
- [ ] Canonical URLs are correct
- [ ] Breadcrumbs work properly
- [ ] No duplicate content issues

## 🎉 Success Metrics

After implementation, you should have:
- **120+ category pages** with unique SEO content
- **Hierarchical navigation** matching your content structure
- **Mobile-friendly menu** system
- **Performance-optimized** category loading
- **Lithuanian-focused** URL structure

Your Lithuanian recipe website now has a comprehensive, SEO-optimized category system! 🇱🇹🚀
