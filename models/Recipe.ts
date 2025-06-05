import mongoose, { Schema, Document } from 'mongoose';
import { Recipe as IRecipe, Ingredient, Instruction, NutritionInfo, Rating, Comment } from '@/types';

// Ingredient Schema
const IngredientSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  notes: { type: String },
  alternatives: [{ type: String }],
});

// Instruction Schema
const InstructionSchema = new Schema({
  step: { type: Number, required: true },
  text: { type: String, required: true },
  image: { type: String },
  timer: { type: Number }, // seconds
});

// Nutrition Schema
const NutritionSchema = new Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
});

// Rating Schema
const RatingSchema = new Schema({
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// Comment Reply Schema
const CommentReplySchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Comment Schema
const CommentSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  cookedIt: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  replies: [CommentReplySchema],
});

// Main Recipe Schema
const RecipeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  prepTime: { type: Number, required: true }, // minutes
  cookTime: { type: Number, required: true }, // minutes
  totalTime: { type: Number, required: true }, // minutes
  servings: { type: Number, required: true, min: 1 },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: { type: String, required: true },
  tags: [{ type: String }],
  ingredients: [IngredientSchema],
  instructions: [InstructionSchema],
  nutrition: { type: NutritionSchema, default: {} },
  author: {
    name: { type: String, required: true },
    id: { type: String },
  },
  ratings: [RatingSchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  language: { type: String, enum: ['lt', 'en'], default: 'lt' },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  seoTitle: { type: String },
  seoDescription: { type: String },
  structuredData: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Indexes for better performance
RecipeSchema.index({ slug: 1 });
RecipeSchema.index({ category: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ language: 1 });
RecipeSchema.index({ isPublished: 1 });
RecipeSchema.index({ isFeatured: 1 });
RecipeSchema.index({ averageRating: -1 });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ views: -1 });
RecipeSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to calculate total time
RecipeSchema.pre('save', function(next) {
  this.totalTime = this.prepTime + this.cookTime;
  next();
});

// Method to calculate average rating
RecipeSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc: number, rating: any) => acc + rating.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  this.totalRatings = this.ratings.length;
};

export interface RecipeDocument extends IRecipe, Document {
  calculateAverageRating(): void;
}

export default mongoose.models.Recipe || mongoose.model<RecipeDocument>('Recipe', RecipeSchema);
