import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, UserPreferences, ShoppingListItem } from '@/types';

// Shopping List Item Schema
const ShoppingListItemSchema = new Schema({
  ingredient: { type: String, required: true },
  amount: { type: String, required: true },
  unit: { type: String, required: true },
  recipeId: { type: String, required: true },
  recipeName: { type: String, required: true },
  checked: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
});

// User Preferences Schema
const UserPreferencesSchema = new Schema({
  language: { type: String, enum: ['lt', 'en'], default: 'lt' },
  dietaryRestrictions: [{ type: String }],
  allergies: [{ type: String }],
  defaultServings: { type: Number, default: 2, min: 1 },
});

// Main User Schema
const UserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  name: { type: String, required: true, trim: true },
  image: { type: String },
  provider: { 
    type: String, 
    enum: ['google', 'facebook', 'email'],
    default: 'email'
  },
  providerId: { type: String },
  password: { type: String }, // Only for email registration
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  savedRecipes: [{ type: String }], // Recipe IDs
  shoppingList: [ShoppingListItemSchema],
  preferences: { type: UserPreferencesSchema, default: {} },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ providerId: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });

// Methods
UserSchema.methods.addToShoppingList = function(item: ShoppingListItem) {
  // Check if item already exists
  const existingItem = this.shoppingList.find(
    (listItem: any) => 
      listItem.ingredient === item.ingredient && 
      listItem.recipeId === item.recipeId
  );
  
  if (!existingItem) {
    this.shoppingList.push(item);
  }
  
  return this.save();
};

UserSchema.methods.removeFromShoppingList = function(itemId: string) {
  this.shoppingList = this.shoppingList.filter(
    (item: any) => item._id.toString() !== itemId
  );
  return this.save();
};

UserSchema.methods.toggleShoppingListItem = function(itemId: string) {
  const item = this.shoppingList.find(
    (listItem: any) => listItem._id.toString() === itemId
  );
  
  if (item) {
    item.checked = !item.checked;
  }
  
  return this.save();
};

UserSchema.methods.saveRecipe = function(recipeId: string) {
  if (!this.savedRecipes.includes(recipeId)) {
    this.savedRecipes.push(recipeId);
  }
  return this.save();
};

UserSchema.methods.unsaveRecipe = function(recipeId: string) {
  this.savedRecipes = this.savedRecipes.filter(
    (id: string) => id !== recipeId
  );
  return this.save();
};

UserSchema.methods.clearShoppingList = function() {
  this.shoppingList = [];
  return this.save();
};

export interface UserDocument extends IUser, Document {
  addToShoppingList(item: ShoppingListItem): Promise<UserDocument>;
  removeFromShoppingList(itemId: string): Promise<UserDocument>;
  toggleShoppingListItem(itemId: string): Promise<UserDocument>;
  saveRecipe(recipeId: string): Promise<UserDocument>;
  unsaveRecipe(recipeId: string): Promise<UserDocument>;
  clearShoppingList(): Promise<UserDocument>;
}

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
