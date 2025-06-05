import { Recipe } from '@/types';

export const sampleRecipes: Recipe[] = [
  {
    _id: '1',
    title: 'Tradiciniai cepelinai su mėsos įdaru',
    slug: 'tradiciniai-cepelinai-su-mesos-idaru',
    description: 'Autentiški lietuviški cepelinai su sultingu mėsos įdaru, patiekiami su spirgučiais ir grietine. Šis tradicinis receptas perduodamas iš kartos į kartą.',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop'
    ],
    prepTime: 60,
    cookTime: 45,
    totalTime: 105,
    servings: 6,
    difficulty: 'hard' as const,
    category: 'Tradiciniai patiekalai',
    tags: ['cepelinai', 'tradicinis', 'mėsa', 'bulvės', 'lietuviškas'],
    ingredients: [
      { name: 'Bulvės (šviežios)', amount: 2, unit: 'kg', notes: 'Geriau naudoti miltingas bulves' },
      { name: 'Bulvės (virtos)', amount: 500, unit: 'g', notes: 'Išvirtos ir atvėsintos' },
      { name: 'Kiaulienos mėsa', amount: 400, unit: 'g', notes: 'Pečių ar sprandas' },
      { name: 'Svogūnas', amount: 1, unit: 'vnt', notes: 'Vidutinio dydžio' },
      { name: 'Druska', amount: 1, unit: 'šaukštelis' },
      { name: 'Juodieji pipirai', amount: 0.5, unit: 'šaukštelis' },
      { name: 'Spirgučiai', amount: 100, unit: 'g' },
      { name: 'Grietinė', amount: 200, unit: 'ml', notes: '20% riebumo' }
    ],
    instructions: [
      { 
        step: 1, 
        text: 'Nulupkite šviežias bulves ir sutarkuokite smulkiu tarkuoju. Gerai išspauskite sultis per marles.',
        timer: 900
      },
      { 
        step: 2, 
        text: 'Virtas bulves sutarkuokite ir sumaišykite su šviežiomis. Įberkite druskos ir gerai išmaišykite.',
        timer: 300
      },
      { 
        step: 3, 
        text: 'Mėsą susmulkinkite mėsmalėje, pridėkite smulkiai supjaustytą svogūną, druską ir pipirus.',
        timer: 600
      },
      { 
        step: 4, 
        text: 'Iš bulvių tešlos formuokite plokščius apskritimus, į vidurį dėkite mėsos įdarą.',
        timer: 1200
      },
      { 
        step: 5, 
        text: 'Suvyniokite cepeliną ir gerai užlipinkite kraštus, kad įdaras neišbėgtų.',
        timer: 900
      },
      { 
        step: 6, 
        text: 'Verdančiame sūdytame vandenyje virkite 25-30 minučių. Cepelinai iškils į paviršių.',
        timer: 1800
      },
      { 
        step: 7, 
        text: 'Patiekite su spirgučiais ir grietine. Galite papuošti krapais.',
        timer: 300
      }
    ],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 45,
      fat: 16,
      fiber: 4,
      sugar: 3
    },
    author: {
      name: 'Ona Petraitienė',
      id: 'user1'
    },
    ratings: [],
    averageRating: 4.8,
    totalRatings: 127,
    comments: [],
    views: 2543,
    saves: 89,
    language: 'lt' as const,
    isPublished: true,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    seoTitle: 'Tradiciniai cepelinai - autentiškas lietuviškas receptas',
    seoDescription: 'Išmokite gaminti tikrus lietuviškus cepelinius su mėsos įdaru. Detalus receptas su nuotraukomis ir patarimais.'
  },
  {
    _id: '2',
    title: 'Šaltibarščiai su bulvėmis ir kiaušiniais',
    slug: 'saltibarsciai-su-bulvemis-ir-kiausiniais',
    description: 'Gaivūs vasaros šaltibarščiai su šviežiais burokėliais, bulvėmis ir kietai virtais kiaušiniais. Puikus pasirinkimas karštomis dienomis.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop'
    ],
    prepTime: 30,
    cookTime: 20,
    totalTime: 50,
    servings: 4,
    difficulty: 'easy' as const,
    category: 'Sriubos',
    tags: ['šaltibarščiai', 'vasara', 'gaivus', 'burokėliai', 'tradicinis'],
    ingredients: [
      { name: 'Šviežių burokėlių sultys', amount: 1, unit: 'l', notes: 'Galima naudoti konservuotas' },
      { name: 'Bulvės', amount: 4, unit: 'vnt', notes: 'Vidutinio dydžio' },
      { name: 'Kiaušiniai', amount: 4, unit: 'vnt' },
      { name: 'Agurkai', amount: 2, unit: 'vnt', notes: 'Šviežūs' },
      { name: 'Ridikėliai', amount: 5, unit: 'vnt' },
      { name: 'Žalieji svogūnai', amount: 3, unit: 'stiebai' },
      { name: 'Krapai', amount: 1, unit: 'pluoštas' },
      { name: 'Grietinė', amount: 200, unit: 'ml' },
      { name: 'Druska', amount: 1, unit: 'šaukštelis' }
    ],
    instructions: [
      { step: 1, text: 'Bulves išvirkite su žievele, atvėsinkite ir nulupkite. Supjaustykite kubeliais.', timer: 1200 },
      { step: 2, text: 'Kiaušinius virkite 10 minučių, atvėsinkite šaltame vandenyje ir nulupkite.', timer: 600 },
      { step: 3, text: 'Agurkus ir ridikėlius supjaustykite plonais griežinėliais.', timer: 300 },
      { step: 4, text: 'Žaliuosius svogūnus ir krapus smulkiai sukapokite.', timer: 180 },
      { step: 5, text: 'Į dubenį supilkite burokėlių sultis, pridėkite paruoštus daržoves.', timer: 120 },
      { step: 6, text: 'Įberkite druskos, gerai išmaišykite ir palikite šaldytuve 30 minučių.', timer: 1800 },
      { step: 7, text: 'Patiekite su grietine ir kietai virtais kiaušiniais.', timer: 60 }
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 25,
      fat: 6,
      fiber: 5,
      sugar: 18
    },
    author: {
      name: 'Marija Kazlauskienė',
      id: 'user2'
    },
    ratings: [],
    averageRating: 4.6,
    totalRatings: 89,
    comments: [],
    views: 1876,
    saves: 67,
    language: 'lt' as const,
    isPublished: true,
    isFeatured: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    seoTitle: 'Šaltibarščiai - tradicinis lietuviškas receptas',
    seoDescription: 'Gaivūs šaltibarščiai su burokėliais ir daržovėmis. Idealus vasaros patiekalas su detaliu receptu.'
  },
  {
    _id: '3',
    title: 'Bulvių kugelis su spirgučiais',
    slug: 'bulviu-kugelis-su-spirguciais',
    description: 'Tradicinis lietuviškas bulvių kugelis su auksiniu spirgučių sluoksniu. Šis patiekalas puikiai tinka šventiniams stalams ir šeimos susibūrimams.',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800&h=600&fit=crop'
    ],
    prepTime: 45,
    cookTime: 90,
    totalTime: 135,
    servings: 8,
    difficulty: 'medium' as const,
    category: 'Tradiciniai patiekalai',
    tags: ['kugelis', 'bulvės', 'tradicinis', 'šventinis', 'spirgučiai'],
    ingredients: [
      { name: 'Bulvės', amount: 3, unit: 'kg', notes: 'Miltingos bulvės' },
      { name: 'Kiaušiniai', amount: 4, unit: 'vnt' },
      { name: 'Pienas', amount: 200, unit: 'ml' },
      { name: 'Spirgučiai', amount: 200, unit: 'g' },
      { name: 'Svogūnas', amount: 2, unit: 'vnt', notes: 'Dideli' },
      { name: 'Druska', amount: 2, unit: 'šaukšteliai' },
      { name: 'Juodieji pipirai', amount: 1, unit: 'šaukštelis' },
      { name: 'Sviestas', amount: 50, unit: 'g', notes: 'Formai patepti' }
    ],
    instructions: [
      { step: 1, text: 'Bulves nulupkite ir sutarkuokite stambia tarka. Gerai išspauskite sultis.', timer: 900 },
      { step: 2, text: 'Svogūnus smulkiai supjaustykite ir apkepkite su spirgučiais iki auksinės spalvos.', timer: 600 },
      { step: 3, text: 'Kiaušinius išplakite su pienu, druska ir pipirais.', timer: 300 },
      { step: 4, text: 'Sumaišykite bulves su kiaušinių mišiniu ir pusę spirgučių.', timer: 300 },
      { step: 5, text: 'Patepkite formą sviestu ir supilkite masę. Viršų papuoškite likusiais spirgučiais.', timer: 300 },
      { step: 6, text: 'Kepkite 200°C orkaitėje 1,5 valandos, kol viršus taps auksinės spalvos.', timer: 5400 },
      { step: 7, text: 'Patiekite karštą su grietine arba spirgučiais.', timer: 180 }
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 38,
      fat: 14,
      fiber: 4,
      sugar: 5
    },
    author: {
      name: 'Aldona Jankauskas',
      id: 'user3'
    },
    ratings: [],
    averageRating: 4.7,
    totalRatings: 156,
    comments: [],
    views: 3421,
    saves: 134,
    language: 'lt' as const,
    isPublished: true,
    isFeatured: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    seoTitle: 'Bulvių kugelis - autentiškas lietuviškas receptas',
    seoDescription: 'Tradicinis bulvių kugelis su spirgučiais. Detalus receptas su patarimais sėkmingam gaminimui.'
  },
  {
    _id: '4',
    title: 'Lietuviška grybų sriuba su perliniais kruopomis',
    slug: 'lietuviska-grybu-sriuba-su-perliniais-kruopomis',
    description: 'Aromatinga grybų sriuba su perliniais kruopomis - puikus pasirinkimas šaltoms dienoms. Gaminama su džiovintais grybais ir šviežiomis daržovėmis.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop'
    ],
    prepTime: 20,
    cookTime: 60,
    totalTime: 80,
    servings: 6,
    difficulty: 'easy' as const,
    category: 'Sriubos',
    tags: ['grybai', 'sriuba', 'kruopos', 'šilta', 'tradicinis'],
    ingredients: [
      { name: 'Džiovinti grybai', amount: 50, unit: 'g', notes: 'Baravykai ar kiti' },
      { name: 'Šviežūs grybai', amount: 300, unit: 'g', notes: 'Pievagrybiai ar šampinjonai' },
      { name: 'Perliniai kruopos', amount: 150, unit: 'g' },
      { name: 'Bulvės', amount: 3, unit: 'vnt', notes: 'Vidutinio dydžio' },
      { name: 'Morkos', amount: 2, unit: 'vnt' },
      { name: 'Svogūnas', amount: 1, unit: 'vnt' },
      { name: 'Česnakų skiltelės', amount: 3, unit: 'vnt' },
      { name: 'Grietinė', amount: 200, unit: 'ml' },
      { name: 'Druska', amount: 1, unit: 'šaukštelis' },
      { name: 'Krapai', amount: 1, unit: 'pluoštas' }
    ],
    instructions: [
      { step: 1, text: 'Džiovintus grybus užpilkite šiltu vandeniu ir palikite 30 minučių.', timer: 1800 },
      { step: 2, text: 'Šviežius grybus, svogūną ir morkas supjaustykite kubeliais.', timer: 600 },
      { step: 3, text: 'Keptuvėje apkepkite svogūną ir morkas 5 minutes.', timer: 300 },
      { step: 4, text: 'Pridėkite grybus ir kepkite dar 5 minutes.', timer: 300 },
      { step: 5, text: 'Į puodą supilkite grybų sultį, pridėkite daržoves ir kruopas.', timer: 180 },
      { step: 6, text: 'Virkite 30 minučių, kol kruopos suminkštės.', timer: 1800 },
      { step: 7, text: 'Pridėkite grietinę, druską ir krapus. Virkite dar 5 minutes.', timer: 300 }
    ],
    nutrition: {
      calories: 220,
      protein: 8,
      carbs: 32,
      fat: 8,
      fiber: 6,
      sugar: 6
    },
    author: {
      name: 'Vytautas Petraitis',
      id: 'user4'
    },
    ratings: [],
    averageRating: 4.5,
    totalRatings: 78,
    comments: [],
    views: 1654,
    saves: 45,
    language: 'lt' as const,
    isPublished: true,
    isFeatured: false,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    seoTitle: 'Grybų sriuba su kruopomis - lietuviškas receptas',
    seoDescription: 'Aromatinga grybų sriuba su perliniais kruopomis. Šiltas ir sotus patiekalas šaltoms dienoms.'
  }
];
